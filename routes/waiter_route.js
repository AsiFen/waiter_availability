export default function WaiterRoute(waiterSchedule, waiterDB) {
    async function getWaiter(req, res, waiterDB) {
        let username = req.body.username;

        const result = await waiterSchedule.valid_waiterName(username);
        // console.log(result);
        if (result.errors) {
            req.flash('errors', result.errors);
        }
        if (result.success) {
            req.flash('success', result.success);
        }

        res.redirect('/waiter/' + result.user)
    }

    async function selectDays(req, res, waiterDB) {
        let username = req.params.username;
        let checks = req.body.checks;
        let getDays = await waiterSchedule.getSelectedDaysForUser(username);
        let userList = getDays[username]
        console.log(checks, userList);
        if (checks.length === 3 && userList) {
            const isIdentical = userList.length === checks.length && userList.every((value, index) => value === checks[index]);
            if (!isIdentical) {
                req.flash('success', 'Update successful!');
            }
        
            // req.flash('success', 'Update successful!');
            await waiterSchedule.daysToDelete(userList, username)
        }
            const result = await waiterSchedule.days(checks, username)
            // check if there is an eror message
            if (result.errors) {
                req.flash('errors', result.errors);
            }
            if (result.success) {
                req.flash('success', result.success);
            }
        
        res.redirect('/waiter/' + username)
    }

    async function keepChecked(req, res) {
        const username = req.params.username;
        let getDays = await waiterSchedule.getSelectedDaysForUser(username);
        const daysofweek = await waiterDB.getWeekDays();
        let error_message = req.flash('errors')[0];

        await waiterSchedule.keepChecked(getDays, username, daysofweek)
        // if (result.success) {
        //     req.flash('success', result.success);
        // }
        let success_message = req.flash('success')[0];

        res.render('waiter', {
            username,
            daysofweek,
            schedule: daysofweek,
            error_messages: error_message,
            success_message

        });
    }

    return {
        getWaiter,
        selectDays,
        keepChecked
    }
}