var express = require('express');
var app = express();
app.use(express.static('public'));
var http = require('http').Server(app);
var io = require('socket.io')(http); // setup socket server
var port = process.env.PORT || 3000;

var lobbyUsers = {};
var users = {};
var activeGames = {};

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

http.listen(port, function() {
    console.log('listening on *: ' + port);
});

// calls anytime a client connects to the server
io.on('connection', function(socket) {
    console.log('new connection ' + socket);

    // when user enters their name & taken to lobby
    socket.on('login', function(userId) {
        console.log(userId + ' joining lobby');
        socket.userId = userId;

        // check if the user is not in the users list then create a new user
        if (!users[userId]) {
            console.log('creating new user:' + userId);
            users[userId] = {userId: socket.userId, games:{}};
        // else user exist in the users list, retrieve user's games
        } else {
            console.log('user found!');
            Object.keys(users[userId].games).forEach(function(gameId) {
                console.log('gameid - ' + gameId);
            });
        }

        // send list of users and games to everyone other than the user that just login/joined
        socket.emit('login', {users: Object.keys(lobbyUsers),
            games: Object.keys(users[userId].games)});

        // save userId
        lobbyUsers[userId] = socket;

        // broadcast joinlobby event to everyone other than the user that just joined/login
        socket.broadcast.emit('joinlobby', socket.userId);
    });

    // when a user invites/challenges another player to a game
    socket.on('invite', function(opponentId) {
        console.log(socket.userId + " invites/challenges "+ opponentId + " to a game");

        // broadcast leavelobby event to everyone else w/ that the two players are leaving the lobby to play a game
        socket.broadcast.emit('leavelobby', socket.userId);
        socket.broadcast.emit('leavelobby', opponentId);

        // create an instance of a game
        var game = {
            id: Math.floor((Math.random() * 100) + 1),
            board: null,
            users: {white: socket.userId, black: opponentId}
        };

        // add gameId to socket and add to list of user's list of active games
        socket.gameId = game.id;
        activeGames[game.id] = game;

        // update gameId to both user object list of games
        users[game.users.white].games[game.id] = game.id;
        users[game.users.black].games[game.id] = game.id;

        console.log('starting game: ' + game.id);
        // send joingame event to the opponent that the user invites/challenges w/ game object and their respective color
        lobbyUsers[game.users.white].emit('joingame', {game: game, color: 'white', number: 1, oppId: opponentId});
        lobbyUsers[game.users.black].emit('joingame', {game: game, color: 'black', number: 2, oppId: opponentId});

        delete lobbyUsers[game.users.white];
        delete lobbyUsers[game.users.black];

        // ???
        socket.broadcast.emit('gameadd', {gameId: game.id, gameState:game});
    });

    // Called when the client calls socket.emit('move')
    socket.on('move', function(move) {
        socket.broadcast.emit('move', move);
    });

    socket.on('remove', function(data) {
        socket.broadcast.emit('remove', data);
    });
});
