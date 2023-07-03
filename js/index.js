// Global Constants
const EMPTY = 'empty';
const X = 'x';
const CIRCLE = 'circle';
const SINGLE = 'singleplayer';
const MULTI = 'multiplayer';


// Modules
const boardController = (() => {
  const markSelectCheckbox = document.getElementById('mark-selector');
  const boardCells = document.querySelectorAll('.cell');
  const _gameBoard = document.querySelector('.board');

  let _currentBoardArray = [
    [EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY]
  ]

  const getGameBoardDOM = () => {
    return _gameBoard;
  }

  const getCurrentBoard = () => {
    return _currentBoardArray;
  }

  const setCurrentBoard = (row, column, value) => {
    _currentBoardArray[row][column] = value;
  }

  function _resetBoardArray() {
    _currentBoardArray.forEach(row => {
      row.forEach((_element, index) => {
        row[index] = EMPTY;
      });
    });
  }

  function boardSetup() {
    _resetBoardArray();
  
    boardCells.forEach((cell, index) => {
      const row = Math.floor(index / 3);
      const column = index % 3;
      cell.dataset.coord = `${row},${column}`;
      // oneshot with once to prevent click on already occupied cells
      cell.addEventListener('click', gameController.handleCellClick, { once: true }); 
    });
  
    // clear board class list, add X, as X goes first
    _gameBoard.classList.remove(X);
    _gameBoard.classList.remove(CIRCLE);
    _gameBoard.classList.add(X);
  }

  return {
    markSelectCheckbox,
    boardCells,
    getGameBoardDOM,
    getCurrentBoard,
    setCurrentBoard,
    boardSetup,
  }
})();


const gameController = (() => {
  const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // horizontal
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // vertical
    [0, 4, 8], [2, 4, 6] // diagonal
  ]
  const _resetBtn = document.getElementById('reset-button');
  const _exitBtn = document.getElementById('exit-button');

  let _gameMode, _playerMark, _opponentMark;
  let currentTurn = X;

  const getPlayerMark = () => {
    return _playerMark;
  }

  const getOpponentMark = () => {
    return _opponentMark;
  }

  function startGame() {
    const welcomeContainer = document.getElementById('welcome-container');
    const singlePlayerBtn = document.getElementById('single-player-button');
    const twoPlayerBtn = document.getElementById('two-player-button');
  
    welcomeContainer.classList.remove('hidden');

    currentTurn = X;
  
    singlePlayerBtn.addEventListener('click', (e) => {
      // Start a game against CPU
      _gameMode = SINGLE;
      _setPlayerOpponentMarks();
      displayController.togglePopupVisibility(welcomeContainer, 'hide');
      boardController.boardSetup();

      handleAiTurn();
    });
    
    twoPlayerBtn.addEventListener('click', (e) => {
      // Start a game against other player
      _gameMode = MULTI;
      _setPlayerOpponentMarks();
      displayController.togglePopupVisibility(welcomeContainer, 'hide');
      boardController.boardSetup();
    });
  }

  function _setPlayerOpponentMarks() {
    _playerMark = boardController.markSelectCheckbox.checked ? CIRCLE : X;
    _opponentMark = (_playerMark === CIRCLE) ? X : CIRCLE;
  }

  function handleCellClick(e) {
    const currentCell = e.target;
  
    // don't allow clicks if current turn is not player turn in singleplayer mode
    if ((_gameMode === SINGLE) && (currentTurn !== _playerMark)) {
      return;
    }

    placeMark(currentCell);
    if (checkForWin()) {
      endGame(false);
    } else if (checkForDraw()) {
      endGame(true);
    } else {
      switchTurn();

      handleAiTurn();
    }
  }

  function placeMark(currentCell) {
    // add currentTurn's mark class to CSS for visual
    currentCell.classList.add(currentTurn);
    
    // update board array at coordinate where mark was just placed
    const row = currentCell.dataset.coord.charAt(0);
    const column = currentCell.dataset.coord.charAt(2);
    boardController.getCurrentBoard()[row][column] = currentTurn;
  }

  function handleAiTurn() {
    if ((_gameMode === SINGLE) && (currentTurn === _opponentMark)) {
      // Disable player's hover ability during ai turn
      boardController.getGameBoardDOM().classList.add('ai-turn');

      // Minimax algorithm gets best move for ai
      let coordinates = aiController.findBestMove(boardController.getCurrentBoard());
      
      // Short timeout before ai makes move for aesthetics
      setTimeout(() => {
        boardController.boardCells.forEach(cell => {
          if (cell.dataset.coord === coordinates.toString()) {
            placeMark(cell);
          } 
        });
  
        if (checkForWin()) {
          endGame(false);
        } else if (checkForDraw()) {
          endGame(true);
        } else {
          switchTurn();
        }

        // Re-enable player's hover ability after ai turn
        boardController.getGameBoardDOM().classList.remove('ai-turn');  
      }, 500);    
    }
  }

  function checkForWin() {
    return WINNING_COMBINATIONS.some(combination => {
      return combination.every(index => {
        return boardController.boardCells[index].classList.contains(currentTurn);
      });
    });
  }
  
  function checkForDraw() {
    // boardCells is NodeList, not array, so need to spread first with [...]
    return [...boardController.boardCells].every(cell => {
      return cell.classList.contains(X) || cell.classList.contains(CIRCLE);
    });
  }

  function switchTurn() {
    boardController.getGameBoardDOM().classList.remove(currentTurn);
    currentTurn = (currentTurn === CIRCLE) ? X : CIRCLE;
    boardController.getGameBoardDOM().classList.add(currentTurn);
    }

  function endGame(isDraw) {
    if (isDraw) {
      displayController.resultMessage.textContent = `Draw!`;
    } else {
      const winner = (currentTurn === X) ? 'X' : 'Circle'; 
      displayController.resultMessage.textContent = `${winner} Wins!`;
    }
    displayController.togglePopupVisibility(displayController.resultContainer, 'show');
  }

  function resetGame(reset) {
    boardController.getGameBoardDOM().classList.remove(X);
    boardController.getGameBoardDOM().classList.remove(CIRCLE);

    boardController.boardCells.forEach(cell => {
      cell.classList.remove(X);
      cell.classList.remove(CIRCLE);
    });
  
    displayController.togglePopupVisibility(displayController.resultContainer, 'hide');

    if (reset) {
      currentTurn = X;
      boardController.boardSetup();
      handleAiTurn();
    }
  }

  _resetBtn.addEventListener('click', (e) => {
    resetGame(true);
  });
  
  _exitBtn.addEventListener('click', (e) => {
    resetGame(false);
    startGame();
  });

  return {
    currentTurn,
    getPlayerMark,
    getOpponentMark,
    startGame,
    handleCellClick,
    handleAiTurn,
    checkForWin,
    checkForDraw,
    switchTurn,
    endGame,
    resetGame,
  }
})();


const displayController = (() => {
  const resultContainer = document.getElementById('result-container');
  const resultMessage = document.querySelector('[data-result-card-text]');
 
  function togglePopupVisibility(target, state) {
    if (state === 'hide') {
      target.classList.add('hidden');
    } else {
      target.classList.remove('hidden');
    }
  }

  return {
    resultContainer,
    resultMessage,
    togglePopupVisibility,
  }
})();


const aiController = (() => {
  function areMovesLeft(board) {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === EMPTY) {
          return true;
        }
      }
    }

    return false;
  }

  function _evaluateGameState(board) {
    // Check for AI victory on rows
    for(let row = 0; row < 3; row++) {
      if (board[row][0] === board[row][1] && board[row][1] === board[row][2]) {
        if (board[row][0] === gameController.getOpponentMark()) {
          return -10;
        } else if (board[row][0] === gameController.getPlayerMark()) {
          return 10;
        } else {
          return 0;
        }
      }
    }

    // Check for AI victory on columns
    for(let col = 0; col < 3; col++) {
      if (board[0][col] === board[1][col] && board[1][col] === board[2][col]) {
        if (board[0][col] === gameController.getOpponentMark()) {
          return -10;
        } else if (board[0][col] === gameController.getPlayerMark()) {
          return 10;
        } else {
          return 0;
        }
      }
    }

    // Check for AI victory on diagonals
    if (board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
      if (board[0][0] === gameController.getOpponentMark()) {
        return -10;
      } else if (board[0][0] === gameController.getPlayerMark()) {
        return 10;
      } else {
        return 0;
      }
    }

    if (board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
      if (board[0][2] === gameController.getOpponentMark()) {
        return -10;
      } else if (board[0][2] === gameController.getPlayerMark()) {
        return 10;
      } else {
        return 0;
      }
    }

    // Else if nobody has won, return 0
    return 0;
  }

  // Evaluates all possible ways game will go, return the value of the board
  function _minimax(board, depth, isMax) {
    let score = _evaluateGameState(board);

    // If Maximizer has won the game return evaluated score
    if (score === 10) {
      return score;
    }

    // If Minimizer has won the game return evaluated score
    if (score === -10) {
      return score;
    }

    // If there are no more moves and no winner then it is a tie
    if (areMovesLeft(board) === false) {
      return 0;
    }

    // If this is maximizer's move
    if (isMax) {
      let maxEval = -1000;

      // Traverse all cells
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          // Check if cell is empty
          if (board[i][j] === EMPTY) {
            // Make the move
            board[i][j] = gameController.getPlayerMark();

            // Call minimax recursively and choose the maximum value
            maxEval = Math.max(maxEval, _minimax(board, depth + 1, false));

            // Undo the move
            board[i][j] = EMPTY;

            }
          }
        }

      return maxEval;

    } else {
      // if it's minimizer's move
      let minEval = 1000;

      // Traverse all cells
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          // Check if cell is empty
          if (board[i][j] === EMPTY) {
            // Make the move
            board[i][j] = gameController.getOpponentMark();

            // Call minimax recursively and choose the minimum value
            minEval = Math.min(minEval, _minimax(board, depth + 1, true));

            // Undo the move
            board[i][j] = EMPTY;
          }
        }
      }

      return minEval;
    }
  }

  // This function returns the best possible move for AI
  function findBestMove(currentBoard) {
    let bestValue = 1000;
    let bestMove = [-1,-1];

    // Traverse all cells, evaluate minimax function for all empty cells. 
    // Return the cell with optimal value.
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        // Check if cell is empty
        if (currentBoard[i][j] === EMPTY) {
          // Make the move
          currentBoard[i][j] = gameController.getOpponentMark();

          // Compute evaluation function for this move.
          let moveValue = _minimax(currentBoard, 0, true);

          // Undo the move
          currentBoard[i][j] = EMPTY;

          // If moveValue of current move is higher than the bestValue, 
          // update bestValue, and set currently processed cells as new bestMove
          if (moveValue < bestValue) {
            bestMove = [i, j];
            bestValue = moveValue;
          }
        }
      }
    }

    return bestMove;
  }

  return {
    findBestMove,
  }
})();

gameController.startGame();