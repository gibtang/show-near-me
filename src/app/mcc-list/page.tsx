import { MongoClient } from 'mongodb';
import SearchableTable from './SearchableTable';
import NavBar from '../component/navbar'; // Importing NavBar
import dotenv from 'dotenv';

dotenv.config();

export const dynamic = 'force-static';

async function getMerchantData() {
  const mongoUri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DATABASE;
  const collectionName = process.env.MONGODB_MCC_NAMESPACE;

  if (!mongoUri || !dbName || !collectionName) {
    throw new Error('Database configuration is missing.');
  }

  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  const data = await collection.find({}).sort({ Store: 1 }).toArray();
  //console.log('Retrieved data from MongoDB:', data); // Log the retrieved data
  await client.close();

  // Convert data to plain objects
  return data.map(item => ({
    id: item._id.toString(), // Convert ObjectId to string
    Store: item.Store, // Ensure this matches the field name in the database
    MCC: item.MCC, // Ensure this matches the field name in the database
    Type: item.Type, // Ensure this matches the field name in the database
    // Add other fields as necessary
  }));
}

export default async function MCCPage() {
  const data = await getMerchantData();
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <NavBar /> {/* Including NavBar */}
        <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Merchant Data</h1>
        <SearchableTable data={data} />
        </div>
    </div>
  );
}
