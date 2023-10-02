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

//importing my routes
import AdminSchedule from './routes/admin_route.js';
import WaiterRoute from './routes/waiter_route.js';

let waiterDB = WaiterDB(db)
//instantiate the logic function 
let waiterSchedule = WaiterSchedule(waiterDB);
//instantiate my routes
let waiterRoute = WaiterRoute(waiterSchedule, waiterDB)
let admin_route = AdminSchedule(waiterSchedule, waiterDB)

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
    res.redirect('/login')
})

app.get('/admin', admin_route.showSchedule)

app.get('/waiter/', async (req, res) => {
    let username = req.params
    res.render('waiter', {
        username
    });
});

app.get('/login', async (req, res) => {
    let error_message = req.flash('errors')[0];
    let success_message = req.flash('success')[0];

    res.render('login', {
        error_messages: error_message,
        success_message

    })
})

app.post('/login', async (req, res) => {
    console.log(req.body);
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
        }  if (result.success) {
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
});

// app.post('/waiter', waiterRoute.getWaiter)

app.get('/waiter/:username', waiterRoute.keepChecked);

app.post('/waiter/:username', waiterRoute.selectDays)

app.post('/reset', admin_route.clear)

//process the enviroment the port is running on
let PORT = process.env.PORT || 1230;
//listen on the port - opens the port on the terminal.
app.listen(PORT, () => {
    console.log('App started...', PORT);
})
