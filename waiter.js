
export default function WaiterSchedule(db) {
    let user_name;
    let status;
    let error_message = '';

    let hold = {
        'Monday': { waiters: [], status: '' },
        'Tuesday': { waiters: [], status: '' },
        'Wednesday': { waiters: [], status: '' },
        'Thursday': { waiters: [], status: '' },
        'Friday': { waiters: [], status: '' },
        'Saturday': { waiters: [], status: '' },
        'Sunday': { waiters: [], status: '' }
    };


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
            for (let i = 0; i < daysLength; i++) {
                const day = selectedDays[i];

                selectedDays.forEach(day => {
                    if (day && username != undefined) {
                        db.none('INSERT INTO checkedDays (waiter_name, day, isChecked VALUES($1, $2, $3)', [username, day, true])
                    }
                });

                if (hold[day]) {
                    await db.none('INSERT INTO waiters (username, weekday) VALUES ($1, $2)', [user_name, day]);
                    hold[day].waiters.push(user_name);
                    await db.none('INSERT INTO status (day, color) VALUES ($1,$2)', [day, getStatusColor(hold[day].waiters.length)])
                    hold[day].status = getStatusColor(hold[day].waiters.length); // Set status based on waiters count
                }
            }
        } else if (daysLength < 3) {
            error_message = 'Please choose exactly 3 days';
        } else if (daysLength > 3) {
            error_message = 'Exceeded the expected number. Choose exactly 3 days';
        } else if (daysLength === 0) {
            error_message = 'Cannot leave blank! Please choose days';
        }
    }

    async function getDays() {
        let results, color_result, getChecked;
        let daysofweek = Object.keys(hold)
        // console.log(daysofweek);
        for (let i = 0; i < daysofweek.length; i++) {
            if (daysofweek[i]) {
                results = await db.any('SELECT username FROM waiters WHERE weekday=$1', [daysofweek[i]])
                status = await db.any('SELECT color FROM status WHERE day=$1', [daysofweek[i]])
                getChecked = await db.any('SELECT day FROM checkedDays WHERE waiter_name = $1 AND isChecked = $2', ['', true])
                for (let j = 0; j < results.length; j++) {
                    // console.log(results[j].username); 
                    hold[daysofweek[i]].status = status[j].color;
                    hold[daysofweek[i]].waiters.push(results[j].username)
                }
            }
        }
        console.log(hold);
        return hold;
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

    function getUser() {
        return user_name;
    }

    async function getAllUsers() {
        return await db.any('SELECT DISTINCT username FROM waiters')
    }

    function errors() {
        return error_message
    }

    async function getStatus() {
        // let color_result = await db.one('SELECT color FROM status WHERE')
        return status;
    }
    return {
        valid_waiterName,
        getDays,
        getUser,
        getStatusColor,
        days,
        getAllUsers,
        isExisting,
        errors,
        getStatus
    }
}