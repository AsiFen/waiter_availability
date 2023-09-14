import assert from 'assert';
import WaiterDB from '../db/db_functions.js';
import WaiterSchedule from '../services/waiter.js';
import pgPromise from 'pg-promise';

const connectionString = 'postgresql://asisipho:asisipho123@localhost:5432/users';
const db = pgPromise()(connectionString);

describe('Database Functions', () => {
let waiterSchedule;
let waiterDB = WaiterDB();
waiterSchedule = WaiterSchedule(waiterDB);

  beforeEach(async function () {
    try {
      // clean the tables before each test run
      // await db.none("TRUNCATE TABLE waiters;");
      await db.none("TRUNCATE TABLE schedule;");

    } catch (err) {
      console.log(err);
      throw err;
    }
  });
  
  it('should add a valid waiter name', async () => {
    await waiterSchedule.valid_waiterName('John');
    const successMessage = waiterSchedule.successMessage();
    assert.strictEqual(successMessage, 'name added successfully!');
  });

  it('should not add an invalid waiter name', async () => {
    await waiterSchedule.valid_waiterName('123'); // Invalid name
    const errorMessage = waiterSchedule.errors();
    assert.strictEqual(errorMessage, 'Use alphanumeric values!');
  });

  it('should add 3 days for a waiter', async () => {
    const selectedDays = ['Monday', 'Wednesday', 'Friday'];
    await waiterSchedule.days(selectedDays, 'John');
    const successMessage = waiterSchedule.successMessage();
    assert.strictEqual(successMessage, 'Days added successfully!');
  });

  it('should get all the waiters names available', async function () {

  })

  it('should get the days of the week and all waiters available on that day', async function () {

  })

  it('waiter should add their name successfully', async function () {

  })
  it('should not take name that is not acceptable', async function () {

  })
  it('waiter should add 3 days only', async function () {

  })
  it('admin should reset the schedule', async function () {

  })

  after(function () {
    db.$pool.end;
  });

});
