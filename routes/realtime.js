var redis = require("redis"),
    util = require('util');

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