const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI || "mongodb+srv://zizoramy82_db_user:K9Htf864RHIMu0Yh@khadamli-darasi.laxqh79.mongodb.net/?appName=khadamli-darasi";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    // ping admin
    const res = await client.db('admin').command({ ping: 1 });
    console.log('Ping successful:', res);
  } catch (err) {
    console.error('Connection failed:', err.message);
    process.exitCode = 1;
  } finally {
    try { await client.close(); } catch(e){}
  }
}

run().catch(e => { console.error(e); process.exit(1); });
