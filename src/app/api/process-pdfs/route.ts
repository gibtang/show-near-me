import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { CharacterTextSplitter } from 'langchain/text_splitter';
import { MongoDBAtlasVectorSearch } from 'langchain/vectorstores/mongodb_atlas';
import { getEmbeddingsTransformer, searchArgs } from '../../../utils/openai';
import pdf from 'pdf-parse';
import { MongoClient } from "mongodb";

const directoryPath = process.env.RAG_DIRECTORY_PATH!;

export async function GET(request: Request) {
  try {
    const result = await processDirectory(directoryPath);
    return new NextResponse(JSON.stringify(result, null, 2), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ message: "An error occurred during processing." }, { status: 500 });
  }
}

interface ProcessingResult {
  status: number;
  message: string;
  file: string;
}

interface ProcessingSummary {
  message: string;
  details: ProcessingResult[];
}

async function processDirectory(directoryPath: string): Promise<ProcessingSummary> {
  const client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect(); // Ensure connection is established
  try {
    console.log("Starting to process directory:", directoryPath);
    await fs.access(directoryPath);
    console.log("Directory exists, reading files...");

    const allResults: ProcessingResult[] = [];
    const pdfFiles: string[] = [];

    // Move the recursive function outside to avoid strict mode error
    const findPDFsRecursively = async (currentPath: string) => {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);
        
        if (entry.isDirectory()) {
          console.log(`Found directory: ${fullPath}`);
          await findPDFsRecursively(fullPath);
        } else if (entry.isFile() && path.extname(entry.name).toLowerCase() === '.pdf') {
          console.log(`Found PDF: ${entry.name}`);
          pdfFiles.push(fullPath);
        }
      }
    };

    await findPDFsRecursively(directoryPath);
    console.log("Total PDF files found:", pdfFiles.length);

    if (pdfFiles.length === 0) {
      console.log("No PDF files found, returning early");
      return { message: "No PDF files found in the directory or its subdirectories", details: [] };
    }

    console.log("Connecting to MongoDB...");
    const namespace = process.env.MONGODB_NAMESPACE!;
    const [dbName, collectionName] = namespace.split(".");
    const collection = client.db(dbName).collection(collectionName);

    try {
      console.log("Attempting to delete existing documents...");
      const result = await collection.deleteMany({});
      console.log(`Successfully deleted ${result.deletedCount} documents`);
    } catch (error) {
      console.error("Error occurred while deleting documents:", error);
      throw error;
    }

    console.log("About to process files...");
    const results = await Promise.all(pdfFiles.map(async (filePath) => {
      console.log(`Processing file: ${filePath.replace(`${directoryPath}/`, '')}`);
      return await processFile(filePath);
    }));

    allResults.push(...results);

    const successCount = allResults.filter(r => r.status === 200).length;
    const failCount = allResults.filter(r => r.status !== 200).length;
    console.log(`Successful: ${successCount}, Failed: ${failCount}`);

    return {
      message: `Processed ${successCount} files successfully. ${failCount} files failed. Searched in directory and all subdirectories.`,
      details: allResults
    };

  } catch (error) {
    console.error('Error processing directory:', error);
    throw error;
  } finally {
    console.log("Closing MongoDB connection");
    await client?.close();
    console.log("MongoDB Connection closed====================");
  }
}

async function processFile(filePath: string): Promise<ProcessingResult> {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const { text: parsedText } = await pdf(dataBuffer);
    console.log(`Parsed text from ${filePath}:`, parsedText.substring(0, 100) + '...');

    const chunks = await new CharacterTextSplitter({
      separator: "\n",
      chunkSize: 1000,
      chunkOverlap: 100
    }).splitText(parsedText);
    console.log(`Number of chunks for ${filePath}:`, chunks.length);

    await MongoDBAtlasVectorSearch.fromTexts(
      chunks,
      [],
      getEmbeddingsTransformer(),
      searchArgs()
    );

    return { status: 200, message: "Processed and uploaded to MongoDB", file: filePath };
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return { status: 500, message: `Error processing file`, file: filePath };
  }
}
