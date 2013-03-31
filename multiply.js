/*
Multiplication Table
Tom Jacobs
*/
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

var GRID_COLOR = 'lightblue';
var GRID_STEP = 20;
var MARGIN = 18;  // left and top margin of canvas
var Q_BOX_X = 60;  // Question Box upper left
var Q_BOX_Y = 60;
var A_BOX_X = 380;  // Answer Box upper left
var A_BOX_Y = 60;
var BOX_SIZE = 200;

var askme = document.getElementById('askme');
var showme = document.getElementById('showme');
var mult1 = document.getElementById('mult1');
var mult2 = document.getElementById('mult2');
var equal = document.getElementById('equal');
var prod1 = document.getElementById('prod1');
var prod2 = document.getElementById('prod2');

var problem = {};

problem.multiplier = 1;
problem.multiplicand = 1;
problem.answer1 = 0;  // used by toDigit() to limit input to 1 digit
problem.answer2 = 0;  // used by toDigit() to limit input to 1 digit

function getRandomInt(min, max) {
    'use strict';
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drawCanvasGrid(context, color, step) {
    'use strict';
    var i;
    context.strokeStyle = color;
    context.lineWidth = 0.5;

    for (i = step + 0.5; i < context.canvas.width; i += step) {
        context.beginPath();
        context.moveTo(i, 0);
        context.lineTo(i, context.canvas.height);
        context.stroke();
    }

    for (i = step + 0.5; i < context.canvas.height; i += step) {
        context.beginPath();
        context.moveTo(0, i);
        context.lineTo(context.canvas.width, i);
        context.stroke();
    }
}

function drawBoxOutline(context, x, y, w, h) {
    'use strict';
    context.strokeStyle = 'black';
    context.strokeRect(x - 0.5, y - 0.5, w + 1, h + 1);
}

function drawBoxLabels(context, startNum, endNum, incrNum, x, incrX, y,
        incrY) {
    'use strict';
    var i;
    context.strokeStyle = 'black';
    context.font = '12px Courier';
    for (i = startNum; i !== endNum; i += incrNum) {
        context.strokeText(i, x, y);
        x += incrX;
        y += incrY;
    }
}

function drawBoxGrid(context, color, x, y, xsize, ysize, step) {
    'use strict';
    var i;
    context.strokeStyle = color;
    context.lineWidth = 0.5;

    for (i = x + 0.5; i < x + xsize; i += step) {
        context.beginPath();
        context.moveTo(i, y);
        context.lineTo(i, y + ysize);
        context.stroke();
    }

    for (i = y + 0.5; i < y + ysize; i += step) {
        context.beginPath();
        context.moveTo(x, i);
        context.lineTo(x + xsize, i);
        context.stroke();
    }
}

function clearAnswer() {
    clearAnswerBox();
    prod1.value = '';
    prod2.value = '';
    equal.textContent = '';
}    

function clearAnswerBox() {
    'use strict';
    context.clearRect(A_BOX_X, A_BOX_Y, BOX_SIZE, BOX_SIZE);
    drawBoxGrid(context, GRID_COLOR, A_BOX_X, A_BOX_Y,
        BOX_SIZE, BOX_SIZE, GRID_STEP);
}

function clearQuestionBox() {
    'use strict';
    context.clearRect(Q_BOX_X, Q_BOX_Y, BOX_SIZE, BOX_SIZE);
    drawBoxGrid(context, GRID_COLOR, Q_BOX_X, Q_BOX_Y,
        BOX_SIZE, BOX_SIZE, GRID_STEP);
}

function fillQuestionBox(n1, n2) {
    'use strict';
    var x, y, w, h;
    x = Q_BOX_X;
    y = Q_BOX_Y + BOX_SIZE - (GRID_STEP * n1);
    w = GRID_STEP * n2;
    h = GRID_STEP * n1;
    context.strokeStyle = 'black';
    context.fillStyle = 'lightblue';
    clearQuestionBox();
    context.fillRect(x, y, w, h);
    drawBoxGrid(context, 'black', x, y, w + 1, h, GRID_STEP);
}

function fillAnswerBox(num) {
    'use strict';
    var i, ones, tens, x, y, w, h;
    ones = num % 10;
    tens = Math.floor(num / 10);
    x = A_BOX_X;
    y = A_BOX_Y + BOX_SIZE - (GRID_STEP * tens);
    w = GRID_STEP * 10;
    h = GRID_STEP * tens;
    context.strokeStyle = 'black';
    if (num == problem.multiplier * problem.multiplicand) {
        equal.textContent = '=';
        context.fillStyle = 'aqua';
    } else {
        equal.textContent = '';
        context.fillStyle = 'lightblue';
    }        
    clearAnswerBox();
    context.fillRect(x, y, w, h);
    for (i = y + 0.5; i < y + (GRID_STEP * tens); i += GRID_STEP) {
        context.strokeStyle = 'black';
        context.strokeRect(x, i, w, GRID_STEP);
    }
    y -= GRID_STEP;
    w = GRID_STEP * ones;
    h = GRID_STEP;
    context.fillRect(x, y, w, h);
    drawBoxGrid(context, 'black', x, y, w + 1, h, GRID_STEP);
}

function askQuestion() {
    'use strict';
    fillQuestion(getRandomInt(2,9), getRandomInt(2,9));
}

function fillQuestion(n1, n2) {
    mult1.value = n1;
    mult2.value = n2;
    fillQuestionBox(n1, n2);
    problem.multiplier = n1;
    problem.multiplicand = n2;
    clearAnswer();
}

function fillAnswer(n1, n2) {
    prod1.value = n1;
    prod2.value = n2;
    fillAnswerBox(n1*10 + n2*1);
}
    
function showAnswer() {
    'use strict';
    var num, ones, tens;
    num = problem.multiplier * problem.multiplicand;
    ones = num % 10;
    tens = Math.floor(num / 10);
    if (tens == 0) {
        prod1.value = '';
    } else {
        prod1.value = tens;
    }
    prod2.value = ones;
    fillAnswerBox(num);
}

function calcGuess() {
    'use strict';
    var m, n;
    m = prod1.value;
    n = prod2.value;
    if (n === '') {
        n = 0;
        prod2.value = 0;
    }
    return m + n;  // concatenate two string digits}
}

function toDigit(before, after) {
    after = parseInt(after);
    if (isNaN(after) || after > 99) {
        return before;
    } else if (after > 9) {
        after1 = Math.floor(after / 10);
        after2 = after % 10;
        if (before == after1) {
            return after2;
        } else {
            return after1;
        }
    } else {
        return after;
    }
}

function drawScreen() {
    'use strict';
    drawCanvasGrid(context, GRID_COLOR, GRID_STEP);
    drawBoxOutline(context, Q_BOX_X, Q_BOX_Y, BOX_SIZE, BOX_SIZE);
    drawBoxOutline(context, A_BOX_X, A_BOX_Y, BOX_SIZE, BOX_SIZE);
    drawBoxLabels(context, 9, 0, -1, 50, 0, 95, 20);
    drawBoxLabels(context, 1, 10, 1, 67, 20, 275, 0);
    drawBoxLabels(context, 1, 10, 1, 387, 20, 275, 0);
    drawBoxLabels(context, 10, 100, 10, 585, 0, 255, -20);
}

// Initialization................................................

canvas.onmousedown = function (e) {
    'use strict';
    var x, y, box, n1, n2;
    e = e || window.event;  // for IE
    e.preventDefault();
    x = e.clientX - (Q_BOX_X + MARGIN);
    y = e.clientY - (Q_BOX_Y + MARGIN);
    if ((x < 0) || (y > BOX_SIZE)) {
        return;
    }
    if (x < BOX_SIZE) {
        box = 'Q';
    } else {
        x = e.clientX - (A_BOX_X + MARGIN);
        if ((x < 0) || (x > BOX_SIZE)) {
            return;
        } else {
            box = 'A';
        }
    }
    // Now box is either 'A' or 'Q' and x,y is in the box.
    if (box === 'Q') {
        if ((x > BOX_SIZE - GRID_STEP) || (y < GRID_STEP)) {
            return;  //ignore 10 row for multiplier and multiplicand
        } else {
            n1 = 10 - Math.floor(y / GRID_STEP);  // multiplier
            n2 = Math.floor(x / GRID_STEP) + 1;  // multiplicand
            fillQuestion(n1, n2);
        }
    } else {  // box = 'A'
        n2 = Math.floor(x / GRID_STEP) + 1;  // ones digit of answer
        n2 = (n2 < 10) ? n2 : 0;  // ones digit is 0 in last column
        n1 = 10 - Math.floor(y / GRID_STEP);  // tens digit
        n1 = (n2 > 0) ? n1 - 1 : n1;  // decrement unless ones digit is 0
        if (n1 < 10) {  // ignore answer of 100
            fillAnswer(n1, n2);
        }
    }
}

askme.onclick = function (e) {
    'use strict';
    e.preventDefault();
    askQuestion();    // sets problem.multiplier .multiplicand and .product
}

showme.onclick = function (e) {
    'use strict';
    e.preventDefault();
    showAnswer();
}

mult1.onfocus = function (e) {
//    mult1.value = '';
}

mult1.oninput = function (e) {
    'use strict';
    mult1.value = toDigit(problem.multiplier, mult1.value);
    problem.multiplier = mult1.value;
    fillQuestionBox(problem.multiplier, problem.multiplicand);
    clearAnswer();
}

mult2.onfocus = function (e) {
//    mult2.value = '';
}

mult2.oninput = function (e) {
    'use strict';
    mult2.value = toDigit(problem.multiplicand, mult2.value);
    problem.multiplicand = mult2.value;
    fillQuestionBox(problem.multiplier, problem.multiplicand);
    clearAnswer();
}

prod1.onfocus = function (e) {
    problem.answer1 = prod1.value;  // used by toDigit() to limit input to 1 digit
}

prod1.oninput = function (e) {
    'use strict';
    prod1.value = toDigit(problem.answer1, prod1.value);
    fillAnswerBox(calcGuess());
    prod2.focus();
}

prod2.onfocus = function (e) {
    problem.answer2 = prod2.value;  // used by toDigit() to limit input to 1 digit
}

prod2.oninput = function (e) {
    'use strict';
    prod2.value = toDigit(problem.answer2, prod2.value);
    fillAnswerBox(calcGuess());
    problem.answer2 = prod2.value;
}

drawScreen();
askQuestion();    // sets problem.multiplier .multiplicand and .product
