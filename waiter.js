export default function WaiterSchedule(db) {
    let user_name;
    let holder = {};
    let hold = { 'Monday': [], 'Tuesday': [], 'Wednesday': [], 'Thursday': [], 'Friday': [], 'Saturday': [], 'Sunday': [] };

    function valid_waiterName(username) {
        // let pattern = /^[a-zA-Z]+$/
        // if (username.match(pattern)) {
        user_name = username;
        //     return true
        // }
    }

    // function add_days(days) {
    //     holder[user_name] = []
    //     if (holder[user_name] == undefined) {
    //         holder[user_name] = ''
    //     }
    //     holder[user_name] += days
    // }

    // async function days(days) {
    //     for (let i = 0; i < days.length; i++) {
    //         // hold[days[i]] = []
    //         if (hold[days[i]] == undefined) {
    //             hold[days[i]] = ''
    //         }
    //          db.any('INSERT INTO waiters (username, weekday) VALUES ($1, $2)', [user_name, days[i]])
    //         hold[days[i]] += user_name
    //     }
    // }

    async function days(days) {
        for (let i = 0; i < days.length; i++) {
            if (hold[days[i]]) {
                await db.any('INSERT INTO waiters (username, weekday) VALUES ($1, $2)', [user_name, days[i]]);
                hold[days[i]].push(user_name); // hold[days[i]] = [];
            }

        }
    }

    function getDays() {
        return hold
    }

    function getUser() {
        return user_name;
    }
    return {
        valid_waiterName,
        getDays,
        getUser,
        days
    }

}