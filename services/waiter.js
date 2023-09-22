export default function WaiterSchedule(WaiterDB) {
    let status;
    
    async function valid_waiterName(username) {
        let success_message = '';
        let error_message = '';
        let pattern = /^[a-zA-Z]+$/;

        if (username.match(pattern) && username !== undefined) {
            let isExisting = await WaiterDB.isExisting(username)
            if (isExisting.length == 0) {
                await WaiterDB.setWaiter(username);
                success_message = 'name added successfully!'
            } else {
                error_message = 'Username already exists!';
            }
        } else {
            error_message = 'Use alphanumeric values!';
        }

        return {
            success : success_message,
            errors : error_message
        }

    }

    async function days(selected, username) {
        let selectedDays = []
        if ((!Array.isArray(selected))) {
            selectedDays.push(selected)
            error_message = 'Select 3 days exactly!!';
        } else {
            selectedDays = selected
        }

        let daysLength = selectedDays.length;
        let isExisting = await WaiterDB.isExisting(username)
        // console.log(isExisting);
        if (isExisting) {

            if (daysLength === 3) {

                let waiter_id = await WaiterDB.getWaiterId(username);
                // Loop through the selected days and update hold2
                for (let i = 0; i < daysLength; i++) {
                    const day = selectedDays[i];

                    let weekday_id = await WaiterDB.getWeekdayId(day)
                    await WaiterDB.createSchedule(waiter_id, weekday_id.id)
                }

            } else if (daysLength < 3) {
            //    error_message = 'Please choose exactly 3 days';
            } else if (daysLength > 3) {
          //      error_message = 'Exceeded the expected number. Choose exactly 3 days';
            } else if (daysLength === 0) {
          //      error_message = 'Cannot leave blank! Please choose days';
            }
        }
    }

    async function getDays() {
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
         //   success = 'Days added successfully!';
        }

        return hold;
    }

    async function keepChecked(getDays, username, daysofweek) {
        let userLIst = getDays[username]
        if (userLIst != undefined) {
            for (let day in daysofweek) {
                daysofweek[day].checked = false;
                for (let userDay of userLIst) {
                    if (daysofweek[day].weekday == userDay) {
                        daysofweek[day].checked = true;
                    }
                }
            }
          //  success = 'Update successful!';
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

    async function daysToDelete(dayList) {
        if (!Array.isArray(dayList) || dayList.length === 0) {
        //    error_message = 'Please select 3 days'
        }

        // Construct a comma-separated list of quoted days to be deleted
        const daysToDelete = dayList.map(day => `'${day}'`).join(', ');
        // console.log(daysToDelete);
        // Use a SQL DELETE statement to remove the specified days from the "waiter" table
        await WaiterDB.deleteSelectedQuery(daysToDelete)
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