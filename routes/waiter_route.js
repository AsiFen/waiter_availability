export default function WaiterRoute(waiterSchedule, waiterDB) {
    async function getWaiter(req, res, waiterDB) {
        let username = req.body.username;

        const result = await waiterSchedule.valid_waiterName(username);
        // check if there is an eror message
        if (result.errors) {
            req.flash('errors', result.errors);
        }
        if (result.success) {
            req.flash('success', result.success);
        }

        res.redirect('/waiter/' + username)
    }

    async function selectDays(req, res, waiterDB) {
        let username = req.params.username;
        let checks = req.body.checks;
        let getDays = await waiterSchedule.getSelectedDaysForUser(username);
        let userList = getDays[username]

        if (userList) {
            req.flash('success', 'Update successful!');
            await waiterSchedule.daysToDelete(userList)
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
        
        const result = await waiterSchedule.keepChecked(getDays, username, daysofweek)
       

        res.render('waiter', {
            username,
            daysofweek,
            schedule: daysofweek,
            error_messages: error_message,
        });
    }

    return {
        getWaiter,
        selectDays,
        keepChecked
    }
}