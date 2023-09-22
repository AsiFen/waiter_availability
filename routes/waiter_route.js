export default function WaiterRoute(waiterSchedule, waiterDB) {
    async function getWaiter(req, res, waiterDB) {
        let username = req.body.username;

        const result = await waiterSchedule.valid_waiterName(username);
        // check if there is an eror message
        if (result.errors) {
            req.flash('errors', result.message);
        }
        if (result.succes) {
            req.flash('success', result.message);
        }

        res.redirect('/waiter/' + username)
    }

    async function selectDays(req, res, waiterDB) {
        let username = req.params.username;
        let checks = req.body.checks;
        let getDays = await waiterSchedule.getSelectedDaysForUser(username);
        let userList = getDays[username]

        if (userList) {
            await waiterSchedule.daysToDelete(userList)
        }

        const result = await waiterSchedule.days(checks, username)

        res.redirect('/waiter/' + username)
    }

    async function keepChecked(req, res) {
        const username = req.params.username;
        let getDays = await waiterSchedule.getSelectedDaysForUser(username);
        const daysofweek = await waiterDB.getWeekDays();
        let error_message = req.flash('errors')[0];
        let success_message = req.flash('success')[0];

        await waiterSchedule.keepChecked(getDays, username, daysofweek)

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