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
  , redis = require("redis");

app.configure(function(){
  app.set('port', process.env.PORT || 5000);
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
  app.set('twitterStatuses', 'frangilbert');
});

app.configure('production', function(){
  app.use(express.errorHandler());
  app.set('twitterConsumerKey', 'xX6QAzcb7irfBitzdh9A');
  app.set('twitterConsumerSecret', 'IdXYxz7xnE4LOuwgMrqMZV8hdjqRbAUWtYfUuxtv0Q');
  app.set('twitterAccessToken', '9705392-7vEuTePFLXuYbH7ZZ39CUkRVOjlG6oroLvRVrvQaCW');
  app.set('twitterAccessSecret', '763xNbgbxjvI9Fn4v6BVyBwEsFzZ2BtHiljY4g0GIY');
  app.set('twitterStatuses', 'ashtonkutcher');
});

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

twitterConnection.stream('statuses/sample', function (stream) {

    stream.on('data', function (data) {
        client = redis.createClient();

        client.on('error', function (err) {
            console.log('Error' + err);
        });

        if (data.text !== undefined && data.coordinates != null) {
            var tweetData = {
                'text': data.text,
                'tweetUrl': data.url,
                'coordinates': { 'latitude': data.coordinates.coordinates[1], 'longitude': data.coordinates.coordinates[0] },
                'location': data.location,
                'time': data.createdAt,
                'user': data.user.name,
                'screenname' : data.user.screen_name
            };

            client.lpush('tweets', JSON.stringify(tweetData));
            client.publish('pubsub', JSON.stringify(tweetData));
        }

        client.quit();
    });
});