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

  for(let i = 0; i < 7; i++) {
    // fill the preview row with non-playable spaces
    const $space = $('<div>');
    $space.addClass('space preview');
    $space.appendTo($previewRow);
    // fill the preview row with non-playable spaces
    const $downArrow = $('<i>');
    $downArrow.addClass('fas fa-arrow-down');
    $downArrow.addClass('icon arrow');
    $downArrow.appendTo($space);
  }
  for (let i = 0; i < 42; i++) {
    // fill the preview row with non-playable spaces
    const $space = $('<div>');
    $space.addClass('space');
    $space.appendTo($board);
  }
});