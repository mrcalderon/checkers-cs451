var pieces;
var squares;
var username, playerColor, playerNumber, opponentname;
window.onload = function()
{
/*****************************Game Component Classes*********************************/
  // initial set up of the playing board 2d array 8 x 8
  // 0 - empty
  // 1 - player1 (red)
  // 2 - player2 (black)
  var boardSetup =
  [
    [  0,  1,  0,  1,  0,  1,  0,  1 ],
    [  1,  0,  1,  0,  1,  0,  1,  0 ],
    [  0,  1,  0,  1,  0,  1,  0,  1 ],
    [  0,  0,  0,  0,  0,  0,  0,  0 ],
    [  0,  0,  0,  0,  0,  0,  0,  0 ],
    [  2,  0,  2,  0,  2,  0,  2,  0 ],
    [  0,  2,  0,  2,  0,  2,  0,  2 ],
    [  2,  0,  2,  0,  2,  0,  2,  0 ]
  ];

    // var boardSetup =
    //     [
    //         [  2,  0,  2,  0,  2,  0,  2,  0 ],
    //         [  0,  2,  0,  2,  0,  2,  0,  2 ],
    //         [  2,  0,  2,  0,  2,  0,  2,  0 ],
    //         [  0,  0,  0,  0,  0,  0,  0,  0 ],
    //         [  0,  0,  0,  0,  0,  0,  0,  0 ],
    //         [  0,  1,  0,  1,  0,  1,  0,  1 ],
    //         [  1,  0,  1,  0,  1,  0,  1,  0 ],
    //         [  0,  1,  0,  1,  0,  1,  0,  1 ],
    //     ];

  // array of pieces on the Board
  pieces = [];
  // array of squares on the Board
  squares = [];
  // setup socket client
  var socket = io();

  /*****************************Board Class*********************************/
  /*Board object (as a var, since we only have one instance of Board) */
  var Board =
  {
    board: boardSetup,
    // first player's turn
    playerTurn: 1,
    squaresElement: $('div.squares'),
    // array to convert position on the Board to the viewport units
    convertUnit: ["0vmin", "10vmin", "20vmin", "30vmin", "40vmin", "50vmin", "60vmin", "70vmin", "80vmin", "90vmin"],

    // initialize the board by populating the squares and pieces array
    initalize: function()
    {
      var piecesCount = 0;
      var squaresCount = 0;

      // iterate through each row on the Board
      for(row in this.board)
      {
        // iterate through each column
        for(column in this.board[row])
        {
          // populate Board with playing squares(black)(since the Board is white)
          if(row%2 == 1)
          {
            if(column%2 == 0)
            {
              this.squaresElement.append("<div class='square' id='square"+squaresCount+"' style='top:"+this.convertUnit[row]+";left:"+this.convertUnit[column]+";'></div>"); // populate black squares
              squares[squaresCount] = new Square($("#square"+squaresCount), [parseInt(row), parseInt(column)]); // instantiate square and add it to the squares list
              squaresCount += 1;
            }
          }
          else
          {
            if(column%2 == 1)
            {
              this.squaresElement.append("<div class='square' id='square"+squaresCount+"' style='top:"+this.convertUnit[row]+";left:"+this.convertUnit[column]+";'></div>"); // populate black squares
              squares[squaresCount] = new Square($("#square"+squaresCount), [parseInt(row), parseInt(column)]); // instantiate square and add it to the squares list
              squaresCount += 1;
            }
          }

          // populate top half of the Board with player1 pieces
          if(this.board[row][column] == 1)
          {
            $('.player1pieces').append("<div class='piece' id='"+piecesCount+"' style='top:"+this.convertUnit[row]+";left:"+this.convertUnit[column]+";'></div>"); // add player1 piece to the board/DOM (red)
            pieces[piecesCount] = new Piece($("#"+piecesCount), [parseInt(row), parseInt(column)]); // instantiate piece w/ DOM element & x,y location
            piecesCount += 1;
          }
          // populate bottom half of the Board with player2 pieces
          else if(this.board[row][column] == 2)
          {
            $('.player2pieces').append("<div class='piece' id='"+piecesCount+"' style='top:"+this.convertUnit[row]+";left:"+this.convertUnit[column]+";'></div>"); // add player2 piece to the board/DOM (black)
            pieces[piecesCount] = new Piece($("#"+piecesCount), [parseInt(row), parseInt(column)]);
            piecesCount += 1;
          }
        }
      }
    },

    // function to check whether a square is occupied by a piece
    validToMove: function(row, column)
    {
      //console.log(row);console.log(column);console.log(this.board);
      if(this.board[row][column] == 0)
        return true;

      return false;
    },

    // function to check if any jumps is available from pieces of the current player across the board
    jumpsAvailable: function()
    {
        // iterate through the pieces
        for(var i = 0; i < pieces.length; i++)
        {
            // only check the pieces that are still on the board and are on the same side as the selected piece
            if(pieces[i].position.length !== 0 && pieces[i].player === this.playerTurn)
            {
                if(pieces[i].canJump())
                    return true;
            }
        }

        return false;
    },

    // function to switch player's turn
    switchPlayerTurn: function()
    {
      if(this.playerTurn == 1)
      {
        this.playerTurn = 2;
        $('.turn').css("background", "linear-gradient(to right, transparent 50%, #BEEE62 50%)");
        return;
      }
      else if(this.playerTurn == 2)
      {
        this.playerTurn = 1;
        $('.turn').css("background", "linear-gradient(to right, #BEEE62 50%, transparent 50%)");
      }
    },

    // function to reset the game
    clear: function()
    {
      location.reload();
    }
  };
  /***************************** End of Board Class *********************************/

  /*****************************Piece Class*********************************/
  /* Piece object - there are 24 instances of them in a game
     Params:
     element: DOM element
     position: a pair of x,y coordinates(array of 2 elements)
  */
  function Piece(element, position)
  {
    this.element = element;
    this.position = position;
    this.player = '';
    // find out which player this piece belongs to
    if(this.element.attr("id") < 12)
      this.player = 1;
    else
      this.player = 2;

    this.king = false;
    // function to make this piece a king
    this.makeKing = function()
    {
      this.element.css("backgroundImage", "url('images/king"+this.player+".png')");
      this.king = true;
    }

    /* function to move the piece
       param is a square to move to
       returns true if it is a valid move, false otherwise
    */
    this.move = function(square)
    {
      // unselect the piece after moving is done
      this.element.removeClass('selected');

      if(!Board.validToMove(square.position[0], square.position[1])) // check if move is value if true continue else break
        return false;

      // make sure a piece doesn't go backwards if it is not a king
      if(this.player == 1 && this.king == false)
      {
        if(square.position[0] < this.position[0])
            return false;
      }
      else if(this.player == 2 && this.king == false)
      {
        if(square.position[0] > this.position[0])
            return false;
      }

      // remove the piece and generate in its new position(square)
      Board.board[this.position[0]][this.position[1]] = 0; // make square empty
      Board.board[square.position[0]][square.position[1]] = this.player; // make the new square as the current player
      this.position = [square.position[0], square.position[1]]; // set the piece position as the new square
      // update the piece's position in css
      // position coordinates x,y will be converted to viewport units(vmin)
      this.element.css('top', Board.convertUnit[this.position[0]]); // move vertically
      this.element.css('left', Board.convertUnit[this.position[1]]); // move horizontally

      // make a piece a king(can move all directions) if it reaches the opposite side of the board
      if(!this.king &&(this.position[0] == 0 || this.position[0] == 7 ))
        this.makeKing();

        socket.emit('move', {
            square: square,
            piece: this.element.attr("id")
        });

      // switch turn afterwards
      Board.switchPlayerTurn();

      return true;
    };

    // function to check if the piece can make a jump anywhere
    this.canJump = function() {
      // testing for all 4 directions
      if(this.canJumpTo([this.position[0]+2, this.position[1]+2]) ||
         this.canJumpTo([this.position[0]+2, this.position[1]-2]) ||
         this.canJumpTo([this.position[0]-2, this.position[1]+2]) ||
         this.canJumpTo([this.position[0]-2, this.position[1]-2]))
      {
        return true;
      }
      return false;
    };

    /* function to check if the piece can jump another opponent and go to a specific position
       if so, return the captured piece
       takes as param the new position
    */
    this.canJumpTo = function(newPosition)
    {
      var dx = newPosition[1] - this.position[1];
      var dy = newPosition[0] - this.position[0];

      // make sure object doesn't go backwards if it is not a king
      if(this.player == 1 && this.king == false)
      {
        if(newPosition[0] < this.position[0])
            return false;
      }
      else if(this.player == 2 && this.king == false)
      {
        if(newPosition[0] > this.position[0])
            return false;
      }

      // check if the position is in bound
      if(newPosition[0] > 7 || newPosition[1] > 7 || newPosition[0] < 0 || newPosition[1] < 0)
        return false;

      // find the position of the middle square where the piece to be jump sits
      var squareToCheckx = this.position[1] + dx/2;
      var squareToChecky = this.position[0] + dy/2;

      // if there is a piece in between and there is no piece in the space directly diagnal to the middle piece, a jump can be made
      if(!Board.validToMove(squareToChecky, squareToCheckx) && Board.validToMove(newPosition[0], newPosition[1]))
      {
        for(pieceIndex in pieces)
        {
          if(pieces[pieceIndex].position[0] == squareToChecky && pieces[pieceIndex].position[1] == squareToCheckx)
          {
            // return the captured piece
            if(this.player != pieces[pieceIndex].player)
              return pieces[pieceIndex];
          }
        }
      }
      return false;
    };

    /* function to jump an opponent
       take as param a square to jump to
    */
    this.jump = function(square)
    {
      var pieceToRemove = this.canJumpTo(square.position);
      // if a piece is captured, remove it
      if(pieceToRemove)
      {
        pieces[pieceIndex].remove();

        socket.emit('remove', {
            piece: pieceIndex
        });

        return true;
      }
      return false;
    };

    // function to remove the piece from the board
    this.remove = function()
    {
      this.element.css("display", "none");
      if(this.player == 1)
        $('#player2').append("<div class='capturedPiece'></div>");
      if(this.player == 2)
        $('#player1').append("<div class='capturedPiece'></div>");

      Board.board[this.position[0]][this.position[1]] = 0;
      this.position = [];
    };
  }
  /***************************** End of Piece Class *********************************/

  /*****************************Square Class*********************************/
  /* Square object
     Params:
     element: DOM element
     position: a pair of x,y coordinates(array of 2 elements)
  */
  function Square(element, position)
  {
    this.element = element;
    this.position = position;

    /* function to check if square can be reached from a piece
       takes a piece as param
       returns whether the move from the piece to the square is regular or jump
    */
    this.isReachable = function(piece)
    {
      if(dist(this.position[0], this.position[1], piece.position[0], piece.position[1]) == Math.sqrt(2))
        return 'regular';
      else if(dist(this.position[0], this.position[1], piece.position[0], piece.position[1]) == 2*Math.sqrt(2))
        //jump move
        return 'jump';
    };
  }
  /***************************** End of Square Class *********************************/

  //initialize the board
  Board.initalize();
  var socket, serverGame;
  var game, board;
  var usersOnline = []; // for lobby keep track of online users
  var myGames = []; // for lobby keep track of user's games
  socket = io();

  /***************************** Menus ***********************************************/

  // when user enter username and login, go to lobby send login event to server
  $('#login').on('click', function() {
      username = $('#username').val();

      if (username.length > 0) {
          $('#userLabel').text(username);
          socket.emit('login', username);

          $('#page-login').hide();
          $('#page-lobby').show();
      }
  });

  /***************************** Socket.io handlers *********************************/

    socket.on('connect', function() {
      console.log('Successfully connected!');
  });

  // when current player just login/joined get current list of online users and any active games from before + update UI
  socket.on('login', function(msg) {
      console.log("from login:" + msg);
      usersOnline = msg.users; // get list of users online
      updateUserList(); // update online users list

      myGames = msg.games; // get list of user's active games
      updateGamesList(); // update user's active games
  });

  // a new player just joined/login update UI
  socket.on('joinlobby', function (msg) {
      addUser(msg);
  });

  // ???
  socket.on('gameadd', function(msg) {
    console.log("from gameadd: " + msg);
    addGame(msg);
  });

  // when user server emit joingame w/ game object and color
  socket.on('joingame', function(msg) {
      console.log("joined as game id: " + msg.game.id );
      playerColor = msg.color;
      playerNumber = msg.number;
      opponentname = msg.oppId;
      // initGame(msg.game);

      $('#page-lobby').hide();
      $('#info').show();
      $('#stats').show();
      $('#page-game').show();

      // set the username in the info (stat) board accordingly
      $('#info').append("<h1>" + username + " (Player" + playerNumber + ")</h1>");
  });

  // Handle moves you get from the server
  // called when the server calls socket.broadcast('move')
  socket.on('move', function (data) {
      // console.log(move);
      var square = data.square;
      var piece = pieces[data.piece];
      piece.move(square);
  });

  socket.on('remove', function (data) {
      var piece = pieces[data.piece];
      piece.remove();
  });

  // update users list
  var updateUserList = function() {
      // document.getElementById('userList').innerHTML = '';
      // $('#userList')[0].innerHTML = ''
      $('#userList').html("");
      usersOnline.forEach(function(user) {
          $('#userList').append($('<button>')
              .text(user)
              .on('click', function() {
                  socket.emit('invite',  user);
              }));
      });
  };

  // update games list
  var updateGamesList = function() {
      // document.getElementById('gamesList').innerHTML = '';
      $('#gamesList').html("");
      myGames.forEach(function(game) {
          $('#gamesList').append($('<button>')
              .text('#'+ game)
              .on('click', function() {
                  socket.emit('resumegame',  game);
              }));
      });
  };

  // add new player to list of online users and update UI
  var addUser = function(userId) {
      usersOnline.push(userId);
      updateUserList();
  };

  var addGame = function(game) {
      myGames.push(game.gameId);
      updateGamesList();
  };

/*****************************Helper function*********************************/

  // find distance between two coordinates(position)
  var dist = function(x1, y1, x2, y2)
  {
    return Math.sqrt(Math.pow((x1-x2),2) + Math.pow((y1-y2),2));
  };

 /*****************************Events handler***************************************/

  // function to handle click on piece
  $('.piece').on("click", function()
  {
    var selected;

    // check whether a piece of the current player is clicked on
    var isPlayersTurn =($(this).parent().attr("class").split(' ')[0] == "player"+Board.playerTurn+"pieces");
    // highlight piece if it is the current player's turn to move and if the player only tries to move his/her piece
    if(isPlayersTurn  && Board.playerTurn === playerNumber)
    {
      if($(this).hasClass('selected'))
        selected = true;
      $('.piece').each(function(index) {$('.piece').eq(index).removeClass('selected')});
      if(!selected)
        $(this).addClass('selected');
    }
  });

  // function to handle click on "Reset Game"
  $('#cleargame').on("click", function()
  {
    Board.clear();
  });

  // function to handle click on a square(move piece)
  $('.square').on("click", function()
  {
    // only consider a move if a piece is clicked on beforehand
    if($('.selected').length != 0)
    {
      // find the square being clicked
      var squareID = $(this).attr("id").replace(/square/, ''); // get id
      var square = squares[squareID]; // get square from squares list
      // find the piece being selected
      var piece = pieces[$('.selected').attr("id")];
      // check if the square is in reachable from the selected piece
      var isReachable = square.isReachable(piece); // calculate move return 'regular' or 'jump'
      if(isReachable)
      {
        // if the move is a jump, make a jump
        if(isReachable == 'jump')
        {
          if(piece.jump(square)) // remove piece being eaten
          {
            piece.move(square); //move piece to new square
            // check if another move can be made(double and triple jumps)
            if(piece.canJump())
            {
               // if further jumps are possible, revert turn(since turn is switched in move)
               Board.switchPlayerTurn();
               piece.element.addClass('selected');
            }
          }
        }
        // if the move is regular, check if a jump is available elsewhere
        else if(isReachable == 'regular')
        {
          if(!Board.jumpsAvailable()) {
            piece.move(square);
          }
          // if a jump is possible, don't allow a regular move
          else
            alert("You must jump when possible!");
        }
      }
    }
  });
};
