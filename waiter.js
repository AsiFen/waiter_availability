export default function WaiterSchedule(db) {
    let user_name;
    let error_message = '';
    let hold = { 'Monday': [], 'Tuesday': [], 'Wednesday': [], 'Thursday': [], 'Friday': [], 'Saturday': [], 'Sunday': [] };

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

    async function days(days) {
        for (let i = 0; i < days.length; i++) {
            if (hold[days[i]]) {
                await db.any('INSERT INTO waiters (username, weekday) VALUES ($1, $2)', [user_name, days[i]]);
                hold[days[i]].push(user_name); // hold[days[i]] = [];
            }
        }
    }

    async function getDays() {
        let results;
        let daysofweek = Object.keys(hold)
        console.log(daysofweek);
        for (let i = 0; i < daysofweek.length; i++) {
            results = await db.any('SELECT username FROM waiters WHERE weekday=$1', [daysofweek[i]])
            hold[daysofweek[i]].push(results.name)
        }
        return hold;
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
    return {
        valid_waiterName,
        getDays,
        getUser,
        days,
        getAllUsers,
        isExisting,
        errors
    }
}