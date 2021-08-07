const express   = require('express');
const app       = express();
var mongoose    = require('mongoose');
var routes      = require('./routes');
var cors        = require('cors');
var bodyParser  = require('body-parser');
var passport    = require('passport');
require('dotenv/config');

app.get('/',(req,res)=>{
    res.send('we are home')
})

app.use(cors());
// get our request parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Use the passport package in our application
app.use(passport.initialize());
var passportMiddleware = require('./middleware/passport');
passport.use(passportMiddleware);
//connected to DB
mongoose.connect(
    process.env.DB_CONNECTION
    ,{ useNewUrlParser: true,useUnifiedTopology: true },()=>{
    console.log('connected DB')
})
mongoose.set('useCreateIndex', true);
app.use('/api',routes);

app.listen(3001);