var express = require('express');
var app = express();
app.use(express.static('public'));
var http = require('http').Server(app);
var io = require('socket.io')(http); // setup socket server
var port = process.env.PORT || 3000;

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

http.listen(port, function() {
    console.log('listening on *: ' + port);
});

// calls anytime a client connects to the server
io.on('connection', function(socket) {
    console.log('new connection');

    // Called when the client calls socket.emit('move')
    socket.on('move', function(move) {
        socket.broadcast.emit('move', move);
    });

    socket.on('remove', function(data) {
        socket.broadcast.emit('remove', data);
    });
});