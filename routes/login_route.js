export default function LoginRoute(waiterSchedule, waiterDB) {
    async function login(req, res, waiterDB) {
        let username = req.body.waitername;
        const waiter_passcode = req.body.waitercode;
        const admin_passcode = req.body.admincode;

        if (req.body.role === 'on') {

            if (username.toLowerCase() === 'asisipho' && admin_passcode === 'asi123') {

                res.redirect('/admin');
            }

            else {
                req.flash('errors', 'Enter your correct admin details');
                res.redirect('/login');
            }

        } else {
            const result = await waiterSchedule.valid_waiterName(username);

            if (result.errors) {
                req.flash('errors', result.errors);
                req.flash('success', ''); // Clear any previous success message
            } if (result.success) {
                req.flash('success', result.success);
                req.flash('errors', ''); // Clear any previous error message
            }

            if (waiter_passcode.length === 6) {

                res.redirect('/waiter/' + result.user);

            } else {
                req.flash('errors', 'Enter your 6-digit passcode.');
                req.flash('success', ''); // Clear any success message
                res.redirect('/login');
            }
        }
    }

    return {
        login
    }
}