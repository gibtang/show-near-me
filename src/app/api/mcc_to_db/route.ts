import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import dotenv from 'dotenv';

dotenv.config();

interface MerchantData {
    id: string;
    name: string;
    mcc: string;
}

export async function GET(): Promise<Response> {
    const mongoUri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DATABASE;
    const collectionName = process.env.MONGODB_MCC_NAMESPACE;

    if (!mongoUri || !dbName || !collectionName) {
        return NextResponse.json({ error: 'Database configuration is missing.' }, { status: 500 });
    }

    const client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const results: MerchantData[] = [];
    const filePath = path.join(process.cwd(), 'public', 'merchant_data_20241031_152616.csv');

    return new Promise((resolve) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data: MerchantData) => results.push(data))
            .on('end', async () => {
                await collection.deleteMany({});
                await collection.insertMany(results);
                await client.close();
                resolve(NextResponse.json({ message: 'Data stored successfully.' }));
            });
    });
}
