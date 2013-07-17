var redis = require("redis"),
    util = require('util'),
    twitter = require('twitter'),
    twApi = new twitter({
        consumer_key: 'xX6QAzcb7irfBitzdh9A',
        consumer_secret: 'IdXYxz7xnE4LOuwgMrqMZV8hdjqRbAUWtYfUuxtv0Q',
        access_token_key: '9705392-7vEuTePFLXuYbH7ZZ39CUkRVOjlG6oroLvRVrvQaCW',
        access_token_secret: '763xNbgbxjvI9Fn4v6BVyBwEsFzZ2BtHiljY4g0GIY'
    });

exports.connect = function (req, res) {
    client = redis.createClient();
    console.log('Working');
    
    client.on("error", function (err) {
        console.log("Error " + err);
    });

    client.set("string key", "string val", redis.print);
    client.hset("twitter", "hashtest 1", "some value");
    client.hset(["twitter", "hashtest 2", "some other value"], redis.print);
    client.hgetall("twitter", function (err, obj) {
            console.dir(obj);
        });
        client.quit();
    
    res.locals.test = 'hello?';

    res.send(res.locals.test);
};