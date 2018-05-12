/**
 * next steps: 
 *  implement auto load of next gameround ☑️
 *  have the spaces populate with an entrance effect
 *  implement scoreboard display & update per round 
 *  implement click & hover functionality on preview row
 *  landing page, animate "connect 4" title from center?
 *  implement responsiveness, check on other devices
 *  go thru grading rubric
 *  attempt ai implementation
 *  create presentation slides
 */
$(function () {
  /*
   * 2 players: player.one and player.two
   * - each player will have their chosen spaces pushed into an array
   * - each player will have their wins tracked from round to round
   */ 
  const player = {
    // for now, let Player 1 be magenta and Player 2 yellow
    // (later, let player's choose their color and name)
    one: {
      name: 'Player 1',
      spaces: [],
      combosOf4: [],
      color: 'magenta',
      moves: 0,
      wins: 0
    },
    two: {
      name: 'Player 2',
      spaces: [],
      combosOf4: [],
      color: 'yellow',
      moves: 0,
      wins: 0
    }
  };

  // track the number of turns that have taken place
  let turnCount = 0;
  let whosTurn = turnCount % 2 ? player.two : player.one;

  let ties = 0;
  // keep a score
  // const score = {
  //   player1: 0, // player 1 is magenta
  //   player2: 0, // player 2 is yellow
  //   ties: 0
  // };

  // grab the html body
  const $body = $('body');

  // insert game title
  let $gameTitle = $('<h1>');
  $gameTitle.addClass('neon');
  $gameTitle.html(`Connect 4`);
  $gameTitle.appendTo($body);
  
  // insert message below game title
  let $message = $('<p>');
  $message.addClass('message');
  $message.toggleClass('fadeIn');
  $message.html(`${player.one.name}, drop it like it's hot!`);
  $message.appendTo($body);

  // insert the full board (includes the preview row + visible playable board)
  let $container = $('<div>');
  $container.addClass('gameContainer');
  $container.appendTo($body);

  let $scoreBoardTitle = $('<p>');
  $scoreBoardTitle.addClass('scoreBoardTitle');
  $scoreBoardTitle.html('ScoreBoard');
  $scoreBoardTitle.appendTo($body);

  let $scoreBoard = $('<div>');
  $scoreBoard.addClass('scoreBoard');
  $scoreBoard.appendTo($body);

  let $player1ScoreLabel = $('<div>');
  let $tiesScoreLabel = $('<div>');
  let $player2ScoreLabel = $('<div>');
  let $player1Score = $('<div>');
  let $tiesScore = $('<div>');
  let $player2Score = $('<div>');

  $player1ScoreLabel.addClass('score');
  $tiesScoreLabel.addClass('score');
  $player2ScoreLabel.addClass('score');
  $player1Score.addClass('score player1');
  $tiesScore.addClass('score ties');
  $player2Score.addClass('score player2');

  $player1ScoreLabel.html(player.one.name);
  $player2ScoreLabel.html(player.two.name);
  $player1Score.html(player.one.wins);
  $tiesScore.html(`ties: ${ties}`);
  $player2Score.html(player.two.wins);

  $player1ScoreLabel.appendTo($scoreBoard);
  $tiesScoreLabel.appendTo($scoreBoard);
  $player2ScoreLabel.appendTo($scoreBoard);
  $player1Score.appendTo($scoreBoard);
  $tiesScore.appendTo($scoreBoard);
  $player2Score.appendTo($scoreBoard);

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

  // let filledSpaces = createArray(6, 7);
  // filledSpaces.forEach(row => {
  //   row.fill(null);
  // });
  // console.table(filledSpaces);

  /**
   * in total, there will be 69 possible winning connections of four
   * - 21 vertical connections of four (3 solutions x 7 columns)
   * - 24 horizontal connections of four (4 solutions x 6 rows)
   * - 24 diagonal connections of four (12 solutions x 2 directions)
   */
  const winningConnectionsOf4 = [
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
  // Array.sort() works alphabetically by default, add a numerical sorting rule
  // https://stackoverflow.com/questions/1063007/how-to-sort-an-array-of-integers-correctly
  winningConnectionsOf4.sort((position1, position2) => position1 - position2);
  console.log(winningConnectionsOf4);

  // a player's winning connection, can be greater than 4 in a row
  let winningConnection = [];

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

  let openRow;
  let eventOnClick, eventOnHover;
  let boardPosition;
  playRound();
  function playRound() {
    // hover-over and on-click functionality for the viewable game board
    // later: implement hover-over and on-click functionality for the preview row
    board.forEach(row => {
      row.forEach($space => {
        // by hovering over one space, make a "preview" appear over that column
        let hoverBoard = $space.hover(function () {
          eventOnHover = (turnCount % 2) ? 'pulsateYellow' : 'pulsateMagenta';
          boardPosition = parseInt($space[0].innerHTML);
          let col = boardPosition % 7;
          console.log(`Hover column ${col}.`);
          previewRow[col].addClass(eventOnHover);
        }, function () {
          eventOnHover = (turnCount % 2) ? 'pulsateYellow' : 'pulsateMagenta';
          col = parseInt($space[0].innerHTML) % 7;
          previewRow[col].removeClass(eventOnHover);
        });
        // by clicking on any column, drop a token into the last available space
        let clickBoard = $space.click(function () {
          whosTurn.moves++;
          eventOnHover = (turnCount % 2) ? 'pulsateYellow' : 'pulsateMagenta';
          // position clicked, represents the column to insert but not necessarily the position to insert
          boardPosition = parseInt($space[0].innerHTML);
          let col = boardPosition % 7;
          previewRow[col].removeClass(eventOnHover);
          openRow = firstOpenRow[col];
          eventOnClick = turnCount % 2 ? 'fillYellow' : 'fillMagenta';
          // whosTurn = turnCount % 2 ? player.two : player.one;
          console.log(`Click column ${col}, board position ${boardPosition}.`);
          // find first available space in that column
          console.log(`Available space at row ${firstOpenRow[col]}.`);
          // drop the player's piece into that column
          // * create css class for each player piece
          // * for now, just change space color, animate later
          $(board[openRow][col]).addClass(eventOnClick);
          let insertPosition = (openRow * 7) + col;
          console.log(`Insert at row ${openRow}, col ${col}, board position ${(openRow * 7) + col}.`);
          // whosTurn.spaces.push(boardPosition); // INCORRECT, instead use position where piece drops to?
          whosTurn.spaces.push(insertPosition);
          // whosTurn.spaces.sort(); // INCORRECT, sorts alphabetically, not numerically
          // add a numerical sorting rule
          // https://stackoverflow.com/questions/1063007/how-to-sort-an-array-of-integers-correctly
          whosTurn.spaces.sort((position1, position2) => position1 - position2);
          let roundIsWon = false;
          if (whosTurn.spaces.length >= 4) {
            whosTurn.combosOf4 = getCombosOf(whosTurn.spaces, 4);
            // console.table(whosTurn.combosOf4);
            roundIsWon = checkForWinningConnection(whosTurn.combosOf4);
            if (roundIsWon) {
              $container.addClass('avoidClicks');
              whosTurn.wins++; // for scoreboard
              $message.html(`${whosTurn.name} wins in ${whosTurn.moves} moves with a connection of ${winningConnection.length}!`);
              $message.addClass('blink');
              animateWinningConnection();
              clearGameBoard(5000);
            }
          }
          console.table(player);
          console.log(`First available space at col ${col} is now row ${firstOpenRow[col]}`);
          // update (decrement) the first available space in that column
          firstOpenRow[col]--;
          // update (increment) turn
          turnCount++;
          whosTurn = turnCount % 2 ? player.two : player.one;
          if (!roundIsWon && turnCount < 42) {
            $message.html(`${whosTurn.name}, drop it like it's hot!`);
          } else if (!roundIsWon) {
            $message.addClass('blink');
            $message.html(`Woah, we have a draw!`);
            ties++;
            clearGameBoard(5000);
          }
          console.table(board[openRow][col]);
          console.log(`Turn: ${turnCount}`);
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
  }

  function disableClicks(col) {
    for(let i = 0; i < board.length; i++) {
      board[i][col].addClass('avoidClicks');
    }
  }

  function clearGameBoard(time) {
    // console.table(board);
    // $container.addClass('flipBoard');
    board.forEach(row => {
      row.forEach($space => {
        setTimeout(function() {
          $space.removeClass('winner');
          $space.removeClass('fillMagenta');
          $space.removeClass('fillYellow');
          $space.addClass('clear');
          $message.html(`Prepare for the next round.`);
        }, time);
      });
    });
    setTimeout(function () {
      $container.remove();
      $container = $('<div>');
      $container.addClass('gameContainer');
      $container.appendTo($body);
      updateScore();
      resetRoundData();
      initGameBoard();
      playRound();
    }, time + 1000);
  }

  function updateScore() {
    $scoreBoardTitle.remove();
    $scoreBoardTitle = $('<p>');
    $scoreBoardTitle.addClass('scoreBoardTitle');
    $scoreBoardTitle.html('ScoreBoard');
    $scoreBoardTitle.appendTo($body);

    $scoreBoard.remove();
    $scoreBoard = $('<div>');
    $scoreBoard.addClass('scoreBoard');
    $scoreBoard.appendTo($body);

    $player1ScoreLabel = $('<div>');
    $tiesScoreLabel = $('<div>');
    $player2ScoreLabel = $('<div>');
    $player1Score = $('<div>');
    $tiesScore = $('<div>');
    $player2Score = $('<div>');

    $player1ScoreLabel.addClass('score');
    $tiesScoreLabel.addClass('score');
    $player2ScoreLabel.addClass('score');
    $player1Score.addClass('score player1');
    $tiesScore.addClass('score ties');
    $player2Score.addClass('score player2');

    $player1ScoreLabel.html(player.one.name);
    $player2ScoreLabel.html(player.two.name);
    $player1Score.html(player.one.wins);
    $tiesScore.html(`ties: ${ties}`);
    $player2Score.html(player.two.wins);

    $player1ScoreLabel.appendTo($scoreBoard);
    $tiesScoreLabel.appendTo($scoreBoard);
    $player2ScoreLabel.appendTo($scoreBoard);
    $player1Score.appendTo($scoreBoard);
    $tiesScore.appendTo($scoreBoard);
    $player2Score.appendTo($scoreBoard);
  }

  function resetRoundData() {
    turnCount = 0;
    player.one.spaces = [];
    player.one.combosOf4 = [];
    player.one.moves = 0;
    player.two.spaces = [];
    player.two.combosOf4 = [];
    player.two.moves = 0;
    board = createArray(6, 7);
    winningConnection = [];
    firstOpenRow = [5, 5, 5, 5, 5, 5, 5];
    whosTurn = turnCount % 2 ? player.two : player.one;
  }

  function checkForWinningConnection(combosOf4) {
    let isWin = false;
    for (const comboOf4 of combosOf4) { // player combos
      for (const winningConnectionOf4 of winningConnectionsOf4) { // connections of 4
        if ((comboOf4[0] === winningConnectionOf4[0]) &&
            (comboOf4[1] === winningConnectionOf4[1]) &&
            (comboOf4[2] === winningConnectionOf4[2]) &&
            (comboOf4[3] === winningConnectionOf4[3])) {
          console.log(`${comboOf4} is a connection of 4.`);
          // animateWinningConnection(combo);
          // combo gives us the board position that we want to animate
          comboOf4.forEach(boardPosition => {
            if (!winningConnection.includes(boardPosition)) {
              winningConnection.push(boardPosition);
            }
          });
          isWin = true;
        }
        // will continue to search for winning connections in case > 4 in a row
      }
    }
    console.log(winningConnection);
    return isWin;
  }

  function animateWinningConnection() {
    console.log(`Animate winning connection.`);
    console.table(board[0]);
    console.table(winningConnection);
    console.log($container[0]);
    winningConnection.forEach(winningPosition => {
      // animate
      let row = 0, col = 0;
      row = Math.floor(winningPosition / 7);
      col = winningPosition % 7;
      console.log(board[row][col]);
      $(board[row][col]).addClass('winner');
    });
  }

  function initGameBoard() {
    $message.html(`${whosTurn.name}, drop it like it's hot!`);
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
  }

  // Akseli Palén's solution for calculating combinations of elements in Array
  // Github: https://gist.github.com/axelpale/3118596
  //
  // Algorithm description:
  // To get k-combinations of a set, we want to join each element
  // with all (k-1)-combinations of the other elements. The set of
  // these k-sized sets would be the desired result. However, as we
  // represent sets with lists, we need to take duplicates into
  // account. To avoid producing duplicates and also unnecessary
  // computing, we use the following approach: each element i
  // divides the list into three: the preceding elements, the
  // current element i, and the subsequent elements. For the first
  // element, the list of preceding elements is empty. For element i,
  // we compute the (k-1)-computations of the subsequent elements,
  // join each with the element i, and store the joined to the set of
  // computed k-combinations. We do not need to take the preceding
  // elements into account, because they have already been the i:th
  // element so they are already computed and stored. When the length
  // of the subsequent list drops below (k-1), we cannot find any
  // (k-1)-combs, hence the upper limit for the iteration.
  function getCombosOf(set, k) {
    var i, j, combos, head, tailCombos;

    // There is no way to take e.g. sets of 5 elements from
    // a set of 4.
    if (k > set.length || k <= 0) {
      return [];
    }

    // K-sized set has only one K-sized subset.
    if (k == set.length) {
      return [set];
    }

    // There is N 1-sized subsets in a N-sized set.
    if (k == 1) {
      combos = [];
      for (i = 0; i < set.length; i++) {
        combos.push([set[i]]);
      }
      return combos;
    }

    // Assert {1 < k < set.length}
    combos = [];
    for (i = 0; i < set.length - k + 1; i++) {
      // head is a list that includes only our current element.
      head = set.slice(i, i + 1);
      // We take smaller combinations from the subsequent elements
      tailCombos = getCombosOf(set.slice(i + 1), k - 1);
      // For each (k-1)-combination we join it with the current
      // and store it to the set of k-combinations.
      for (j = 0; j < tailCombos.length; j++) {
        combos.push(head.concat(tailCombos[j]));
      }
    }
    return combos;
  }
});