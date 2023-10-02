export default function WaiterSchedule(WaiterDB) {
    let status;

    async function valid_waiterName(username) {
        let success_message = '';
        let valid_username = '';
        let error_message = '';
        let pattern = /^[a-zA-Z]+$/;

        if (username.match(pattern) && username !== undefined) {
            valid_username = username.toLowerCase()
            console.log(valid_username);
            let isExisting = await WaiterDB.isExisting(valid_username)
            if (isExisting.length == 0) {
                await WaiterDB.setWaiter(valid_username);
                success_message = 'name added successfully!'
            } else {
                success_message = `Welcome back ${valid_username}`;
            }
        } else {
            error_message = 'Use alphanumeric values!';
        }

        return {
            user: valid_username,
            success: success_message,
            errors: error_message
        }

    }

    async function days(selected, username) {
        let error_message = '';
        let success_message = '';
        let selectedDays = []
        if ((!Array.isArray(selected))) {
            selectedDays.push(selected)
            error_message = 'Select 3 days exactly!!';
        } else {
            selectedDays = selected
        }

        let daysLength = selectedDays.length;
        let isExisting = await WaiterDB.isExisting(username)
        if (isExisting) {

            if (daysLength == 3) {
                let waiter_id = await WaiterDB.getWaiterId(username);
                // Loop through the selected days and update hold2
                for (let i = 0; i < daysLength; i++) {
                    const day = selectedDays[i];

                    let weekday_id = await WaiterDB.getWeekdayId(day)
                    await WaiterDB.createSchedule(waiter_id, weekday_id.id)
                }
                success_message = 'successfully added';

            } else if (daysLength < 3) {
                error_message = 'Please choose exactly 3 days';
            } else if (daysLength > 3) {
                error_message = 'Exceeded the expected number. Choose exactly 3 days';
            } else if (daysLength === 0) {
                error_message = 'Cannot leave blank! Please choose days';
            }
            // else {
            //     success_message = 'successfully added';
            // }

        }
        return {
            success: success_message,
            errors: error_message
        }
    }

    async function getDays() {
        let success = '';
        let results = await WaiterDB.joinQuery();
        // console.log(results);
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
            // success = 'Days added successfully!';
        }

        return {
            success: success,
            data: hold
        }
    }

    async function keepChecked(getDays, username, daysofweek) {
        let userList = getDays[username]
        if (userList != undefined) {
            for (let day in daysofweek) {
                daysofweek[day].checked = false;
                for (let userDay of userList) {
                    if (daysofweek[day].weekday == userDay) {
                        daysofweek[day].checked = true;
                    }
                }
            }
        }
    }

    async function getSelectedDaysForUser(user_id) {
        let results = await WaiterDB.selectedDaysQuery(user_id);
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

    async function daysToDelete(dayList, username) {
        let error_message = '';
        if (!Array.isArray(dayList) || dayList.length === 0) {
             error_message = 'Please select 3 days'
        }

        // Construct a comma-separated list of quoted days to be deleted
        // const daysToDelete = dayList.map(day => `'${day}'`).join(', ');
        await WaiterDB.deleteSelectedQuery(dayList, username)

        return {
            errors: error_message
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

    function errors() {
        return (error_message ? error_message : '')
    }

    function getStatus() {
        return status;
    }

    function successMessage() {
        return (success ? success : false)
    }

    return {
        daysToDelete,
        getSelectedDaysForUser,
        valid_waiterName,
        getDays,
        getStatusColor,
        days,
        errors,
        getStatus,
        keepChecked,
        successMessage

    }
}