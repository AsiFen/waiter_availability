import pgPromise from 'pg-promise';
import dotenv from 'dotenv';
const d = process.env.DATABASE_URL
dotenv.config();

const connectPromise = {
    connectionString: process.env.DATABASE_URL,
    ssl: {rejectUnauthorized: false}
};

const db = pgPromise()(connectPromise);

db.connect();
//export the database
export default db;

// if (process.env.DATABASE_URL) {
//     console.log('DATABASE_URL is set:' + connectPromise.connectionString);
//   } else {
//     console.log('DATABASE_URL is not set.');
//   }