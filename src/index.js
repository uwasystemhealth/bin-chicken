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
const Webpack = require('webpack');
const webpackConfig = require('../webpack.config');
const compiler = Webpack(webpackConfig);

// setup for express
server.use(helmet());
server.set("trust proxy", ["loopback", "130.95.172.18"]); // trust first proxy
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
    layoutsDir: 'src/views/layouts/',
    partialsDir: 'src/views/partials/',
    defaultLayout: 'main', 
    extname: '.hbs',
    helpers: Object.assign({}, handlebarsHelpers),
});
server.engine('.hbs', app.exphbs);
server.set('view engine', '.hbs');

const root = path.normalize(`${__dirname}/..`);
server.use(express.static(`${root}/dist`));
server.use(express.static(`${root}/src/common`));

server.use('/api/', require('./routes/api/'));

server.use(require('webpack-dev-middleware')(compiler, {
    publicPath: webpackConfig.output.publicPath,
    contentBase: `${root}/src/client`,
    hot: true,
    inline: true,
    quiet: false,
    noInfo: false,
    lazy: false,
    stats: {
        chunks: false,
        chunkModules: false,
        colors: true
    }
}))

server.use(require('webpack-hot-middleware')(compiler, {
    path: '/__webpack_hmr'
}))
//server.use('/', require('./routes/views/'));
server.get('*', (req, res) => res.sendFile(`${root}/src/common/index.html`));

const port = process.env.PORT || 9002;
const host = process.env.HOST || 'localhost';

app.httpServer = server.listen(port, host, function (err) {
	if(err) console.error(err);
    console.log(`pheme-auth server listening on: http://${host}:${port}`);
});