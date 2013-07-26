/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , realtime = require('./routes/realtime')
  , http = require('http')
  , path = require('path')
  , MemStore = express.session.MemoryStore
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , redis = require("redis");

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use( express.cookieParser() );
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.session({secret: '+p;jwD5%9][34y3|?r4th"8j8{R,y|', store: MemStore({
    reapInterval: 60000 * 10
  })}));

  app.set('tweetsToLoad', 50);
});

app.configure('development', function(){
  app.use(express.errorHandler());
  app.set('redis_host', '127.0.0.1');
  app.set('redis_port', 6379);
  app.set('redis_password', '');
});

app.configure('production', function(){
  app.use(express.errorHandler());
  app.set('redis_host', 'master.redisnode.com');
  app.set('redis_port', 12381);
  app.set('redis_password', 'c2864659899f4271895f59a87ab023c2');
});

app.get('/', routes.index);
app.get('/connect', realtime.connect);
app.get('/users', user.list);

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

io.configure(function () { 
    io.set("transports", ["xhr-polling"]); 
    io.set("polling duration", 10); 
});

var redisPort = app.get('redis_port');
var redisHost = app.get('redis_host');
var redisPassword = app.get('redis_password');

var client = redis.createClient(redisPort, redisHost);
if(redisPassword !== ''){
    client.auth(redisPassword);
}

io.sockets.on('connection', function (socket) {
    var subscribe = redis.createClient(redisPort, redisHost);
    if (redisPassword !== '') {
        subscribe.auth(redisPassword);
    }
    subscribe.subscribe('pubsub');

    subscribe.on('message', function (channel, message) {
        var jsonMessage = JSON.parse(message);
        socket.emit('message', jsonMessage);
    });

    client.on('error', function (error) {
        console.log(error);
    });

    socket.on('loadtweets', function () {
        client.lrange("tweets", 0, app.set('tweetsToLoad'), function (err, messages) {
            socket.emit('loadedtweets', messages);
        });
    });

});

