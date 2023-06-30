const X = 'x';
const CIRCLE = 'circle';

const playerFactory = (name, mark) => {
  return { name, mark };
};

const player1 = playerFactory('player 1', 'whatever checkbox selected');
const player2 = playerFactory('player 2', 'whatever checkbox not selected');

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // horizontal
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // vertical
  [0, 4, 8], [2, 4, 6] // diagonal
]

let gameBoardArray = {};

const boardCells = document.querySelectorAll('[data-cell]');
const gameBoard = document.getElementById('board');

const resultContainer = document.getElementById('result-container');
const resultMessage = document.querySelector('[data-result-card-text]');
const resetBtn = document.getElementById('reset-button');
const exitBtn = document.getElementById('exit-button');

let currentTurn = CIRCLE;

resetBtn.addEventListener('click', (e) => {
  resetGame();
});

exitBtn.addEventListener('click', (e) => {
  resetGame();
  startGame();
});

startGame();

function startGame() {
  const welcomeContainer = document.getElementById('welcome-container');
  const singlePlayerBtn = document.getElementById('single-player-button');
  const twoPlayerBtn = document.getElementById('two-player-button');

  welcomeContainer.classList.remove('hidden');

  singlePlayerBtn.addEventListener('click', (e) => {
    togglePopupVisibility(welcomeContainer, 'hide');
    boardSetup();
    // Start a game against CPU
  });
  
  twoPlayerBtn.addEventListener('click', (e) => {
    togglePopupVisibility(welcomeContainer, 'hide');
    boardSetup();
    // Start a game against other player
  });
}

function togglePopupVisibility(target, state) {
  if (state === 'hide') {
    target.classList.add('hidden');
  } else {
    target.classList.remove('hidden');
  }
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
  currentCell.dataset.cell = currentTurn;
  currentCell.classList.add(currentTurn);
}

function switchTurn() {
  board.classList.remove(currentTurn);
  currentTurn = (currentTurn === CIRCLE) ? X : CIRCLE;
  board.classList.add(currentTurn);
}

function boardSetup() {
  const markSelectCheckbox = document.getElementById('mark-selector');

  boardCells.forEach(cell => {
    // oneshot with once to prevent click on already occupied cells
    cell.addEventListener('click', handleCellClick, { once: true }); 
  });

  // add selected mark to board classList
  currentTurn = markSelectCheckbox.checked ? CIRCLE : X;
  // on game start, set markTurn to what player selected
  board.classList.remove(X);
  board.classList.remove(CIRCLE);
  board.classList.add(currentTurn);
}

function checkForWin() {
  return WINNING_COMBINATIONS.some(combination => {
    return combination.every(index => {
      return boardCells[index].classList.contains(currentTurn);
    });
  });
}

function checkForDraw() {
  // boardCells is NodeList, not array, so need to spread first with [...]
  return [...boardCells].every(cell => {
    return cell.classList.contains(X) || cell.classList.contains(CIRCLE);
  });
}

function endGame(isDraw) {
  if (isDraw) {
    resultMessage.textContent = `Draw!`;
  } else {
    resultMessage.textContent = `${currentTurn} wins!`;
  }
  togglePopupVisibility(resultContainer, 'show');
}

function resetGame() {
  boardCells.forEach(cell => {
    cell.classList.remove(X);
    cell.classList.remove(CIRCLE);
  });

  boardSetup();

  togglePopupVisibility(resultContainer, 'hide');
}