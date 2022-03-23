'use strict';

// COPY MATRIX
function copyMat(mat) {
  var newMat = [];
  for (var i = 0; i < mat.length; i++) {
    newMat[i] = [];
    for (var j = 0; j < mat[0].length; j++) {
      newMat[i][j] = mat[i][j];
    }
  }
  return newMat;
}

function createMat(size) {
  var mat = [];
  for (var i = 0; i < size; i++) {
    mat[i] = [];
    for (var j = 0; j < size; j++) {
      mat[i][j] = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
        isChecked: false
      };
    }
  }

  return mat;
}
function printMat(mat, selector) {
  var strHTML = `<table border="0"><tbody>`;
  for (var i = 0; i < mat.length; i++) {
    strHTML += `<tr>`;
    for (var j = 0; j < mat[0].length; j++) {
      var cell = mat[i][j];
      strHTML += `<td data-i=${i} data-j=${j} class="cell cell-${i}-${j} " onclick=check(this)></td>`;
    }
    strHTML += `</tr>`;
  }
  strHTML += `</tbody></table>`;
  var elContainer = document.querySelector(selector);
  elContainer.innerHTML = strHTML;
}



function timer() {
  var elTimer = document.querySelector('.timer')
 
  var start = Date.now();
  timerInterval = setInterval(function () {
    var timePassed = Date.now() - start;
    gGame.secsPassed = Math.floor(timePassed / 1000);
    elTimer.innerText = gGame.secsPassed
  }, 1000);
}

function getRandomNum(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// GET A RANDOM COLOR
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
