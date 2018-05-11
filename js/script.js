$(function () {
  // track the number of turns that have taken place
  let countTurns = 0;
  // keep a score
  const score = {
    player1: 0, // player 1
    player2: 0, // player 2
    ties: 0
  };
  /*
   * 2 players: player.one and player.two
   * - each player will have their chosen spaces pushed into an array
   * - each player will have their wins tracked from round to round
   */ 
  const player = {
    one: {
      spaces: [],
      combos: [],
      wins: score.player1
    },
    two: {
      spaces: [],
      combos: [],
      wins: score.player2
    }
  };

  // grab the html body
  const $body = $('body');
  // const $header = $('header').appendTo($body);
  // const $main = $('main').appendTo($body);
  // const $footer = $('footer').appendTo($body);

  // insert game title
  const $gameTitle = $('<h1>');
  $gameTitle.addClass('neon');
  $gameTitle.html(`Connect 4`);
  $gameTitle.appendTo($body);
  
  // insert message below game title
  const $message = $('<p>');
  $message.addClass('message');
  $message.html(`Drop it like it's hot!`);
  $message.appendTo($body);

  // insert the full board (includes the preview row + visible playable board)
  const $fullBoard = $('<div>');
  $fullBoard.addClass('fullBoard');
  $fullBoard.appendTo($body);
  const $previewRow = $('<div>');
  $previewRow.addClass('previewRow');
  $previewRow.appendTo($fullBoard);
  const $board = $('<div>');
  $board.addClass('board');
  $board.appendTo($fullBoard);

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
  console.log(board);
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
    $previewSpace.appendTo($previewRow);
    // insert a down arrow into each preview space
    const $downArrow = $('<i>');
    $downArrow.addClass('fas fa-arrow-down');
    $downArrow.addClass('icon arrow');
    $downArrow.appendTo($previewSpace);
  }

  // store the board's elements into the multi-dimensional array
  // board[row][col]
  for (let i = 0; i < 42; i++) {
    // fill each column with playable spaces
    const $space = $('<div>');
    $space.addClass('space');
    $space.html(i);
    $space.appendTo($board);
  }
  
});