
export default function WaiterSchedule(db) {
    let selected_days;
    let user_name;
    let status;
    let error_message = '';
    let hold2 = {}
    // let hold = {
    //     'Monday': { waiters: [], status: '' },
    //     'Tuesday': { waiters: [], status: '' },
    //     'Wednesday': { waiters: [], status: '' },
    //     'Thursday': { waiters: [], status: '' },
    //     'Friday': { waiters: [], status: '' },
    //     'Saturday': { waiters: [], status: '' },
    //     'Sunday': { waiters: [], status: '' }
    // };

    // function isExisting(user_name,) {
    //     console.log(getAllUsers());
    //     if (getAllUsers()) {
    //         valid_waiterName(user_name)
    //     }
    //     else {
    //         error_message = 'Username already exists!'
    //     }
    // }

    function valid_waiterName(username) {
        let pattern = /^[a-zA-Z]+$/

        if (username.match(pattern)) {
            user_name = username;
            return true
        }
        else {
            error_message = 'Use alphanumeric values!'
        }
    }

    async function days(selectedDays, username) {
        selected_days = selectedDays;
        let daysLength = selectedDays.length;

        if (daysLength === 3) {
            let hold2 = {
                'Monday': false,
                'Tuesday': false,
                'Wednesday': false,
                'Thursday': false,
                'Friday': false,
                'Saturday': false,
                'Sunday': false
            };
            let waiter_id = await getWaiterId(username);
            // Loop through the selected days and update hold2
            for (let i = 0; i < daysLength; i++) {
                const day = selectedDays[i];
                if (hold2.hasOwnProperty(day)) {
                    hold2[day] = true;
                }
                // Now, hold2 will have true for selected days and false for others
                console.log(hold2);

                let weekday_id = await getWeekDayId(day)
                db.none('INSERT INTO schedule (waiter_id, weekday_id) VALUES ($1, $2)', [waiter_id, weekday_id.id])
            }

        } else if (daysLength < 3) {
            error_message = 'Please choose exactly 3 days';
        } else if (daysLength > 3) {
            error_message = 'Exceeded the expected number. Choose exactly 3 days';
        } else if (daysLength === 0) {
            error_message = 'Cannot leave blank! Please choose days';
        }

        return hold2;
    }
    async function getWeekDayId(weekday) {
        let result = await db.one('SELECT id FROM weekdays WHERE weekday=$1', [weekday])
        return result;
    }
    async function getDays() {
        const daysQuery = `
                    SELECT  * FROM schedule
                    JOIN waiters ON waiters.id = schedule.waiter_id
                    JOIN weekdays ON weekdays.id = schedule.weekday_id
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
        await db.none('INSERT INTO waiters (username) VALUES ($1)', [user_name])
    }
    function getUser() {
        return user_name;
    }

    async function getAllUsers() {
        let result = await db.any('SELECT DISTINCT username FROM waiters')
        return result.username;
    }

    function errors() {
        return error_message
    }

    function getStatus() {
        // let color_result = await db.one('SELECT color FROM status WHERE')
        return status;
    }

    function getSelectedDays() {
        return selected_days;
    }
    function checked() {
        return hold2
    }

    return {
        checked,
        getSelectedDays,
        valid_waiterName,
        getDays,
        getUser,
        getStatusColor,
        days,
        getWeekDays,
        getAllUsers,
        //   isExisting,
        errors,
        getWeekDayId,
        getStatus,
        setWaiter,
        getWaiterId
    }
}