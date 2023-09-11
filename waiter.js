
export default function WaiterSchedule(db) {
    let user;
    let status;
    let error_message = '';

    async function isExisting(username) {
        const result = await db.oneOrNone('SELECT username FROM waiters WHERE username = $1', [username]);
        return result !== null;
    }

    async function valid_waiterName(username) {
        let pattern = /^[a-zA-Z]+$/;

        if (username.match(pattern) && username !== undefined) {
            if (await isExisting(username)) {
                error_message = 'Username already exists!';
            } else {
                await setWaiter(username);
            }
        } else {
            error_message = 'Use alphanumeric values!';
        }
    }

    async function days(selected, username) {
        let selectedDays = []
        if ((!Array.isArray(selected))) { 
            selectedDays.push(selected)
            error_message = 'Select 3 days exactly!!'
        } else {
            selectedDays = selected
            console.log(selectedDays);
        }

        let daysLength = selectedDays.length;

        if (valid_waiterName(username)) {

            if (daysLength === 3) {

                let waiter_id = await getWaiterId(username);
                // Loop through the selected days and update hold2
                for (let i = 0; i < daysLength; i++) {
                    const day = selectedDays[i];

                    let weekday_id = await db.one('SELECT id FROM weekdays WHERE weekday=$1', [day])
                    db.none('INSERT INTO schedule (waiter_id, weekday_id) VALUES ($1, $2)', [waiter_id, weekday_id.id])
                }

            } else if (daysLength < 3) {
                error_message = 'Please choose exactly 3 days';
            } else if (daysLength > 3) {
                error_message = 'Exceeded the expected number. Choose exactly 3 days';
            } else if (daysLength === 0) {
                error_message = 'Cannot leave blank! Please choose days';
            }
        }
    }

    async function getDays() {
        const daysQuery = `
                    SELECT  * FROM schedule
                    JOIN weekdays ON weekdays.id = schedule.weekday_id
                    JOIN waiters ON waiters.id = schedule.waiter_id
                `;

        const results = await db.any(daysQuery);
        const hold = {
            'Monday': { waiters: [], status: '' },
            'Tuesday': { waiters: [], status: '' },
            'Wednesday': { waiters: [], status: '' },
            'Thursday': { waiters: [], status: '' },
            'Friday': { waiters: [], status: '' },
            'Saturday': { waiters: [], status: '' },
            'Sunday': { waiters: [], status: '' },
        };

        for (const row of results) {
            const { weekday, username } = row;
            if (hold[weekday]) {
                hold[weekday].waiters.push(username);
                hold[weekday].status = getStatusColor(hold[weekday].waiters.length); // Set status based on waiters count
            }
        }
        return hold;
    }

    async function getSelectedDaysForUser(user_id) {
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

        const selectedDays = {};

        results.forEach((row) => {
            const username = row.username;
            const weekday = row.weekday;

            if (!selectedDays[username]) {
                selectedDays[username] = [];
            }

            if (row.id && !selectedDays[username].includes(weekday)) {
                selectedDays[username].push(weekday);
            }
        });

        return selectedDays;
    }

    async function daysToDelete(dayList) {
        if (!Array.isArray(dayList) || dayList.length === 0) {
            throw new Error('Invalid input: dayList should be a non-empty array of days.');
        }

        // Construct a comma-separated list of quoted days to be deleted
        const daysToDelete = dayList.map(day => `'${day}'`).join(', ');

        // Use a SQL DELETE statement to remove the specified days from the "waiter" table
        const deleteQuery = `
            DELETE FROM waiters 
            WHERE id IN (
                SELECT DISTINCT waiters.id 
                FROM waiters
                JOIN schedule ON waiters.id = schedule.waiter_id
                JOIN weekdays ON schedule.weekday_id = weekdays.id
                WHERE weekdays.weekday IN (${daysToDelete})
            )
        `;

        try {
            await db.none(deleteQuery);
            console.log(`Deleted ${dayList.length} days from the "waiter" table.`);
        } catch (error) {
            console.error(`Error deleting days from the "waiter" table: ${error.message}`);
            throw error;
        }
    }

    async function getWaiterId(username) {
        const result = await db.oneOrNone('SELECT id FROM waiters WHERE username = $1', [username]);
        if (result) {
            return result.id;
        }
        else {
            // Handle the case where the username is not found
            return '';
        }
    }

    function getStatusColor(waitersCount) {
        if (waitersCount === 0) {
            return 'rose'; // Set to 'rose' when no waiters
        } else if (waitersCount < 3) {
            return 'orange'; // Set to 'orange' when fewer than 3 waiters
        } else if (waitersCount === 3) {
            return 'green'; // Set to 'green' when 3 or more waiters
        }
        else if (waitersCount > 3) {
            return 'red'
        }
        else {
            return 'teal'
        }
    }
    async function getWeekDays() {
        let results = await db.many('SELECT weekday FROM weekdays');
        return results;
    }

    async function setWaiter(user_name) {
        user = user_name;
        await db.none('INSERT INTO waiters (username) VALUES ($1)', [user_name])
    }
    function getUser() {
        return user;
    }

    async function getAllUsers() {
        let result = await db.any('SELECT DISTINCT username FROM waiters')
        return result.username;
    }

    function errors() {
        return error_message
    }

    function getStatus() {
        return status;
    }

    return {
        daysToDelete,
        getSelectedDaysForUser,
        valid_waiterName,
        getDays,
        getUser,
        getStatusColor,
        days,
        getWeekDays,
        getAllUsers,
        isExisting,
        errors,
        getStatus,
        setWaiter,
        getWaiterId
    }
}