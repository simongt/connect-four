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
      wins: score.player1 // do not assume this is 0
    },
    two: {
      spaces: [],
      combos: [],
      wins: score.player2 // do not assume this is 0
    }
  };

  // grab the html body
  const $body = $('body');
  // insert game name as header
  const $nameOfTheGame = $('<h1>').html(`Connect 4`).appendTo($body);
  const $gameStatus1 = $('<p>').addClass('status').html(`Drop it like it's hot!`).appendTo($body);
  const $board = $('<div>').addClass('board').appendTo($body);

});
