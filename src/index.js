// const requireDirectory = require('require-directory');
const path = require('path');
const express = require('express');
const session = require('express-session');
const exphbs = require('express-handlebars');

const handlebarsHelpers = (require('handlebars-helpers'))();
const app = require('../app'); // eslint-disable-line
const server = app.server = express(); // eslint-disable-line

const bodyParser = require('body-parser');
const helmet = require('helmet');
const compression = require('compression');
const MongoStore = require('connect-mongo')(session);
const Webpack = require('webpack');
const webpackConfig = require('../webpack.config');

const compiler = Webpack(webpackConfig);

// setup for express
server.use(helmet());
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE');
  next();
});
server.use(compression());
server.set('trust proxy', ['loopback', '130.95.172.18']); // trust first proxy
server.set('json spaces', 4);
app.express_session = session({
  cookie: {
    path: '/',
    httpOnly: true,
    secure: false,
    maxAge: null,
  },
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({
    mongooseConnection: app.mongoose.connection,
    ttl: 5 * 60 * 60, // = 5 hours
    touchAfter: 5 * 60, // 5 min
  }),
  secret: process.env.COOKIE_SECRET,
});
server.use(app.express_session);

server.use(bodyParser.json({ limit: '5mb' }));
server.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }));
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

// hotload the vue files
if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line global-require
  server.use(require('webpack-dev-middleware')(compiler, {
    publicPath: webpackConfig.output.publicPath,
    contentBase: `${root}/src/client`,
    hot: true,
    inline: true,
    quiet: false,
    noInfo: false,
    lazy: false,
    stats: 'minimal', /* {
      chunks: false,
      chunkModules: false,
      colors: true,
      modulesSort: '!size',
    }, */
  }));

  // eslint-disable-next-line global-require
  server.use(require('webpack-hot-middleware')(compiler, {
    path: '/__webpack_hmr',
  }));
}

server.use(express.static(`${root}/dist`));
server.use(express.static(`${root}/src/common`));

server.use('/api/', require('./routes/api/'));

server.get('*', (req, res) => res.sendFile(`${root}/dist/index.html`));

const port = process.env.PORT || 9002;
const host = process.env.HOST || 'localhost';

app.httpServer = server.listen(port, host, (err) => {
  if (err) console.error(err); // eslint-disable-line no-console
  console.log(`pheme-auth server listening on: http://${host}:${port}`); // eslint-disable-line no-console
});
