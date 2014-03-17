/**
 * Created with PyCharm.
 * User: spencertank
 * Date: 3/17/14
 * Time: 12:36 PM
 * To change this template use File | Settings | File Templates.
 */


// Node Imports

var express = require('express'),
    jade = require('jade'),
    http = require('http'),
    twitter = require('ntwitter'),
    request = require('request'),
    app = express(),
    server = http.createServer(app),
    io = require('socket.io').listen(server);


// Server Config

server.listen(4000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set("view options", { layout: false });
app.use(express.static(__dirname + '/public'));

var twit = new twitter({
    consumer_key: 'JLKj3orcc4N4l9H9RVfHw',
    consumer_secret: 'bhhHXyDiQkQymlcR4jTCAAFYq6YirK0mrKJ3Loxc0',
    access_token_key: '2394477463-fQf4XuEIYNO6W70BD7xtiXcWzcgd1Or9cdab8cU',
    access_token_secret: '5Il4HWeqCab1Z1sPF1W7DuIlPOM6cSp4H6aQQ1C0jiFnC'
});


// Routes
app.get('/', function (req, res) {
    res.render(
        'home.jade'
    );
});

// websockets connection

io.sockets.on('connection', function (socket) {

    // add user to language queue
    console.log('socket: ' + socket);

    //
    socket.on('search', function(city) {
        cityStream(city);
    });


    socket.on('disconnect', function() {

    })
});



// Twitter Stream
function startStream(boundingBox) {
    twit.stream('statuses/sample', function(stream) {
        stream.on('data', function (data) {
            console.log(data);
        });
    });
}



// Google geo coder
function cityStream(city) {
    request('http://maps.googleapis.com/maps/api/geocode/json?address=' + city + '&sensor=false', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body); // Print the lookup


        }
    });
}

function formatBoundingBox(geoLocation) {

}



