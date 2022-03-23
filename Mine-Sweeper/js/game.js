'use strict';

const MINE = '💣';
const FLAG = '🚩';

const GAMECONTAINER = document.querySelector('.game-container');

var timerInterval;

var gBoard = [];
var minePositions = [];
var gLevel = {
  size: 4,
  mines: 2,
};
var gGame = {
  isFirstClick: false,
  isOn: false,
  shownCount: 0,
  markedCount: 0,
  secsPassed: 0,
  lives: 3,
};

function initGame() {
  document.querySelector('.reset').style.backgroundImage =
    "url('../img/face_unpressed.svg')";
  gBoard = [];
  gGame.isFirstClick = false;
  clearInterval(timerInterval);
  timerInterval = null;
  gBoard = createMat(gLevel.size);
  printMat(gBoard, `.game-container`);
  flagEventListener();
  gGame = {
    isFirstClick: false,
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    lives: 3,
  };
}

function setMineNegsCount(idx, jdx) {
  var minesCount = 0;
  for (var i = idx - 1; i <= idx + 1; i++) {
    if (i < 0 || i > gBoard.length - 1) continue;
    for (var j = jdx - 1; j <= jdx + 1; j++) {
      if (j < 0 || j > gBoard[0].length - 1) continue;
      if (j === jdx && i === idx) continue;
      var curr = gBoard[i][j];
      if (curr.isMine) minesCount++;
    }
  }
  gBoard[idx][jdx].minesAroundCount = minesCount;
  return minesCount;
}

function setMinesNegsCount() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[i].length; j++) {
      setMineNegsCount(i, j);
    }
  }
}

function gameOver() {
  document.querySelector('.reset').style.backgroundImage =
    "url('../img/face_lose.svg')";
  gGame.isOn = false;
  clearInterval(timerInterval);
  timerInterval = null;
  revealAllMines();
  return console.log('lost');
}

function mineGenerator(num, el) {
  minePositions = [];
  for (var z = 0; z < num; z++) {
    var emptySpaces = [];
    for (var i = 0; i < gBoard.length; i++) {
      for (var j = 0; j < gBoard[0].length; j++) {
        if (j === Number(el.dataset.i) && i === Number(el.dataset.j)) continue;
        var currCell = gBoard[i][j];
        if (!currCell.isShown && !currCell.isMine) emptySpaces.push({ i, j });
      }
    }
    var indexPicker = getRandomNum(0, emptySpaces.length - 1);

    if (emptySpaces.length === 0) return;
    gBoard[emptySpaces[indexPicker].i][
      emptySpaces[indexPicker].j
    ].isMine = true;
    minePositions.push({
      i: emptySpaces[indexPicker].i,
      j: emptySpaces[indexPicker].j,
    });
  }
}

function reveal(el, mineColor = 'mine-red') {
  var i = Number(el.dataset.i);
  var j = Number(el.dataset.j);
  var boardCell = gBoard[i][j];
  if (boardCell.isShown) return;
  if (boardCell.isMarked) return;

  el.classList.remove('tile');
  if (boardCell.isMine) {
    el.classList.add(mineColor);
    return;
  }
  el.classList.add('pressed');
  gGame.shownCount++;
  boardCell.isShown = true;
  el.innerText = boardCell.minesAroundCount ? boardCell.minesAroundCount : '';
  checkVictory();
}

function check(el) {
  if (!gGame.isFirstClick) {
    gGame.isFirstClick = true;
    gGame.isOn = true;
    document.querySelector('.timer').innerText = 0;
    timer();
    mineGenerator(gLevel.mines, el);
    setMinesNegsCount();
  }

  var idx = Number(el.dataset.i);
  var jdx = Number(el.dataset.j);

  if (gBoard[idx][jdx].isMarked) return;
  gBoard[idx][jdx].isChecked = true;
  if (gBoard[idx][jdx].isMine) {
    updateLives();
    reveal(el);
    gBoard[idx][jdx].isMarked = true;
    if (gGame.lives === 0) gameOver();
    return;
  }

  if (gBoard[idx][jdx].minesAroundCount) {
    reveal(el);
    return;
  }

  for (var i = idx - 1; i <= idx + 1; i++) {
    if (i < 0 || i > gBoard.length - 1) continue;
    for (var j = jdx - 1; j <= jdx + 1; j++) {
      if (j < 0 || j > gBoard[0].length - 1) continue;
      var currEl = document.querySelector(`.cell-${i}-${j}`);
      if (gBoard[i][j].isMine) continue;

      if (
        gBoard[i][j].minesAroundCount === 0 &&
        gBoard[i][j].isChecked === false
      ) {
        check(currEl);
      }
      reveal(currEl);
    }
  }
}

function flagEventListener() {
  GAMECONTAINER.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[i].length; j++) {
      var elCell = document.querySelector(`.cell-${i}-${j}`);

      elCell.addEventListener('contextmenu', (e) => {
        e.preventDefault();

        var boardCell = gBoard[e.target.dataset.i][e.target.dataset.j];
        var domCell = document.querySelector(
          `.cell-${e.target.dataset.i}-${e.target.dataset.j}`
        );
        if (boardCell.isShown) return;
        domCell.innerHTML = domCell.innerHTML
          ? (domCell.innerHTML = '')
          : (domCell.innerHTML = FLAG);

        boardCell.isMarked = !boardCell.isMarked;
        checkVictory();
        if (!gGame.isFirstClick) {
          gGame.isFirstClick = true;
          gGame.isOn = true;
          timer();
          mineGenerator(gLevel.mines, domCell);
          setMinesNegsCount();
          document.querySelector('.timer').innerText = 0;
        }
      });
    }
  }
}

function revealAllMines() {
  for (var i = 0; i < minePositions.length; i++) {
    var currMine = minePositions[i];
    var elMine = document.querySelector(`.cell-${currMine.i}-${currMine.j}`);
    reveal(elMine, 'mine');
  }
}

function checkVictory() {
  var allMinesFlagged = true;
  var allTilesShown = true;

  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[i].length; j++) {
      var currCell = gBoard[i][j];

      if (!currCell.isShown && !currCell.isMine) {
        allTilesShown = false;
        return;
      }
      if (!currCell.isMarked && currCell.isMine) {
        allMinesFlagged = false;
        return;
      }
    }
  }

  if (allMinesFlagged && allTilesShown && gGame.lives > 0) {
    clearInterval(timerInterval);
    document.querySelector('.reset').style.backgroundImage =
      "url('../img/face_win.svg')";

    var victorySound = new Audio('/sounds/sfx-victory1.mp3');
    victorySound.play();
    victorySound.volume = 0.3;
    return 'VICTORY';
  }
}

function changeLevel(dif) {
  switch (dif) {
    case 'beginner':
      gLevel.mines = 2;
      gLevel.size = 5;
      break;
    case 'medium':
      gLevel.mines = 12;
      gLevel.size = 8;
      break;
    case 'expert':
      gLevel.mines = 30;
      gLevel.size = 12;
      break;
    default:
      break;
  }
  initGame();
}

function updateLives() {
  var elLives = document.querySelector('.lives');
  elLives.innerHTML = --gGame.lives;
}
