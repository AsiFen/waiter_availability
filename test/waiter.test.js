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
      await db.none("TRUNCATE TABLE waiters");
      await db.none("TRUNCATE TABLE schedule");
    } catch (err) {
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
    let scheduleExists = await waiterDB.scheduleExists(waiterId.id)
    assert.strictEqual(scheduleExists, true);
  });

  it('should perform joinQuery and return waiters names and weekdays', async function () {

    await waiterDB.setWaiter('Yamisa');
    const yamisaID = await waiterDB.getWaiterId('Yamisa');
    let yamisaSelectedDays = ['Tuesday', 'Wednesday', 'Friday']
    for (let i = 0; i < yamisaSelectedDays.length; i++) {
      const day = yamisaSelectedDays[i];

      let weekday_id = await waiterDB.getWeekdayId(day)
      await waiterDB.createSchedule(yamisaID, weekday_id.id)
    }
    const results = await waiterDB.joinQuery();
    // console.log(results);
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


  it('should get a waiter ID', async function () {
    await waiterDB.setWaiter('sisi');
    const waiterId = await waiterDB.getWaiterId('sisi');
    assert.strictEqual(waiterId, 1);
  });

  it('should get all week days', async function () {
    const weekdays = await waiterDB.getWeekDays();
    assert.deepEqual(weekdays, [{ "weekday": "Monday" }, { "weekday": "Tuesday" }, { "weekday": "Wednesday" }, { "weekday": "Thursday" }, { "weekday": "Friday" }, { "weekday": "Saturday" }, { "weekday": "Sunday" }])
  });

  it('should reset the waiters table', async function () {
    await waiterDB.setWaiter('blair');
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
