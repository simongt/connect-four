$(function () {
  // track the number of turns that have taken place
  let turnCount = 0;
  // keep a score
  const score = {
    player1: 0, // player 1 is magenta
    player2: 0, // player 2 is yellow
    ties: 0
  };
  /*
   * 2 players: player.one and player.two
   * - each player will have their chosen spaces pushed into an array
   * - each player will have their wins tracked from round to round
   */ 
  const player = {
    // for now, let player 1 be magenta and player 2 yellow
    // (later, let player's choose their color)
    one: {
      name: 'Player 1',
      spaces: [],
      connections: [],
      color: 'magenta',
      wins: score.player1
    },
    two: {
      name: 'Player 2',
      spaces: [],
      connections: [],
      color: 'yellow',
      wins: score.player2
    }
  };

  // grab the html body
  const $body = $('body');

  // insert game title
  const $gameTitle = $('<h1>');
  $gameTitle.addClass('neon');
  $gameTitle.html(`Connect 4`);
  $gameTitle.appendTo($body);
  
  // insert message below game title
  const $message = $('<p>');
  $message.addClass('message');
  $message.html(`${player.one.name}, drop it like it's hot!`);
  $message.appendTo($body);

  // insert the full board (includes the preview row + visible playable board)
  const $container = $('<div>');
  $container.addClass('gameContainer');
  $container.appendTo($body);
  // const $previewRow = $('<div>');
  // $previewRow.addClass('preview');
  // $previewRow.appendTo($container);
  // const $board = $('<div>');
  // $board.addClass('board');
  // $board.appendTo($container);

  let previewRow = [];
  // an array that contains 6 elements which are also arrays that each contain 7 elements
  let board = createArray(6, 7);  /*
                                   * 2-D array setup: 6 rows, 7 columns
                                   * -----------------------------------
                                   *      row: [ 5   4   3   2   1   0 ]
                                   * column 1: [ 0,  7, 14, 21, 28, 35 ]
                                   * column 2: [ 1,  8, 15, 22, 29, 36 ]
                                   * column 3: [ 2,  9, 16, 23, 30, 37 ]
                                   * column 4: [ 3, 10, 17, 24, 31, 38 ]
                                   * column 5: [ 4, 11, 18, 25, 32, 39 ]
                                   * column 6: [ 5, 12, 19, 26, 33, 40 ]
                                   * column 7: [ 6, 13, 20, 27, 34, 41 ]
                                   * -----------------------------------
                                   * array representation by [row][col]
                                   *  [ 5 ] [  0 ...  6 ]
                                   *  [ 4 ] [  7 ... 13 ]
                                   *  [ 3 ] [ 14 ... 20 ]
                                   *  [ 2 ] [ 21 ... 27 ]
                                   *  [ 1 ] [ 28 ... 34 ]
                                   *  [ 0 ] [ 35 ... 41 ]
                                   */

  /**
   * in total, there will be 69 possible winning connections of four
   * - 21 vertical connections of four (3 solutions x 7 columns)
   * - 24 horizontal connections of four (4 solutions x 6 rows)
   * - 24 diagonal connections of four (12 solutions x 2 directions)
   */
  const winningConnections = [
    // vertical solutions
    [0, 7, 14, 21], [7, 14, 21, 28], [14, 21, 28, 35],
    [1, 8, 15, 22], [8, 15, 22, 29], [15, 22, 29, 36],
    [2, 9, 16, 23], [9, 16, 23, 30], [16, 23, 30, 37],
    [3, 10, 17, 24], [10, 17, 24, 31], [17, 24, 31, 38],
    [4, 11, 18, 25], [11, 18, 25, 32], [18, 25, 32, 39],
    [5, 12, 19, 26], [12, 19, 26, 33], [19, 26, 33, 40],
    [6, 13, 20, 27], [13, 20, 27, 34], [20, 27, 34, 41],
    // horizontal solutions
    [0, 1, 2, 3], [1, 2, 3, 4], [2, 3, 4, 5], [3, 4, 5, 6],
    [7, 8, 9, 10], [8, 9, 10, 11], [9, 10, 11, 12], [10, 11, 12, 13],
    [14, 15, 16, 17], [15, 16, 17, 18], [16, 17, 18, 19], [17, 18, 19, 20],
    [21, 22, 23, 24], [22, 23, 24, 25], [23, 24, 25, 26], [24, 25, 26, 27],
    [28, 29, 30, 31], [29, 30, 31, 32], [30, 31, 32, 33], [31, 32, 33, 34],
    [35, 36, 37, 38], [36, 37, 38, 39], [37, 38, 39, 40], [38, 39, 40, 41],
    // diagonal solutions
    [0, 8, 16, 24], [7, 15, 23, 31], [14, 22, 30, 38],
    [1, 9, 17, 25], [8, 16, 24, 32], [15, 23, 31, 39],
    [2, 10, 18, 26], [9, 17, 25, 33], [16, 24, 32, 40],
    [3, 11, 19, 27], [10, 18, 26, 34], [17, 25, 33, 41],
    [3, 9, 15, 21], [4, 10, 16, 22], [5, 11, 17, 23], [6, 12, 18, 24],
    [10, 16, 22, 28], [11, 17, 23, 29], [12, 18, 24, 30], [13, 19, 25, 31],
    [17, 23, 29, 35], [18, 24, 30, 36], [19, 25, 31, 37], [20, 26, 32, 38]
  ];
  winningConnections.sort();
  console.log(winningConnections);

  /** each column will be its own JSON object or array */

  // position of first available space per column
  let firstOpenRow = [5, 5, 5, 5, 5, 5, 5];

  /*
   * handy "multi-dimensional" array creating function that takes in arguments
   * courtesy of Matthew Crumley on Stack OverFlow:
   * https: //stackoverflow.com/questions/966225/how-can-i-create-a-two-dimensional-array-in-javascript/966938#966938
   */
  function createArray(length) {
    let newArray = new Array(length || 0), i = length;
    if (arguments.length > 1) {
      let args = Array.prototype.slice.call(arguments, 1);
      while (i--) {
        newArray[length - 1 - i] = createArray.apply(this, args);
      }
    }
    return newArray;
  }

  // fill the board with spaces, fill one preview row above the board
  for (let i = 0; i < 7; i++) {
    // fill the preview row with non-playable spaces
    const $previewSpace = $('<div>');
    $previewSpace.addClass('space preview');
    $previewSpace.appendTo($container);
    previewRow[i] = $previewSpace;
    // insert a down arrow into each preview space
    const $downArrow = $('<i>');
    $downArrow.addClass('fas fa-arrow-down');
    $downArrow.addClass('icon arrow');
    $downArrow.appendTo($previewSpace);
  }
  console.table(previewRow);

  // store board's elements into the multi-dimensional array: board[row][col]
  for (let i = 0; i < 42; i++) {
    // fill each column with playable spaces
    const $space = $('<div>');
    $space.addClass('space');
    $space.html(i);
    $space.appendTo($container);

    // store each space on the viewable game board into the 2d array
    let row = Math.floor(i / 7);
    let col = i % 7;
    board[row][col] = $space;
  }

  let whosTurn;
  let openRow;
  let eventOnClick, eventOnHover;
  // hover-over and on-click functionality for the viewable game board
  // later: implement hover-over and on-click functionality for the preview row
  board.forEach(row => {
    row.forEach($space => {
      // by hovering over one space, make a "preview" appear over that column
      let hoverBoard = $space.hover(function () {
        eventOnHover = (turnCount % 2) ? 'pulsateYellow' : 'pulsateMagenta';
        let col = parseInt($space[0].innerHTML) % 7;
        console.log(`Hover column ${col + 1}.`);
        previewRow[col].addClass(eventOnHover);
      }, function () {
        eventOnHover = (turnCount % 2) ? 'pulsateYellow' : 'pulsateMagenta';
        col = parseInt($space[0].innerHTML) % 7;
        previewRow[col].removeClass(eventOnHover);
      });
      // by clicking on any column, drop a token into the last available space
      let clickBoard = $space.click(function () {
        eventOnHover = (turnCount % 2) ? 'pulsateYellow' : 'pulsateMagenta';
        let col = parseInt($space[0].innerHTML) % 7;
        previewRow[col].removeClass(eventOnHover);
        openRow = firstOpenRow[col];
        eventOnClick = turnCount % 2 ? 'fillYellow' : 'fillMagenta';
        whosTurn = turnCount % 2 ? player.one : player.two;
        console.log(`Click column ${col+1}.`);
        // find first available space in that column
        console.log(`Available space at row ${firstOpenRow[col] + 1}.`);
        // drop the player's piece into that column
        // * create css class for each player piece
        // * for now, just change space color, animate later
        $(board[openRow][col]).addClass(eventOnClick);
        // update (decrement) the first available space in that column
        firstOpenRow[col]--;
        // update (increment) turn
        turnCount++;
        $message.html(`${whosTurn.name}, drop it like it's hot!`);
        console.table(board[openRow][col]);
        console.log(`Turn: ${turnCount}`);
        console.log(`First available space at col ${col} is now row ${firstOpenRow[col]}`);
        eventOnHover = (turnCount % 2) ? 'pulsateYellow' : 'pulsateMagenta';
        // when a column fills up, make that column unclickable (unplayable)
        if (firstOpenRow[col] < 0) {
          disableClicks(col);
          previewRow[col].removeClass(eventOnHover);
        } else {
          previewRow[col].addClass(eventOnHover);
        }
      });
    });
  });
  function disableClicks(col) {
    for(let i = 0; i < board.length; i++) {
      board[i][col].addClass('avoidClicks');
    }
  }
  // console.table(board);
});