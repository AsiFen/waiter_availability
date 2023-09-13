
//import express  framework
import express from 'express';
//import the handlebars engine 
import exphbs from 'express-handlebars';
//import body-parsers to handle the reading of template objects?
import bodyParser from 'body-parser';
//import express flash and session to use inconjuction for displaying error & reset messages
import flash from 'express-flash';
import session from 'express-session';

//conection to the database using pg-promise and dotevn
import db from './db/db_connect.js'
//import logic function 
import WaiterSchedule from './waiter.js';

//instantiate the logic function 
let waiterSchedule = WaiterSchedule(db);
//instantiate express module
let app = express();

//configuring the handlebars module 
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
// initialise session middleware - flash-express depends on it
app.use(session({
    secret: "<JesusLovesYou>",
    resave: false,
    saveUninitialized: true
}));
// initialise the flash middleware
app.use(flash());
// his ensures form variables can be read from the req.body variable
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
//built-in static middleware from ExpressJS to use static resources such as my CSS
app.use(express.static('public'))

app.get('/', async (req, res) => {
    res.redirect('/waiter')
})

app.get('/admin', async (req, res) => {
    let getDays = await waiterSchedule.getDays();
    // console.log(getDays);

    req.flash('status', waiterSchedule.getStatus())
    let status_color = req.flash('status')[0];

    res.render('index', {
        status: status_color,
        days: getDays
    })
})

app.post('/waiters', async (req, res) => {
    let username = req.body.username;
    // await waiterSchedule.setWaiter(username);
    res.redirect('/waiter/' + username)

})

app.get('/waiter/:username', async (req, res) => {
    const username = req.params.username;
    let getDays = await waiterSchedule.getSelectedDaysForUser(username);
    const daysofweek = await waiterSchedule.getWeekDays();
    let error_message = req.flash('errors')[0];
    let resetMessage = req.flash('reset')[0]

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
    }
    res.render('waiter', {
        username,
        daysofweek,
        schedule: daysofweek, // Pass the modified daysofweek object as 'schedule'
        error_messages: error_message,
        reset: resetMessage

    });
});


app.get('/waiter/', async (req, res) => {
    res.render('waiter');
});


app.post('/waiter/:username', async (req, res) => {
    let username = req.params.username;
    let checks = req.body.checks;
    let getDays = await waiterSchedule.getSelectedDaysForUser(username);
    let userList = getDays[username]

    if (userList) {
        await waiterSchedule.daysToDelete(userList)
    }
    else {
    }
    await waiterSchedule.days(checks, username)

    req.flash('errors', waiterSchedule.errors());

    // res.redirect('/')

    res.redirect('/waiter/' + username)
})

app.post('/reset', async (req, res) => {
    req.flash('reset', 'Successfully reset!')
    await waiterSchedule.reset();
    res.redirect('/admin')
})


//process the enviroment the port is running on
let PORT = process.env.PORT || 1230;
//listen on the port - opens the port on the terminal.
app.listen(PORT, () => {
    console.log('App started...', PORT);
})
