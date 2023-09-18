export default function AdminSchedule(waiterSchedule) {

    async function showSchedule(req, res) {
        let getDays = await waiterSchedule.getDays();

        req.flash('status', waiterSchedule.getStatus())
        let status_color = req.flash('status')[0];
        let resetMessage = req.flash('reset')[0]

        res.render('index', {
            status: status_color,
            days: getDays,
            reset: resetMessage
        })
    }

    async function clear(req, res, waiterDB){
        req.flash('reset', 'Successfully reset!')
        await waiterDB.reset();
        res.redirect('/admin')
    }


    return {
        showSchedule,
        clear
    }
}