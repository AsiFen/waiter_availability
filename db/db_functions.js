export default function WaiterDB(db) {

    async function isExisting(username) {
        const result = await db.any('SELECT username FROM waiters WHERE username = $1', [username]);
        return result;
    }

    async function getWeekdayId(day) {
        let weekday_id = await db.one('SELECT id FROM weekdays WHERE weekday=$1', [day])
        return weekday_id;
    }
    async function createSchedule(waiter_id, weekday_id) {
      await db.none('INSERT INTO schedule (waiter_id, weekday_id) VALUES ($1, $2)', [waiter_id, weekday_id])
    }

    async function joinQuery() {
        const daysQuery = `
                    SELECT  * FROM schedule
                    JOIN weekdays ON weekdays.id = schedule.weekday_id
                    JOIN waiters ON waiters.id = schedule.waiter_id
                `;

        const results = await db.any(daysQuery);
console.log(results);
        return results;
    }
    

    async function selectedDaysQuery(user_id) {
        const daysQuery = `
        SELECT  * FROM schedule
        JOIN weekdays ON weekdays.id = schedule.weekday_id
        JOIN waiters ON waiters.id = schedule.waiter_id
      `;

        let clause = '';
        if (user_id) {
            clause = ` WHERE waiters.username = '${user_id}'`;
        }

        const results = await db.any(daysQuery + clause);
        // console.log(results);
        return results;
    }

    async function deleteSelectedQuery(daysToDelete) {
        // Delete associated schedule records first
        await db.none(`
            DELETE FROM schedule
            WHERE waiter_id IN (
                SELECT id
                FROM waiters
                WHERE id IN (
                    SELECT DISTINCT waiters.id
                    FROM waiters
                    JOIN schedule ON waiters.id = schedule.waiter_id
                    JOIN weekdays ON schedule.weekday_id = weekdays.id
                    WHERE weekdays.weekday IN (${daysToDelete})
                )
            )
        `);

        // Now you can safely delete the waiter records
        await db.none(`
            DELETE FROM waiters
            WHERE id IN (
                SELECT DISTINCT waiters.id
                FROM waiters
                JOIN schedule ON waiters.id = schedule.waiter_id
                JOIN weekdays ON schedule.weekday_id = weekdays.id
                WHERE weekdays.weekday IN (${daysToDelete})
            )
        `);
    }


    async function getWaiterId(username) {
        const result = await db.one('SELECT id FROM waiters WHERE username = $1', [username]);

        if (result) {
            return result.id;
        }
        else {
            // Handle the case where the username is not found
            return '';
        }
    }

    async function getWeekDays() {
        let results = await db.many('SELECT weekday FROM weekdays');
        return results;
    }

    async function getAllUsers() {
        let result = await db.any('SELECT DISTINCT username FROM waiters')
        return result.username;
    }

    async function reset() {
        
        await db.none('DELETE FROM waiters')
    }

    async function setWaiter(user_name) {
        // console.log('1', user_name);
        await db.none('INSERT INTO waiters (username) VALUES ($1)', [user_name])
    }
    async function scheduleExists(waiterId) {
      let result = await db.any("SELECT id FROM schedule WHERE waiter_id = $1", [waiterId]);
      return (result ? true: false)
    }
    return {
        scheduleExists,
        isExisting,
        getWeekdayId,
        createSchedule,
        joinQuery,
        selectedDaysQuery,
        deleteSelectedQuery,
        getWaiterId,
        getWeekDays,
        reset,
        setWaiter,
        getAllUsers
    }
}