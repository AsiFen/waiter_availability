export default function WaiterRoute(waiterSchedule, waiterDB) {

    async function getWaiter(req, res, waiterDB) {
        let username = req.body.username;

        await waiterSchedule.valid_waiterName(username);

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

        await waiterSchedule.days(checks, username)
    
        req.flash('errors', waiterSchedule.errors());
        req.flash('success', waiterSchedule.successMessage());

        res.redirect('/waiter/' + username)
    }

    async function keepChecked(req, res, waiterDB){
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