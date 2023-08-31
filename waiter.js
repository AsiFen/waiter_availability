export default function WaiterSchedule() {
    let user_name;
    let holder = {};
    function valid_waiterName(username) {
        // let pattern = /^[a-zA-Z]+$/
        // if (username.match(pattern)) {
            user_name = username;
        //     return true
        // }
    }

    function add_days(days) {
        holder[user_name] = []
        if (holder[user_name] == undefined) {
            holder[user_name] = ''
        }
        holder[user_name] += days
    }

    function getDays() {
        return holder
    }

    function getUser() {
        return user_name;
    }
    return {
        valid_waiterName,
        add_days,
        getDays,
        getUser
    }
}