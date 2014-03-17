/**
 * Created with PyCharm.
 * User: spencertank
 * Date: 3/17/14
 * Time: 12:36 PM
 * To change this template use File | Settings | File Templates.
 */


// this is where the node server is going to go

var express = require('express'),
    jade = require('jade'),
    http = require('http'),
    app = express(),
    server = http.createServer(app),
    io = require('socket.io').listen(server);

server.listen(4000);

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set("view options", { layout: false });
app.use(express.static(__dirname + '/public'));


app.get('/', function (req, res) {
    res.render(
        'home.jade'
    );
});