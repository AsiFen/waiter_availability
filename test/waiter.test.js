import assert from 'assert';
import WaiterDB from '../db/db_functions.js'; // Adjust the path accordingly
import WaiterSchedule from '../services/waiter.js';
import pgPromise from 'pg-promise';

const connectionString = process.env.DATABASE_URL || 'postgresql://codex:codex123@localhost:5432/users';
const db = pgPromise()(connectionString);
const waiterDB = WaiterDB(db);
let waiterSchedule = WaiterSchedule(waiterDB);

describe('Database Functions', () => {
  beforeEach(async function () {
    try {
      // clean the tables before each test run
      await waiterDB.reset()
      await db.none('DELETE FROM waiters');

      await db.none('ALTER SEQUENCE waiters_id_seq RESTART WITH 1');

    } catch (err) {
      throw err;
    }
  });

  it('should return a success message when a user enters a valid name', async function () {
    const result = await waiterSchedule.valid_waiterName('Nick');

    assert.equal(result.success, 'name added successfully!');
  });

  it('should return an error message when a user enters an invalid name', async function () {
    const result = await waiterSchedule.valid_waiterName('N1ck1');

    assert.equal(result.errors, 'Use alphanumeric values!');
  });

  it('should return an error message when a user selects more than 3 days', async function () {
    const days = ['Monday', 'Wednesday', 'Friday', 'Saturday'];

    const result = await waiterSchedule.days(days, 'Zamani');

    assert.equal(result.errors, 'Exceeded the expected number. Choose exactly 3 days');
  });

  it('should return an error message when a user selects less than 3 days', async function () {
    const days = ['Monday', 'Wednesday'];

    const result = await waiterSchedule.days(days, 'thabo');

    assert.equal(result.errors, 'Please choose exactly 3 days');
  });

  it('should successfully schedule a user for 3 days', async function () {
    let message = '';
    await waiterDB.setWaiter('Yamisa');
    const yamisaID = await waiterDB.getWaiterId('Yamisa');

    const selectedDays = ['Monday', 'Wednesday', 'Friday'];

    for (let i = 0; i < selectedDays.length; i++) {
      const day = selectedDays[i];
      const weekday_id = await waiterDB.getWeekdayId(day);
      message = await waiterDB.createSchedule(yamisaID, weekday_id.id);
    }

    assert.deepEqual(message, 'Days added successfully!');

    // Optionally, you can also check other conditions or values as needed.
  });

  it('should get a waiter ID', async function () {
    await waiterDB.setWaiter('sisi');
    const waiterId = await waiterDB.getWaiterId('sisi');
    assert.strictEqual(waiterId, 1);
  });

  it('should get all week days', async function () {
    const weekdays = await waiterDB.getWeekDays();
    assert.deepEqual(weekdays, [{ "weekday": "Monday" }, { "weekday": "Tuesday" }, { "weekday": "Wednesday" }, { "weekday": "Thursday" }, { "weekday": "Friday" }, { "weekday": "Saturday" }, { "weekday": "Sunday" }])
  });

  after(function () {
    db.$pool.end;
  });
});
