// Global Constants
const X = 'x';
const CIRCLE = 'circle';


// Factory functions
const playerFactory = (name, mark) => {
  return { name, mark };
};

const player1 = playerFactory('player 1', 'whatever checkbox selected');
const player2 = playerFactory('player 2', 'whatever checkbox not selected');


// Modules
const boardController = (() => {
  const boardCells = document.querySelectorAll('[data-cell]');
  const gameBoard = document.getElementById('board');

  function boardSetup() {
    const markSelectCheckbox = document.getElementById('mark-selector');
  
    boardCells.forEach(cell => {
      // oneshot with once to prevent click on already occupied cells
      cell.addEventListener('click', gameController.handleCellClick, { once: true }); 
    });
  
    // add selected mark to board classList
    gameController.currentTurn = markSelectCheckbox.checked ? CIRCLE : X;
    // on game start, set markTurn to what player selected
    gameBoard.classList.remove(X);
    gameBoard.classList.remove(CIRCLE);
    gameBoard.classList.add(gameController.currentTurn);
  }

  return {
    gameBoard,
    boardCells,
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
  let currentTurn = CIRCLE;

  function startGame() {
    const welcomeContainer = document.getElementById('welcome-container');
    const singlePlayerBtn = document.getElementById('single-player-button');
    const twoPlayerBtn = document.getElementById('two-player-button');
  
    welcomeContainer.classList.remove('hidden');
  
    singlePlayerBtn.addEventListener('click', (e) => {
      displayController.togglePopupVisibility(welcomeContainer, 'hide');
      boardController.boardSetup();
      // Start a game against CPU
    });
    
    twoPlayerBtn.addEventListener('click', (e) => {
      displayController.togglePopupVisibility(welcomeContainer, 'hide');
      boardController.boardSetup();
      // Start a game against other player
    });
  }

  function handleCellClick(e) {
    const currentCell = e.target;
  
    placeMark(currentCell);
    if (checkForWin()) {
      endGame(false);
    } else if (checkForDraw()) {
      endGame(true);
    } else {
      switchTurn();
    }
  }

  function placeMark(currentCell) {
    currentCell.classList.add(currentTurn);
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
    boardController.gameBoard.classList.remove(currentTurn);
    currentTurn = (currentTurn === CIRCLE) ? X : CIRCLE;
    boardController.gameBoard.classList.add(currentTurn);
  }
  
  function endGame(isDraw) {
    if (isDraw) {
      displayController.resultMessage.textContent = `Draw!`;
    } else {
      displayController.resultMessage.textContent = `${currentTurn} wins!`;
    }
    displayController.togglePopupVisibility(displayController.resultContainer, 'show');
  }

  function resetGame() {
    boardController.boardCells.forEach(cell => {
      cell.classList.remove(X);
      cell.classList.remove(CIRCLE);
    });
  
    boardController.boardSetup();
  
    displayController.togglePopupVisibility(displayController.resultContainer, 'hide');
  }

  _resetBtn.addEventListener('click', (e) => {
    resetGame();
  });
  
  _exitBtn.addEventListener('click', (e) => {
    resetGame();
    startGame();
  });

  return {
    currentTurn,
    startGame,
    handleCellClick,
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

gameController.startGame();