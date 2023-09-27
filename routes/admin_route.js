export default function AdminSchedule(waiterSchedule, waiterDB) {

    async function showSchedule(req, res) {
        let getDays = await waiterSchedule.getDays();

        // check if there is an eror message
        if (getDays.errors) {
            req.flash('errors', getDays.errors);
        }

        req.flash('status', waiterSchedule.getStatus())
        let status_color = req.flash('status')[0];
        let resetMessage = req.flash('reset')[0]

        res.render('index', {
            status: status_color,
            days: getDays.data,
            reset: resetMessage
        })
    }

    async function clear(req, res) {
        req.flash('reset', 'Successfully reset!')
        await waiterDB.reset();
         res.redirect('/admin')
    }


    return {
        showSchedule,
        clear
    }
}