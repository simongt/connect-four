/**
 * Connect Four Game Implementation
 * 
 * This is a vanilla JavaScript/jQuery implementation of the classic Connect Four game.
 * The game features a 6x7 grid where players take turns dropping colored pieces.
 * The first player to connect 4 pieces horizontally, vertically, or diagonally wins.
 * 
 * @author Simon G. Tsegay
 * @version 1.0.0
 * @since 2018
 */

/*
 * TODO: Future Enhancements
 * - implement click & hover functionality on preview row
 * - implement keyboard functionality to drop pieces
 * - clean up transitions & animations between rounds
 * - implement ai + a menu with option to play 1-1 or 1-ai
 * - add button for hint (to suggest a move based on ai)
 * - add button for instructions on how to play
 * - add button to undo last move(s)
 * - improve buttons below game board
 * - improve win or tie declaration, animate a modal pop-up
 * - toggle starting player and color per round
 * - restructure scoring system
 *   -- add bonus for connections of more than 4
 *   -- add bonus for amount of remaining pieces post-win
 * - add more sound effects
 * - eventually add network functionality to play 1-1 remotely
 */

$(function () {
  /**
   * Game State Management
   * 
   * Player objects store game state for each player including:
   * - name: Player identifier
   * - color: Visual representation (magenta/yellow)
   * - isAI: Future AI player flag
   * - spaces: Array of occupied board positions
   * - combosOf4: All possible 4-piece combinations from player's moves
   * - moves: Number of moves made this round
   * - wins: Total wins across all rounds
   */
  const player = {
    one: {
      name: 'Player 1',
      color: 'magenta',
      isAI: false,
      spaces: [],
      combosOf4: [],
      moves: 0,
      wins: 0
    },
    two: {
      name: 'Player 2',
      color: 'yellow',
      isAI: false,
      spaces: [],
      combosOf4: [],
      moves: 0,
      wins: 0
    }
  };

  // Global game state
  let ties = 0;                    // Total ties across all rounds
  let turnCount = 0;               // Current turn number (0-based)
  let whosTurn = turnCount % 2 ? player.two : player.one;  // Current player

  // DOM element references
  const $body = $('body');

  /**
   * UI Elements - Game Title
   * Creates the main "Connect 4" title with entrance animation
   */
  let $gameTitle = $('<h1>');
  $gameTitle.addClass('title enter');
  $gameTitle.html(`Connect 4`);
  $gameTitle.appendTo($body);

  /**
   * UI Elements - Start Button
   * Triggers transition from landing page to game view
   */
  let $startButton = $('<p>');
  $startButton.addClass('start');
  $startButton.html('Play');

  /**
   * UI Elements - Game Status Message
   * Displays current player turn and game status
   */
  let $message = $('<p>');
  $message.addClass('message');
  $message.addClass('fadeIn');
  $message.html(`${player.one.name}, drop it like it's hot!`);

  /**
   * UI Elements - Game Container Border
   * Creates visual border above the game board
   */
  let $containerLid = $('<div>');
  $containerLid.addClass('containerLid');

  /**
   * UI Elements - Main Game Container
   * Houses the preview row and 6x7 game board
   */
  let $container = $('<div>');
  $container.addClass('gameContainer');

  /**
   * UI Elements - Scoreboard Components
   * Displays player scores and ties
   */
  let $scoreBoardTitle = $('<p>');
  $scoreBoardTitle.addClass('scoreBoardTitle');
  $scoreBoardTitle.html('Score Board');

  let $scoreBoard = $('<div>');
  $scoreBoard.addClass('scoreBoard');

  // Scoreboard content elements
  let $player1ScoreLabel = $('<div>');
  let $tiesScoreLabel = $('<div>');
  let $player2ScoreLabel = $('<div>');
  let $player1Score = $('<div>');
  let $tiesScore = $('<div>');
  let $player2Score = $('<div>');

  // Apply scoreboard styling
  $player1ScoreLabel.addClass('score');
  $tiesScoreLabel.addClass('score');
  $player2ScoreLabel.addClass('score');
  $player1Score.addClass('score player1');
  $tiesScore.addClass('score ties');
  $player2Score.addClass('score player2');

  // Set scoreboard text content
  $player1ScoreLabel.html(player.one.name);
  $player2ScoreLabel.html(player.two.name);
  $player1Score.html(player.one.wins);
  $tiesScore.html(`ties: ${ties}`);
  $player2Score.html(player.two.wins);

  /**
   * UI Elements - Reset Button
   * Allows players to restart the current round
   */
  let $resetButton = $('<p>');
  $resetButton.addClass('resetRound');
  $resetButton.html('Restart Round');

  // Modal pop-up (commented out - future enhancement)
  // let $modal = $('<div>');
  // $modal.addClass('modal');
  // let $modalContent = $('<p>');
  // $modalContent.addClass('modalContent');
  // let $closeModal = $('<p>');
  // $closeModal.html(`X`);
  // $closeModal.addClass('closeButton');

  /**
   * Audio Element
   * Sound effect for winning moves
   */
  let dilih = $('audio')[0]; // DOM manipulation without HTML

  /**
   * Game Board Data Structures
   */
  
  // Preview row - shows piece placement preview above the game board
  let previewRow = [];
  
  // Main game board - 2D array representing 6 rows x 7 columns
  let board = createArray(6, 7);
  
  /**
   * Board Layout Reference:
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
   * Array representation by [row][col]
   *  [ 5 ] [  0 ...  6 ]
   *  [ 4 ] [  7 ... 13 ]
   *  [ 3 ] [ 14 ... 20 ]
   *  [ 2 ] [ 21 ... 27 ]
   *  [ 1 ] [ 28 ... 34 ]
   *  [ 0 ] [ 35 ... 41 ]
   */

  /**
   * Winning Combinations
   * 
   * All possible winning connections of four pieces:
   * - 21 vertical connections (3 solutions x 7 columns)
   * - 24 horizontal connections (4 solutions x 6 rows)  
   * - 24 diagonal connections (12 solutions x 2 directions)
   * Total: 69 possible winning combinations
   */
  const winningConnectionsOf4 = [
    // Vertical solutions
    [0, 7, 14, 21], [7, 14, 21, 28], [14, 21, 28, 35],
    [1, 8, 15, 22], [8, 15, 22, 29], [15, 22, 29, 36],
    [2, 9, 16, 23], [9, 16, 23, 30], [16, 23, 30, 37],
    [3, 10, 17, 24], [10, 17, 24, 31], [17, 24, 31, 38],
    [4, 11, 18, 25], [11, 18, 25, 32], [18, 25, 32, 39],
    [5, 12, 19, 26], [12, 19, 26, 33], [19, 26, 33, 40],
    [6, 13, 20, 27], [13, 20, 27, 34], [20, 27, 34, 41],
    // Horizontal solutions
    [0, 1, 2, 3], [1, 2, 3, 4], [2, 3, 4, 5], [3, 4, 5, 6],
    [7, 8, 9, 10], [8, 9, 10, 11], [9, 10, 11, 12], [10, 11, 12, 13],
    [14, 15, 16, 17], [15, 16, 17, 18], [16, 17, 18, 19], [17, 18, 19, 20],
    [21, 22, 23, 24], [22, 23, 24, 25], [23, 24, 25, 26], [24, 25, 26, 27],
    [28, 29, 30, 31], [29, 30, 31, 32], [30, 31, 32, 33], [31, 32, 33, 34],
    [35, 36, 37, 38], [36, 37, 38, 39], [37, 38, 39, 40], [38, 39, 40, 41],
    // Diagonal solutions
    [0, 8, 16, 24], [7, 15, 23, 31], [14, 22, 30, 38],
    [1, 9, 17, 25], [8, 16, 24, 32], [15, 23, 31, 39],
    [2, 10, 18, 26], [9, 17, 25, 33], [16, 24, 32, 40],
    [3, 11, 19, 27], [10, 18, 26, 34], [17, 25, 33, 41],
    [3, 9, 15, 21], [4, 10, 16, 22], [5, 11, 17, 23], [6, 12, 18, 24],
    [10, 16, 22, 28], [11, 17, 23, 29], [12, 18, 24, 30], [13, 19, 25, 31],
    [17, 23, 29, 35], [18, 24, 30, 36], [19, 25, 31, 37], [20, 26, 32, 38]
  ];

  // Sort winning combinations for consistent comparison
  winningConnectionsOf4.sort((position1, position2) => position1 - position2);

  // Game state variables
  let winningConnection = [];  // Current winning connection (can be > 4 pieces)
  let firstOpenRow = [5, 5, 5, 5, 5, 5, 5];  // First available row per column

  /**
   * Creates a multi-dimensional array
   * 
   * @param {number} length - Primary array length
   * @param {...number} args - Additional dimensions
   * @returns {Array} Multi-dimensional array
   * 
   * @example
   * createArray(6, 7) // Creates 6x7 2D array
   * 
   * Courtesy of Matthew Crumley on Stack Overflow:
   * https://stackoverflow.com/questions/966225/how-can-i-create-a-two-dimensional-array-in-javascript/966938#966938
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

  /**
   * Populates the game board with DOM elements
   * 
   * Creates the preview row and main game board, setting up
   * the visual representation and click handlers
   */
  function populateGameBoard() {
    // Create preview row (7 spaces above the main board)
    for (let i = 0; i < 7; i++) {
      const $previewSpace = $('<div>');
      $previewSpace.addClass('space preview');
      $previewSpace.appendTo($container);
      previewRow[i] = $previewSpace;
      
      // Add down arrow icon to each preview space
      const $downArrow = $('<i>');
      $downArrow.addClass('fas fa-arrow-down');
      $downArrow.addClass('icon arrow');
      $downArrow.appendTo($previewSpace);
    }
    console.table(previewRow);

    // Create main game board (42 spaces in 6x7 grid)
    for (let i = 0; i < 42; i++) {
      const $space = $('<div>');
      $space.addClass('space');
      $space.html(i);  // Store position number for reference
      $space.appendTo($container);
      
      // Map to 2D array structure
      let row = Math.floor(i / 7);
      let col = i % 7;
      board[row][col] = $space;
    }
  }

  /**
   * Displays all game UI elements in sequence
   * 
   * Called after landing page transition to show the complete game interface
   */
  function displayGameBoard() {
    $message.appendTo($body);
    $containerLid.appendTo($body);
    $container.appendTo($body);
    $scoreBoardTitle.appendTo($body);
    $scoreBoard.appendTo($body);
    $player1ScoreLabel.appendTo($scoreBoard);
    $tiesScoreLabel.appendTo($scoreBoard);
    $player2ScoreLabel.appendTo($scoreBoard);
    $player1Score.appendTo($scoreBoard);
    $tiesScore.appendTo($scoreBoard);
    $player2Score.appendTo($scoreBoard);
    $resetButton.appendTo($body);
  }

  /**
   * Landing Page Display and Transition
   * 
   * Handles the initial page load and transition to game view
   */
  landingDisplay();
  function landingDisplay() {
    // Show start button after title animation
    setTimeout(() => {
      $startButton.appendTo($body);
    }, 1000);
    
    // Handle start button click
    let clickStart = $startButton.click(function () {
      clickStart.off();  // Remove click handler
      
      // Animate title transition
      $gameTitle.removeClass('title enter');
      $gameTitle.addClass('neon glow');
      $gameTitle.addClass('title slide');
      $gameTitle.toggleClass('up');
      $startButton.remove();
      
      // Transition to game view
      setTimeout(() => {
        displayGameBoard();
        populateGameBoard();
        if(whosTurn.isAI) {
          // TODO: Handle AI player turn
        } else {
          playRound();
        }
      }, 500);
    });
  }

  // Game state variables for current round
  let openRow;           // Next available row in selected column
  let eventOnClick;      // CSS class for piece placement
  let eventOnHover;      // CSS class for hover preview
  let boardPosition;     // Clicked board position (0-41)

  /**
   * Main Game Loop
   * 
   * Handles all game interactions including:
   * - Board clicks and piece placement
   * - Hover previews
   * - Win detection
   * - Turn management
   * - Round completion
   */
  function playRound() {
    // Setup restart functionality
    let clickRestart = $resetButton.click(function() {
      clearGameBoard(0);
    });
    
    // Add click and hover handlers to each board space
    board.forEach(row => {
      row.forEach($space => {
        // Hover preview functionality
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
        
        // Click to place piece functionality
        let clickBoard = $space.click(function () {
          whosTurn.moves++;
          eventOnHover = (turnCount % 2) ? 'pulsateYellow' : 'pulsateMagenta';
          
          // Calculate column and available row
          boardPosition = parseInt($space[0].innerHTML);
          let col = boardPosition % 7;
          previewRow[col].removeClass(eventOnHover);
          openRow = firstOpenRow[col];
          eventOnClick = turnCount % 2 ? 'fillYellow' : 'fillMagenta';
          
          console.log(`Click column ${col}, board position ${boardPosition}.`);
          console.log(`Available space at row ${firstOpenRow[col]}.`);
          
          // Place the piece
          $(board[openRow][col]).addClass(eventOnClick);
          let insertPosition = (openRow * 7) + col;
          console.log(`Insert at row ${openRow}, col ${col}, board position ${(openRow * 7) + col}.`);
          
          // Update player's occupied spaces
          whosTurn.spaces.push(insertPosition);
          whosTurn.spaces.sort((position1, position2) => position1 - position2);
          
          // Check for win condition
          let roundIsWon = false;
          if (whosTurn.spaces.length >= 4) {
            whosTurn.combosOf4 = getCombosOf(whosTurn.spaces, 4);
            roundIsWon = checkForWinningConnection(whosTurn.combosOf4);
            
            if (roundIsWon) {
              clickRestart.off();
              $container.addClass('avoidClicks');
              whosTurn.wins++;
              $message.html(`${whosTurn.name} wins in ${whosTurn.moves} moves with a connection of ${winningConnection.length}!`);
              $message.addClass('blink');
              animateWinningConnection();
              clearGameBoard(7000);
              $message.removeClass('blink');
            }
          }
          
          console.table(player);
          console.log(`First available space at col ${col} is now row ${firstOpenRow[col]}`);
          
          // Update game state
          firstOpenRow[col]--;
          turnCount++;
          whosTurn = turnCount % 2 ? player.two : player.one;
          
          // Update UI for next turn or end game
          if (!roundIsWon && turnCount < 42) {
            $message.html(`${whosTurn.name}, drop it like it's hot!`);
          } else if (!roundIsWon) {
            $message.html(`Woah, we have a draw!`);
            $message.addClass('blink');
            ties++;
            clickRestart.off();
            clearGameBoard(5000);
          }
          
          console.table(board[openRow][col]);
          console.log(`Turn: ${turnCount}`);
          
          // Update hover preview for next player
          eventOnHover = (turnCount % 2) ? 'pulsateYellow' : 'pulsateMagenta';
          
          // Disable clicks on full columns
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

  /**
   * Disables click events for a full column
   * 
   * @param {number} col - Column index to disable
   */
  function disableClicks(col) {
    for(let i = 0; i < board.length; i++) {
      board[i][col].addClass('avoidClicks');
    }
  }

  /**
   * Clears the game board and resets for a new round
   * 
   * @param {number} time - Delay before clearing (milliseconds)
   */
  function clearGameBoard(time) {
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
    }, time + 2000);
  }

  /**
   * Updates the scoreboard display with current scores
   */
  function updateScore() {
    // Recreate scoreboard elements
    $scoreBoardTitle.remove();
    $scoreBoardTitle = $('<p>');
    $scoreBoardTitle.addClass('scoreBoardTitle');
    $scoreBoardTitle.html('ScoreBoard');
    $scoreBoardTitle.appendTo($body);

    $scoreBoard.remove();
    $scoreBoard = $('<div>');
    $scoreBoard.addClass('scoreBoard');
    $scoreBoard.appendTo($body);

    // Recreate score elements
    $player1ScoreLabel = $('<div>');
    $tiesScoreLabel = $('<div>');
    $player2ScoreLabel = $('<div>');
    $player1Score = $('<div>');
    $tiesScore = $('<div>');
    $player2Score = $('<div>');

    // Apply styling
    $player1ScoreLabel.addClass('score');
    $tiesScoreLabel.addClass('score');
    $player2ScoreLabel.addClass('score');
    $player1Score.addClass('score player1');
    $tiesScore.addClass('score ties');
    $player2Score.addClass('score player2');

    // Update content
    $player1ScoreLabel.html(player.one.name);
    $player2ScoreLabel.html(player.two.name);
    $player1Score.html(player.one.wins);
    $tiesScore.html(`ties: ${ties}`);
    $player2Score.html(player.two.wins);

    // Append to DOM
    $player1ScoreLabel.appendTo($scoreBoard);
    $tiesScoreLabel.appendTo($scoreBoard);
    $player2ScoreLabel.appendTo($scoreBoard);
    $player1Score.appendTo($scoreBoard);
    $tiesScore.appendTo($scoreBoard);
    $player2Score.appendTo($scoreBoard);

    $resetButton.remove();
    $resetButton.appendTo($body);
  }

  /**
   * Resets all round-specific data for a new game
   */
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

  /**
   * Checks if any of the player's 4-piece combinations form a winning connection
   * 
   * @param {Array} combosOf4 - Array of 4-piece combinations to check
   * @returns {boolean} True if a winning connection is found
   */
  function checkForWinningConnection(combosOf4) {
    let isWin = false;
    
    // Check each player combination against winning patterns
    for (const comboOf4 of combosOf4) {
      for (const winningConnectionOf4 of winningConnectionsOf4) {
        if ((comboOf4[0] === winningConnectionOf4[0]) &&
            (comboOf4[1] === winningConnectionOf4[1]) &&
            (comboOf4[2] === winningConnectionOf4[2]) &&
            (comboOf4[3] === winningConnectionOf4[3])) {
          console.log(`${comboOf4} is a connection of 4.`);
          
          // Add winning positions to global winning connection
          comboOf4.forEach(boardPosition => {
            if (!winningConnection.includes(boardPosition)) {
              winningConnection.push(boardPosition);
            }
          });
          isWin = true;
        }
      }
    }
    console.log(winningConnection);
    return isWin;
  }

  /**
   * Animates the winning connection and plays victory sound
   */
  function animateWinningConnection() {
    console.log(`Animate winning connection.`);
    console.table(board[0]);
    console.table(winningConnection);
    console.log($container[0]);
    
    winningConnection.forEach(winningPosition => {
      let row = 0, col = 0;
      row = Math.floor(winningPosition / 7);
      col = winningPosition % 7;
      console.log(board[row][col]);
      $(board[row][col]).addClass('winner');
    });
    
    dilih.play();
  }

  /**
   * Initializes a new game board
   * 
   * Creates the preview row and main board elements
   */
  function initGameBoard() {
    $message.html(`${whosTurn.name}, drop it like it's hot!`);
    
    // Create preview row
    for (let i = 0; i < 7; i++) {
      const $previewSpace = $('<div>');
      $previewSpace.addClass('space preview');
      $previewSpace.appendTo($container);
      previewRow[i] = $previewSpace;
      
      const $downArrow = $('<i>');
      $downArrow.addClass('fas fa-arrow-down');
      $downArrow.addClass('icon arrow');
      $downArrow.appendTo($previewSpace);
    }

    // Create main board
    for (let i = 0; i < 42; i++) {
      const $space = $('<div>');
      $space.addClass('space');
      $space.html(i);
      $space.appendTo($container);

      let row = Math.floor(i / 7);
      let col = i % 7;
      board[row][col] = $space;
    }
  }

  /**
   * Calculates all possible k-element combinations from a set
   * 
   * @param {Array} set - Input set of elements
   * @param {number} k - Size of combinations to generate
   * @returns {Array} Array of k-element combinations
   * 
   * Algorithm by Akseli Palén:
   * https://gist.github.com/axelpale/3118596
   * 
   * To get k-combinations of a set, we want to join each element
   * with all (k-1)-combinations of the other elements. The set of
   * these k-sized sets would be the desired result. However, as we
   * represent sets with lists, we need to take duplicates into
   * account. To avoid producing duplicates and also unnecessary
   * computing, we use the following approach: each element i
   * divides the list into three: the preceding elements, the
   * current element i, and the subsequent elements. For the first
   * element, the list of preceding elements is empty. For element i,
   * we compute the (k-1)-computations of the subsequent elements,
   * join each with the element i, and store the joined to the set of
   * computed k-combinations. We do not need to take the preceding
   * elements into account, because they have already been the i:th
   * element so they are already computed and stored. When the length
   * of the subsequent list drops below (k-1), we cannot find any
   * (k-1)-combs, hence the upper limit for the iteration.
   */
  function getCombosOf(set, k) {
    var i, j, combos, head, tailCombos;

    // There is no way to take e.g. sets of 5 elements from a set of 4.
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