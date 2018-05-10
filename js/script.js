$(function () {
  // track the number of turns that have taken place
  let countTurns = 0;
  // keep a score
  const score = {
    player1: 0, // player 1
    player2: 0, // player 2
    ties: 0
  };
  /**
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

  // fill the board with spaces, fill one preview row above the board
  for(let i = 0; i < 7; i++) {
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
  for (let i = 0; i < 42; i++) {
    // fill each column with playable spaces
    const $space = $('<div>');
    $space.addClass('space');
    $space.html(i);
    $space.appendTo($board);
  }

  /** 
   * column 1: [ 0,  7, 14, 21, 28, 35 ]
   * column 2: [ 1,  8, 15, 22, 29, 36 ]
   * column 3: [ 2,  9, 16, 23, 30, 37 ]
   * column 4: [ 3, 10, 17, 24, 31, 38 ]
   * column 5: [ 4, 11, 18, 25, 32, 39 ]
   * column 6: [ 5, 12, 19, 26, 33, 40 ]
   * column 7: [ 6, 13, 20, 27, 34, 41 ]
   */
  

});