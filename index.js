
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
import WaiterDB from './db/db_functions.js';
//import logic function 
import WaiterSchedule from './services/waiter.js';

let waiterDB = WaiterDB(db)
//instantiate the logic function 
let waiterSchedule = WaiterSchedule(waiterDB);
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

    req.flash('status', waiterSchedule.getStatus())
    let status_color = req.flash('status')[0];
    let resetMessage = req.flash('reset')[0]

    res.render('index', {
        status: status_color,
        days: getDays,
        reset: resetMessage
    })
})

app.post('/waiters', async (req, res) => {
    let username = req.body.username;
    await waiterSchedule.valid_waiterName(username);
    // res.redirect('/waiter/' + username)
})

app.get('/waiter/:username', async (req, res) => {
    const username = req.params.username;
    let getDays = await waiterSchedule.getSelectedDaysForUser(username);
    const daysofweek = await waiterDB.getWeekDays();
    let error_message = req.flash('errors')[0];
    // console.log(getDays, 'c');
    // const daysofweek = await waiterDB.getWeekDays();
    await waiterSchedule.keepChecked(getDays, username, daysofweek)

    res.render('waiter', {
        username,
        daysofweek,
        schedule: daysofweek,
        error_messages: error_message
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
    // console.log(userList);
    if (userList) {
        await waiterSchedule.daysToDelete(userList)
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
