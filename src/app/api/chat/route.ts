import { StreamingTextResponse, LangChainStream } from 'ai';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { vectorStore } from 'utils/openai'; // Corrected import statement
import { NextResponse } from 'next/server';
import { MongoClient } from "mongodb";
import { geolocation } from '@vercel/functions';
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
  role: 'user' | 'assistant'; // Updated to restrict role to specific string literals
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

        const geo = geolocation(req);
        let country = req.headers.get('x-vercel-ip-country') || 'SG';

        if (process.env.DEBUG) {
            coordinates.lat = "1.346300";
            coordinates.long = "103.899612"; // Fixed the longitude assignment
        } else {
            coordinates.lat = geo.latitude ?? "0.0";
            coordinates.long = geo.longitude ?? "0.0";
        }

        let prompt = `You are a travel guide who knows places near to the latitude ${coordinates.lat} and longitude ${coordinates.long} in country ${country}. If there are questions where there is no mention of distance or travel time, then use a default of 2 kilometers. If there are places, then always return a CSS blue underlined google.com result hyperlink of the places which open the link in a new tab. The text of the places hyperlink should always be "Open in Google". Each location should have a suitable emoji if possible. Also return an estimated distance in km for each place from my current location which is in latitude and longitude. Arrange the results from nearest to the furthest.`;

        const question = messages[messages.length - 1].content;

        const retriever = vectorStore().asRetriever({ 
            "searchType": "mmr", 
            "searchKwargs": { "fetchK": 10, "lambda": 0.5 } 
        });

        const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY
        });

        let ai_messages: Message[] = [
          {
              role: "user",
              content: question
          },
          ...messages as Message[] // Ensure messages are treated as Message[]
        ];
        console.log('prompt:', prompt);
        console.log('messages', ai_messages);
        const anthropic_stream = await anthropic.messages.stream({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 4096,
            temperature: 0.8,
            system: prompt,
            messages: ai_messages
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
    } catch (e) {
        console.error('Error processing request:', e); // Log the actual error
        return NextResponse.json({ message: 'Error Processing' }, { status: 500 });
    }
}
