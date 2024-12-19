import { StreamingTextResponse, LangChainStream } from 'ai';
import { ChatOpenAI } from 'langchain/chat_models/openai';

import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { vectorStore } from 'utils/openai'; // Corrected import statement
import { NextResponse } from 'next/server';
// import { BaseMemory } from "langchain/memory";
import { MongoClient } from "mongodb";
import { geolocation } from '@vercel/functions'
import { BufferMemory } from "langchain/memory";
import Anthropic from '@anthropic-ai/sdk';

const namespace = process.env.MONGODB_LOGS_NAMESPACE!;
const [dbName, collectionName] = namespace.split(".");

let mongoClient: MongoClient | null = null;
async function connectToDatabase() {
  if (!mongoClient) {
    mongoClient = new MongoClient(process.env.MONGODB_URI!);
    await mongoClient.connect();
  }
  return mongoClient.db(dbName);
}

async function logMessages(messages: Message[], debug: string | undefined) {
  if (debug) {
    return;
  }
  const db = await connectToDatabase();
  const collection = db.collection(collectionName);
  await collection.insertOne({ timestamp: new Date(), messages, debug });
}

interface Message {
  role: string;
  content: string;
}

interface Coordinates {
  lat: string;
  long: string;
}

export async function POST(req: Request) {
    try {
        const { stream, handlers } = LangChainStream();
        const body = await req.json();
        const messages: Message[] = body.messages ?? [];
        const debug: string | undefined = body.debug; // Extracting the debug variable
        let coordinates: Coordinates = {
            lat: "0.0",  // Replace with actual latitude
            long: "0.0"  // Replace with actual longitude
        };

        console.log('debug cookie:', debug);
        await logMessages(messages, debug); // Logging messages with debug
        console.log('body', body);

        const geo = geolocation(req);
        console.log('geo', geo);
        let country = req.headers.get('x-vercel-ip-country') || 'SG';
        console.log('country', country);
        coordinates.lat = geo.latitude ?? "0.0";
        coordinates.lat = geo.longitude ?? "0.0";

        let prompt = `You are a travel guide who knows places near to the latitude ${coordinates.lat} and longitude ${coordinates.long}. If there are questions where there is no mention of distance or travel time. Then use a default of 2 kilometers.` + "{{QUERY}}";
        // country = 'US'; // For testing purposes
        // if (country === 'SG') {
        //     prompt = ``;
        // } else {
        //   prompt = ``;
        // };

        const question = prompt.replace("{{QUERY}}", messages[messages.length - 1].content);

        console.log(`Received prompt: ${question}`);

        // const model = new ChatOpenAI({
        //     modelName: "gpt-3.5-turbo-1106",
        //     temperature: 0.8,
        //     streaming: true,
        //     callbacks: [handlers],
        //     presencePenalty: 0.5,
        // });

        const retriever = vectorStore().asRetriever({ 
            "searchType": "mmr", 
            "searchKwargs": { "fetchK": 10, "lambda": 0.5 } 
        })

        // First get the relevant documents from the retriever
        const relevantDocs = await retriever.getRelevantDocuments(question);
        
        // Format the retrieved documents as context
        let context = relevantDocs.map(doc => doc.pageContent).join('\n\n');

        // //const memory = new LimitedBufferMemory("chat_history", 10);
        // const conversationChain = ConversationalRetrievalQAChain.fromLLM(model, retriever, {
        //   memory: new BufferMemory({
        //     memoryKey: "chat_history",
        //   }),
        // })
        // conversationChain.invoke({
        //     "question": question
        // })

        // Create the stream with Anthropic
        const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY
          });
          
        context = '';
        const anthropic_stream = await anthropic.messages.stream({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 4096,
            temperature: 0.8,
            system: prompt + ". Use the following context to answer questions accurately:" + context,//"You are an AI assistant specializing in credit cards and MCCs.",
            messages: [
{
                    role: "user",
                    content: question
                }
            ]
        });
        const readableStream = new ReadableStream({
          async start(controller) {
              for await (const part of anthropic_stream) {
                  if (part.type === 'content_block_delta' && 'text' in part.delta) {
                      controller.enqueue(part.delta.text);
                  }
                  if (part.type === 'message_stop') {
                      controller.close();
                  }
              }
          },
      });


        return new StreamingTextResponse(readableStream);
    }
    catch (e) {
        return NextResponse.json({ message: 'Error Processing' }, { status: 500 });
    }
}
