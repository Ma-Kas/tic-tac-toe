const gameBoard = {};

const cells = document.querySelectorAll('.cell');
const board = document.querySelector('#board');
let markTurn = 'x';


cells.forEach(cell => {
  cell.addEventListener('click', (e) => {
    e.target.dataset.cell = markTurn;
    e.target.classList.add(markTurn);
    switchTurn();
    console.log(e.target.dataset.cell);
  });
});

function switchTurn() {
  board.classList.remove(markTurn);
  if (markTurn === 'circle') {
    markTurn = 'x';
  } else {
    markTurn = 'circle';
  }
  board.classList.add(markTurn);
}

switchTurn();