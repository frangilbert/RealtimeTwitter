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
  app.set('twitterConsumerKey', 'xX6QAzcb7irfBitzdh9A');
  app.set('twitterConsumerSecret', 'IdXYxz7xnE4LOuwgMrqMZV8hdjqRbAUWtYfUuxtv0Q');
  app.set('twitterAccessToken', '9705392-7vEuTePFLXuYbH7ZZ39CUkRVOjlG6oroLvRVrvQaCW');
  app.set('twitterAccessSecret', '763xNbgbxjvI9Fn4v6BVyBwEsFzZ2BtHiljY4g0GIY');
  app.set('twitterStatuses', 'statuses/sample');
});

app.get('/', routes.index);
app.get('/connect', realtime.connect);
app.get('/users', user.list);

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

twitter = require('twitter'),
    twitterConnection = new twitter({
        consumer_key: app.get('twitterConsumerKey'),
        consumer_secret: app.get('twitterConsumerSecret'),
        access_token_key: app.get('twitterAccessToken'),
        access_token_secret: app.get('twitterAccessSecret')
    });

    io.sockets.on('connection', function (socket) {
        var status = app.get('twitterStatuses');

        twitterConnection.stream(status, function (stream) {

            stream.on('data', function (data) {
                console.log(data.id)

                if (data !== null) {
                    //INSERT TO REDIS
                    client = redis.createClient();

                    client.on('error', function (err) {
                        console.log('Error' + err);
                    });

                    if (data.text !== undefined) {
                        client.hset('twitter', data.id_str, data.text);
                    }
                    //client.hgetall("twitter", function (err, obj) {
                    //    console.dir(obj);
                    //});
                    client.quit();

                    socket.emit('tweets', data);
                }
            });
        });
    });