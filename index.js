
//import express  framework
import express from 'express';
//import the handlebars engine 
import exphbs from 'express-handlebars';
//import body-parsers to handle the reading of template objects?
import bodyParser from 'body-parser';
//import express flash and session to use inconjuction for displaying error & reset messages
import flash from 'express-flash';
import session from 'express-session';

import db from './db/db_connect.js'
//import ff logic
import WaiterSchedule from './waiter.js';

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

//
app.get('/', (req, res) => {
    let username = waiterSchedule.getUser()
    // let x = req.flash('info')[0];
    console.log(waiterSchedule.getDays());
    // let days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    // let names = ['Asi', 'Sipho', 'Swatha', 'Lamb', 'Sihle', 'Ghost']
    res.render('index', {
        days: waiterSchedule.getDays()

    })
})
//posting front to
app.post('/waiters', (req, res) => {
    let username = req.body.username;
    waiterSchedule.valid_waiterName(username)
    res.redirect('/waiter/' + username)

})

app.get('/waiter/:username', (req, res) => {
    let username = req.params.username;
    res.render('waiter', {
        username
    })
    // res.render('index', {
    //     names: username
    // })
    // res.redirect('/')
})

app.post('/waiter/:username',async (req, res) => {
    let username = waiterSchedule.getUser();
    // req.flash('info',username)
    let isValid = waiterSchedule.valid_waiterName(username)
    // console.log(username);
    let checks = req.body.checks;
    // console.log(checks);
    // waiterSchedule.add_days(checks)
   await waiterSchedule.days(checks)
    // console.log();
        // res.redirect('/')
  res.redirect('/')

    // res.redirect('/waiter/' + username)
})

//process the enviroment the port is running on
let PORT = process.env.PORT || 1230;
//listen on the port - opens the port on the terminal.
app.listen(PORT, () => {
    console.log('App started...', PORT);
})
