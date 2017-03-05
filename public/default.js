var board; // UI elements
var game; // game state describe where the pieces are, valid moves

// setup socket client
var socket = io();

// window.onclick = function(e) {
//     socket.emit('message', 'hello world');
// };

window.onload = function () {
    initGame(); // initialize game
};

var initGame = function() {
    var cfg = { // configuration options
        draggable: true,
        position: 'start',
        onDrop: handleMove,
    };

    board = new ChessBoard('gameBoard', cfg); // init board
    game = new Chess(); // init game state
};

// called when a player makes a move on the board UI
var handleMove = function(source, target) {
    var move = game.move({from: source, to: target});

    if (move === null)  return 'snapback';
    else socket.emit('move', move);
};

// Handle moves you get from the server
// called when the server calls socket.broadcast('move')
socket.on('move', function (msg) {
    game.move(msg);
    board.position(game.fen()); // fen is the board layout
});