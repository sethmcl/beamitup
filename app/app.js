//Modules
var express     = require('express');
var routes      = require('./routes');
var sockServer  = require('./socket_server');
var jqtpl       = require('jqtpl');
var app         = module.exports = express.createServer();
var port        = process.argv[2] || 3400;

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'html');
  app.register('.html', jqtpl.express);
  app.set('view options', { layout: false });
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
  app.use(express.static(__dirname + '/static'));
});

// Routes
app.get('/', routes.index);
app.get('/share/:url', routes.share);
app.get('/close', routes.close);
app.get('/scrollby/:x/:y', routes.scrollby);
app.get('/iframeshim/:url', routes.iframeshim);
app.get('/bookmarklet/:host', routes.bookmarklet);

app.listen(port);
sockServer.init(app);

console.log('Beam it up listening on port %d in %s mode', app.address().port, app.settings.env);
