window.onload = function()
{
/*****************************Game Component Classes*********************************/
  // initial set up of the playing board
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

  // array of pieces on the Board
  var pieces = [];
  // array of squares on the Board
  var squares = [];

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

      // iterate through each position on the Board
      for(row in this.board)
      {
        for(column in this.board[row])
        {
          // populate Board with playing squares(black)(since the Board is white)
          if(row%2 == 1)
          {
            if(column%2 == 0)
            {
              this.squaresElement.append("<div class='square' id='square"+squaresCount+"' style='top:"+this.convertUnit[row]+";left:"+this.convertUnit[column]+";'></div>");
              squares[squaresCount] = new Square($("#square"+squaresCount), [parseInt(row), parseInt(column)]);
              squaresCount += 1;
            }
          }
          else
          {
            if(column%2 == 1)
            {
              this.squaresElement.append("<div class='square' id='square"+squaresCount+"' style='top:"+this.convertUnit[row]+";left:"+this.convertUnit[column]+";'></div>");
              squares[squaresCount] = new Square($("#square"+squaresCount), [parseInt(row), parseInt(column)]);
              squaresCount += 1;
            }
          }

          // populate top half of the Board with player1 pieces
          if(this.board[row][column] == 1)
          {
            $('.player1pieces').append("<div class='piece' id='"+piecesCount+"' style='top:"+this.convertUnit[row]+";left:"+this.convertUnit[column]+";'></div>");
            pieces[piecesCount] = new Piece($("#"+piecesCount), [parseInt(row), parseInt(column)]);
            piecesCount += 1;
          }
          // populate bottom half of the Board with player2 pieces
          else if(this.board[row][column] == 2)
          {
            $('.player2pieces').append("<div class='piece' id='"+piecesCount+"' style='top:"+this.convertUnit[row]+";left:"+this.convertUnit[column]+";'></div>");
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
  }

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

      if(!Board.validToMove(square.position[0], square.position[1]))
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
      Board.board[this.position[0]][this.position[1]] = 0;
      Board.board[square.position[0]][square.position[1]] = this.player;
      this.position = [square.position[0], square.position[1]];
      // update the piece's position in css
      // position coordinates x,y will be converted to viewport units(vmin)
      this.element.css('top', Board.convertUnit[this.position[0]]);
      this.element.css('left', Board.convertUnit[this.position[1]]);

      // make a piece a king(can move all directions) if it reaches the opposite side of the board
      if(!this.king &&(this.position[0] == 0 || this.position[0] == 7 ))
        this.makeKing();

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

  //initialize the board
  Board.initalize();

/*****************************Helper function*********************************/
  // find distance between two coordinates(position)
  var dist = function(x1, y1, x2, y2)
  {
    return Math.sqrt(Math.pow((x1-x2),2) + Math.pow((y1-y2),2));
  }
 /*****************************Events handler***************************************/

  // function to handle click on piece
  $('.piece').on("click", function()
  {
    var selected;

    // check whether a piece of the current player is clicked on
    var isPlayersTurn =($(this).parent().attr("class").split(' ')[0] == "player"+Board.playerTurn+"pieces");
    if(isPlayersTurn)
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
      var squareID = $(this).attr("id").replace(/square/, '');
      var square = squares[squareID];
      // find the piece being selected
      var piece = pieces[$('.selected').attr("id")];
      // check if the square is in reachable from the selected piece
      var isReachable = square.isReachable(piece);
      if(isReachable)
      {
        // if the move is a jump, make a jump
        if(isReachable == 'jump')
        {
          if(piece.jump(square))
          {
            piece.move(square);
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
          if(!Board.jumpsAvailable())
            piece.move(square);
          // if a jump is possible, don't allow a regular move
          else
            alert("You must jump when possible!");
        }
      }
    }
  });

}
