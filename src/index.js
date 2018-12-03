const app = require('../app');
//const requireDirectory = require('require-directory');
const path = require('path');
const express = require('express');
const session = require('express-session');
const exphbs  = require('express-handlebars');
const handlebarsHelpers = require('handlebars-helpers')();
const server = app.server = express();
const bodyParser = require('body-parser');
const helmet = require('helmet');
const MongoStore = require('connect-mongo')(session);

// setup for express
server.use(helmet());
server.set("trust proxy", app.config.trust_proxy); // trust first proxy
server.set('json spaces', 4);
app.express_session = session({
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
        mongooseConnection: app.mongoose.connection,
        ttl: 5 * 60 * 60, // = 5 hours
        touchAfter: 5 * 60 // 5 min
    }),
    secret: process.env.COOKIE_SECRET
});
server.use(app.express_session);

server.use( bodyParser.json({limit: '5mb'}) );
server.use(bodyParser.urlencoded({ extended: true, limit: '5mb'}));
server.use(bodyParser());

server.set('views', path.join(__dirname, 'views'));
app.exphbs = exphbs({
    defaultLayout: 'main', 
    extname: '.hbs',
    helpers: Object.assign({}, handlebarsHelpers),
});
server.engine('.hbs', app.exphbs);
server.set('view engine', '.hbs');

server.use("/common", express.static( __dirname + '/common' ));

server.use('/api/', require('./routes/api/'));
server.use('/', require('./routes/views/'));

app.httpServer = server.listen(app.config.http.port, function (err) {
	if(err) console.error(err);
    console.log('pheme-auth server listening on: '.concat(app.config.http.port));
});