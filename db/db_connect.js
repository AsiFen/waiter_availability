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
