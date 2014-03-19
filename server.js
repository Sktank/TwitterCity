/**
 * Created with PyCharm.
 * User: spencertank
 * Date: 3/17/14
 * Time: 12:36 PM
 * To change this template use File | Settings | File Templates.
 */


// Node Imports

var express = require('express'),
    ejs = require('ejs'),
    http = require('http'),
    twitter = require('ntwitter'),
    request = require('request'),
    keys = require('./keys'),
    app = express(),
    server = http.createServer(app);
    io = require('socket.io').listen(server);

// Server Config

server.listen(4000);
app.set('views', __dirname + '/views');
app.engine('html', ejs.renderFile);
app.use(express.static(__dirname + '/public'));

var twit = new twitter({
    consumer_key: keys.consumer_key,
    consumer_secret: keys.consumer_secret,
    access_token_key: keys.access_token_key,
    access_token_secret: keys.access_token_secret
});

// Routes
app.get('/', function (req, res) {
    res.render(
        'home.html'
    );
});


// websockets connection
io.sockets.on('connection', function (socket) {

    // add user to language queue
    console.log('socket: ' + socket);

    //
    socket.on('search', function(data) {
        console.log(data);
        cityStream(socket, data.city, data.track);
    });

    socket.on('stop', function() {
        socket.stream.destroy();
    });


    socket.on('disconnect', function() {
        if (socket.stream) {
            socket.stream.destroy();
        }
    })
});

// Twitter Stream
function startStream(socket, filter, boundingBox) {
        twit.stream('statuses/filter', filter, function(stream) {
            var boxCorners = boundingBox.split(",");
            socket.stream = stream;
            stream.on('data', function (data) {
                var tweetLocation;
                if(data.geo) {
                    tweetLocation = data.geo.coordinates;
                    var lat = tweetLocation[0];
                    var lng = tweetLocation[1];
                    console.log(data.entities.hashtags);
                    // check to make sure the tweet originated from city and is not just related to city
                    if (lng >= boxCorners[0] && lng <= boxCorners[2] && lat >= boxCorners[1] && lat <= boxCorners[3])
                    {
                        socket.emit('tweet', {name: data.user.name, message: data.text, location:tweetLocation});
                    }
                }
            });
        });
}

// Google geo coder
function cityStream(socket, city, track) {
    var filter,
        info,
        bestMatch,
        bounds,
        twitterBoundingBox,
        location,
        tracklist;

    request('http://maps.googleapis.com/maps/api/geocode/json?address=' + city + '&sensor=false', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body); // Print the lookup
            info = eval("value = (" + body + ")");
            if (info.results) {
                bestMatch = info.results[0];
                bounds = bestMatch.geometry.bounds;
                twitterBoundingBox = formatBoundingBox(bounds);
                location = bestMatch.geometry.location;

                socket.emit('cityLocation', location);
                 console.log(track);
                tracklist = track.split(",");

                if (tracklist[0] != '') {
                    filter = {track:tracklist};
                }
                else {
                    filter = {'locations':twitterBoundingBox};
                }

                startStream(socket, filter, twitterBoundingBox);
            }
        }
    });
}

// format google response to be processed by twitter api
function formatBoundingBox(geoLocation) {
    return geoLocation.southwest.lng + "," + geoLocation.southwest.lat + "," +
           geoLocation.northeast.lng + "," + geoLocation.northeast.lat + ",";

}