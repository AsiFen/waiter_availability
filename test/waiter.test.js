import assert from 'assert';
import WaiterDB from '../db/db_functions';
import pgPromise from 'pg-promise';

const connectionString = process.env.DATABASE_URL || 'postgresql://asisipho:asisipho123@localhost:5432/users';
const db = pgPromise()(connectionString);

describe('Database Functions', () => {
  let waiterDB;

  before(() => {
    waiterDB = WaiterDB(db);
  });

  beforeEach(async () => {
    // You can add code here to reset or prepare the database for testing if needed.
  });


});
