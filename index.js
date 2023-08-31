
//import express  framework
import express from 'express';
//import the handlebars engine 
import exphbs from 'express-handlebars';
//import body-parsers to handle the reading of template objects?
import bodyParser from 'body-parser';
//import express flash and session to use inconjuction for displaying error & reset messages
import flash from 'express-flash';
import session from 'express-session';

//import ff logic
import WaiterSchedule from './waiter.js';

let waiterSchedule = WaiterSchedule();


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
    let days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    let names = ['Asi', 'Sipho', 'Swatha', 'Lamb', 'Sihle', 'Ghost']
    res.render('index', {
        days: days,
        names: names
    })
})
//posting front to
app.post('/waiters', (req, res) => {
    let username = req.body.username;

    waiterSchedule.valid_waiterName(username)


    // console.log(username);
    res.redirect('/waiter/' + username)

})

app.get('/waiter/:username', (req, res) => {
    let username = req.params.username;
    // console.log(username);
    // console.log(waiterSchedule.getDays());
    res.render('waiter', {
        username
    })

})

app.post('/waiter/:username', (req, res) => {
    let username = waiterSchedule.getUser();
    let checks = req.body.checks;
    console.log(username + 'i');

    let isValid = waiterSchedule.valid_waiterName()
    if (isValid) {
        waiterSchedule.add_days(checks)
        // console.log(checks);
    }
    res.redirect('/waiter/' + username)
})



//process the enviroment the port is running on
let PORT = process.env.PORT || 1230;
//listen on the port - opens the port on the terminal.
app.listen(PORT, () => {
    console.log('App started...', PORT);
})
