
export default function WaiterSchedule(db) {
    let user_name;
    let status;
    let error_message = '';

    // let hold = {
    //     'Monday': { waiters: [], status: '' },
    //     'Tuesday': { waiters: [], status: '' },
    //     'Wednesday': { waiters: [], status: '' },
    //     'Thursday': { waiters: [], status: '' },
    //     'Friday': { waiters: [], status: '' },
    //     'Saturday': { waiters: [], status: '' },
    //     'Sunday': { waiters: [], status: '' }
    // };

    function isExisting(user_name) {
        if (getAllUsers().includes(user_name)) {
            valid_waiterName(user_name)
        }
        else {
            error_message = 'Username already exists!'
        }
    }

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
        let daysLength = selectedDays.length;


        if (daysLength === 3) {

            let waiter_id = await getWaiterId(username);

            for (let i = 0; i < daysLength; i++) {
                const day = selectedDays[i];
                //          console.log(day);
                let weekday_id = await getWeekDayId(day)
                console.log(weekday_id);

                db.none('INSERT INTO schedule (waiter_id, weekday_id) VALUES ($1, $2)', [waiter_id.id, weekday_id.id])
                // selectedDays.forEach(day => {
                //     if (day && username != undefined) {
                //     }
                // });

                // if (hold[day]) {
                // await db.none('INSERT INTO waiters (username, weekday) VALUES ($1, $2)', [user_name, day]);
                //     hold[day].waiters.push(user_name);
                //     await db.none('INSERT INTO status (day, color) VALUES ($1,$2)', [day, getStatusColor(hold[day].waiters.length)])
                //     hold[day].status = getStatusColor(hold[day].waiters.length); // Set status based on waiters count
                // }
            }
        } else if (daysLength < 3) {
            error_message = 'Please choose exactly 3 days';
        } else if (daysLength > 3) {
            error_message = 'Exceeded the expected number. Choose exactly 3 days';
        } else if (daysLength === 0) {
            error_message = 'Cannot leave blank! Please choose days';
        }
    }
    async function getWeekDayId(weekday) {
        let result = await db.one('SELECT id FROM weekdays WHERE weekday=$1', [weekday])
        return result;
    }

    // async function getDays() {
    //     let results, getChecked;
    //     let daysofweek = Object.keys(hold)
    //     // console.log(daysofweek);
    //     for (let i = 0; i < daysofweek.length; i++) {
    //         if (daysofweek[i]) {
    //             results = await db.any('SELECT username FROM waiters WHERE weekday=$1', [daysofweek[i]])
    //             status = await db.any('SELECT color FROM status WHERE day=$1', [daysofweek[i]])
    //             for (let j = 0; j < results.length; j++) {
    //                 getChecked = await db.any('SELECT DISTINCT day FROM checkedDays WHERE waiter_name = $1 AND isChecked = $2', [results[j].username, true])
    //                 console.log(getChecked);
    //                 // console.log(results[j].username); 
    //                 console.log(status[j]);
    //                  hold[daysofweek[i]].status = status[j].color;
    //                 hold[daysofweek[i]].waiters.push(results[j].username)
    //             }
    //         }
    //     }
    //     // console.log(hold);
    //     return hold;
    // }
    async function getWaiterId(username) {
        let result = await db.one('SELECT id FROM waiters WHERE username = $1', [username])
        return result;
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
        return await db.many('SELECT weekday FROM weekdays');
    }

    async function setWaiter(user_name) {
        await db.none('INSERT INTO waiters (username) VALUES ($1)', [user_name])
    }
    function getUser() {
        return user_name;
    }

    // async function getAllUsers() {
    //     return await db.any('SELECT DISTINCT username FROM waiters')
    // }

    function errors() {
        return error_message
    }

    async function getStatus() {
        // let color_result = await db.one('SELECT color FROM status WHERE')
        return status;
    }
    return {
        valid_waiterName,
        // getDays,
        getUser,
        getStatusColor,
        days,
        getWeekDays,
        // getAllUsers,
        isExisting,
        errors,
        getWeekDayId,
        getStatus,
        setWaiter,
        getWaiterId
    }
}