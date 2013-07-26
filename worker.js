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
  app.set('twitter_consumer_key', 'xX6QAzcb7irfBitzdh9A');
  app.set('twitter_consumer_secret', 'IdXYxz7xnE4LOuwgMrqMZV8hdjqRbAUWtYfUuxtv0Q');
  app.set('twitter_access_token', '9705392-7vEuTePFLXuYbH7ZZ39CUkRVOjlG6oroLvRVrvQaCW');
  app.set('twitter_access_secret', '763xNbgbxjvI9Fn4v6BVyBwEsFzZ2BtHiljY4g0GIY');
  app.set('twitter_statuses', 'statuses/sample');

  app.set('redis_host', '127.0.0.1');
  app.set('redis_port', 6379);
  app.set('redis_password', '');
  
});

app.configure('production', function(){
  app.use(express.errorHandler());
  app.set('twitter_consumer_key', 'xX6QAzcb7irfBitzdh9A');
  app.set('twitter_consumer_secret', 'IdXYxz7xnE4LOuwgMrqMZV8hdjqRbAUWtYfUuxtv0Q');
  app.set('twitter_access_token', '9705392-7vEuTePFLXuYbH7ZZ39CUkRVOjlG6oroLvRVrvQaCW');
  app.set('twitter_access_secret', '763xNbgbxjvI9Fn4v6BVyBwEsFzZ2BtHiljY4g0GIY');
  app.set('twitter_statuses', 'statuses/sample');

  //app.set('redis_host', 'master.redisnode.com');
  //app.set('redis_port', 12381);
  //app.set('redis_password', 'c2864659899f4271895f59a87ab023c2');
  app.set('redis_host', 'beardfish.redistogo.com');
  app.set('redis_port', 10074);
  app.set('redis_password', '6f16eb4577ed2398a6599b69ee67bc11');
});

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

twitter = require('twitter'),
twitterConnection = new twitter({
    consumer_key: app.get('twitter_consumer_key'),
    consumer_secret: app.get('twitter_consumer_secret'),
    access_token_key: app.get('twitter_access_token'),
    access_token_secret: app.get('twitter_access_secret')
});

twitterConnection.stream(app.get('twitter_statuses'), function (stream) {

    stream.on('data', function (data) {
        client = redis.createClient(app.get('redis_port'), app.get('redis_host'));
        client.auth(app.get('redis_password'), function() {console.log("Connected!");});

        client.on('error', function (err) {
            console.log(err);
        });

        if (data.text !== undefined && data.coordinates != null) {
            var tweetData = {
                'text': data.text,
                'tweetUrl': data.url,
                'coordinates': { 'latitude': data.coordinates.coordinates[1], 'longitude': data.coordinates.coordinates[0] },
                'location': data.location,
                'time': data.createdAt,
                'user': data.user.name,
                'screenname': data.user.screen_name
            };

            client.lpush('tweets', JSON.stringify(tweetData));
            client.publish('pubsub', JSON.stringify(tweetData));
        }

        //client.quit();
    });
});