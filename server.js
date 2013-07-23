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
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/connect', realtime.connect);
app.get('/users', user.list);

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

//io.configure(function () { 
//    io.set("transports", ["xhr-polling"]); 
//    io.set("polling duration", 10); 
//});

var client = redis.createClient(),
    publisher = redis.createClient();

io.sockets.on('connection', function (socket) {

    socket.on('subscribe', function (data) {
        client.subscribe(data.channel);
    });

    publisher.on('message', function (channel, message) {
        var resp = { 'text': message, 'channel': channel }
        console.log(message);
        socket.emit('tweets', message);
    });

    ////GET FROM REDIS
    //client = redis.createClient();

    //client.on('error', function (err) {
    //    console.log('Error' + err);
    //});

    //if (data.text !== undefined) {
    //    client.hset('twitter', data.id_str, data.text);
    //}
    ////client.hgetall("twitter", function (err, obj) {
    ////    console.dir(obj);
    ////});
    //client.quit();

    //socket.emit('tweets', data);
});

setInterval(function () {
    var no = Math.floor(Math.random() * 100);
    publisher.publish('tweet-channel', 'Generated random no ' + no);
}, 1000);