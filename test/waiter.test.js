import assert from 'assert';
import WaiterDB from '../db/db_functions.js'; // Adjust the path accordingly
import pgPromise from 'pg-promise';

const connectionString = process.env.DATABASE_URL || 'postgresql://asisipho:asisipho123@localhost:5432/users';
const db = pgPromise()(connectionString);
const waiterDB = WaiterDB(db);

describe('Database Functions', () => {
  beforeEach(async function () {
    try {
      // clean the tables before each test run
      await db.none("TRUNCATE TABLE waiters RESTART IDENTITY CASCADE;");
      await db.none("TRUNCATE TABLE schedule RESTART IDENTITY CASCADE;");
    } catch (err) {
      console.log(err);
      throw err;
    }
  });

  it('should check if a waiter exists', async function () {
    await waiterDB.setWaiter('majola');
    const exists = await waiterDB.isExisting('majola');
    assert.deepEqual(exists,
      [{ username: 'majola' }]);
  });

  it('should get the weekday ID', async function () {
    const weekdayId = await waiterDB.getWeekdayId('Monday');
    assert.deepEqual(weekdayId, { id: 1 });
  });

  it('should create a schedule', async function () {
    await waiterDB.setWaiter('luzuko');
    const waiterId = await waiterDB.getWaiterId('luzuko');
    const weekdayId = await waiterDB.getWeekdayId('Monday');
    await waiterDB.createSchedule(waiterId, weekdayId.id);
    let scheduleExists = await waiterDB.scheduleExists(waiterId)
    assert.strictEqual(scheduleExists, true);
  });

  it('should perform joinQuery and return waiters names and weekdays', async function () {
    // Insert some test data into the database for testing

    // await waiterDB.setWaiter('Asiphe');
    // const asipheID = await waiterDB.getWaiterId('Asiphe');

    // await waiterDB.createSchedule(yamisaID, ['Tuesday', 'Wednesday', 'Friday']);
    // Loop through the selected days 
    await waiterDB.setWaiter('Yamisa');
    const yamisaID = await waiterDB.getWaiterId('Yamisa');
    let yamisaSelectedDays = ['Tuesday', 'Wednesday', 'Friday']
    for (let i = 0; i < yamisaSelectedDays.length; i++) {
      const day = yamisaSelectedDays[i];

      let weekday_id = await waiterDB.getWeekdayId(day)
      await waiterDB.createSchedule(yamisaID, weekday_id.id)
    }
    // await waiterDB.createSchedule(asipheID, ['Tuesday', 'Saturday', 'Sunday']);
    const results = await waiterDB.joinQuery();

    assert.strictEqual(results.length, 3);
    assert.deepEqual(results, [
      {
        id: 1,
        waiter_id: 1,
        weekday_id: 2,
        weekday: 'Tuesday',
        username: 'Yamisa'
      },
      {
        id: 1,
        waiter_id: 1,
        weekday_id: 3,
        weekday: 'Wednesday',
        username: 'Yamisa'
      },
      {
        id: 1,
        waiter_id: 1,
        weekday_id: 5,
        weekday: 'Friday',
        username: 'Yamisa'
      }
    ])
  });

  // it('should perform selectedDaysQuery and return results', async function () {
  //   const results = await waiterDB.selectedDaysQuery('testwaiter');
  //   // Add assertions based on your expected results
  // });

  // it('should delete selected days and associated schedules', async function () {
  //   await waiterDB.setWaiter('testwaiter');
  //   const waiterId = await waiterDB.getWaiterId('testwaiter');
  //   const weekdayId = await waiterDB.getWeekdayId('Monday');
  //   await waiterDB.createSchedule(waiterId, weekdayId);

  //   await waiterDB.deleteSelectedQuery(['Monday']);
  //   const scheduleExists = await db.oneOrNone("SELECT * FROM schedule WHERE waiter_id = $1 AND weekday_id = $2", [waiterId, weekdayId]);
  //   assert.strictEqual(scheduleExists, null);
  // });

  // it('should get a waiter ID', async function () {
  //   await waiterDB.setWaiter('testwaiter');
  //   const waiterId = await waiterDB.getWaiterId('testwaiter');
  //   assert.strictEqual(waiterId, 1); // Replace with the actual ID
  // });

  it('should get all week days', async function () {
    const weekdays = await waiterDB.getWeekDays();
    assert.deepEqual(weekdays, [{ "weekday": "Monday" }, { "weekday": "Tuesday" }, { "weekday": "Wednesday" }, { "weekday": "Thursday" }, { "weekday": "Friday" }, { "weekday": "Saturday" }, { "weekday": "Sunday" }])
  });

  it('should reset the waiters table', async function () {
    await waiterDB.setWaiter('mbuyi');
    await waiterDB.reset();
    const waitersCount = await db.one("SELECT count(*) FROM waiters");
    assert.deepEqual(waitersCount.count, 0);
  });

  it('should set a waiter', async function () {
    await waiterDB.setWaiter('reeva');
    const waiterId = await waiterDB.getWaiterId('reeva');
    assert.strictEqual(waiterId, 1);
  });

  after(function () {
    db.$pool.end;
  });
});
