/*
Multiplication Table
*/
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

var fromKey;

var GRID_COLOR = 'lightblue';
var GRID_STEP = 20;
var MARGIN = 18;  // left and top margin of canvas
var Q_BOX_X = 60;  // Question Box upper left
var Q_BOX_Y = 60;
var A_BOX_X = 380;  // Answer Box upper left
var A_BOX_Y = 60;
var BOX_SIZE = 200;
var dragging = false;  // for box grids

var askme = document.getElementById('askme');
var difficulty = document.getElementById('difficulty');
var showme = document.getElementById('showme');
var fact1 = document.getElementById('fact1');
var fact2 = document.getElementById('fact2');
var equal = document.getElementById('equal');
var prod1 = document.getElementById('prod1');
var prod2 = document.getElementById('prod2');

var problem = {};

problem.factor1 = 1;
problem.factor2 = 1;
problem.answer1 = 0;  // used by toDigit() to limit input to 1 digit
problem.answer2 = 0;  // used by toDigit() to limit input to 1 digit

keyboard = new COREHTML5.Keyboard();

function getRandomInt(min, max) {
    'use strict';
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

function windowToCanvas(x, y) {
    var bbox = canvas.getBoundingClientRect();
    return { x: x - bbox.left * (canvas.width  / bbox.width),
             y: y - bbox.top  * (canvas.height / bbox.height)
    };
};

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
};

function drawBoxOutline(context, x, y, w, h) {
    'use strict';
    context.strokeStyle = 'black';
    context.strokeRect(x - 0.5, y - 0.5, w + 1, h + 1);
};

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
};

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
};

function clearAnswer() {
    clearAnswerBox();
    prod1.value = '';
    prod2.value = '';
    equal.textContent = '';
};    

function clearAnswerBox() {
    'use strict';
    var keepStyle = context.fillStyle;  // possible fix for PhoneGap
    context.clearRect(A_BOX_X, A_BOX_Y, BOX_SIZE, BOX_SIZE);
    context.fillStyle = 'white';  // possible fix for PhoneGap
    context.fillRect(A_BOX_X, A_BOX_Y, BOX_SIZE, BOX_SIZE);  // possible fix for PhoneGap
    context.fillStyle = keepStyle;  // possible fix for PhoneGap
    drawBoxGrid(context, GRID_COLOR, A_BOX_X, A_BOX_Y,
        BOX_SIZE, BOX_SIZE, GRID_STEP);
};

function clearQuestionBox() {
    'use strict';
    var keepStyle = context.fillStyle;  // possible fix for PhoneGap
    context.clearRect(Q_BOX_X, Q_BOX_Y, BOX_SIZE, BOX_SIZE);
    context.fillStyle = 'white';  // possible fix for PhoneGap
    context.fillRect(Q_BOX_X, Q_BOX_Y, BOX_SIZE, BOX_SIZE);  // possible fix for PhoneGap
    context.fillStyle = keepStyle;  // possible fix for PhoneGap
    drawBoxGrid(context, GRID_COLOR, Q_BOX_X, Q_BOX_Y,
        BOX_SIZE, BOX_SIZE, GRID_STEP);
};

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
};

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
    if (num == problem.factor1 * problem.factor2) {
        equal.textContent = '=';
        context.fillStyle = 'aqua';
    } else {
        equal.textContent = '';
        context.fillStyle = 'lightblue';
    };      
    clearAnswerBox();
    context.fillRect(x, y, w, h);
    for (i = y + 0.5; i < y + (GRID_STEP * tens); i += GRID_STEP) {
        context.strokeStyle = 'black';
        context.strokeRect(x, i, w, GRID_STEP);
    };
    y -= GRID_STEP;
    w = GRID_STEP * ones;
    h = GRID_STEP;
    context.fillRect(x, y, w, h);
    drawBoxGrid(context, 'black', x, y, w + 1, h, GRID_STEP);
};

function askQuestion() {
    'use strict';
    var from, to;
    if (difficulty.value === 'easy') {
        from = 1;
        to = 5;
        fillQuestion(getRandomInt(from, to), getRandomInt(from, to));
    } else {
        from = 6;
        to = 9;
    };
    
    if (difficulty.value === 'medium') {
        if (getRandomInt(1,2) === 1) {
            fillQuestion(getRandomInt(2,5), getRandomInt(from, to));
        } else {
            fillQuestion(getRandomInt(from, to), getRandomInt(2,5));
        }
    };
    
    if (difficulty.value === 'hard') {    
        fillQuestion(getRandomInt(from, to), getRandomInt(from, to));
    };
};

function fillQuestion(n1, n2) {
    fact1.value = n1;
    fact2.value = n2;
    fillQuestionBox(n1, n2);
    problem.factor1 = n1;
    problem.factor2 = n2;
    clearAnswer();
};

function fillAnswer(n1, n2) {
    var answer;
    prod1.value = n1;
    prod2.value = n2;
    answer = n1*10 + n2*1;
    if (answer > 0) {
        fillAnswerBox(n1*10 + n2*1);
    };
};
    
function showAnswer() {
    'use strict';
    var num, ones, tens;
    num = problem.factor1 * problem.factor2;
    ones = num % 10;
    tens = Math.floor(num / 10);
    if (tens == 0) {
        prod1.value = '';
    } else {
        prod1.value = tens;
    }
    prod2.value = ones;
    fillAnswerBox(num);
};

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
};

function drawScreen() {
    'use strict';
    drawCanvasGrid(context, GRID_COLOR, GRID_STEP);
    drawBoxOutline(context, Q_BOX_X, Q_BOX_Y, BOX_SIZE, BOX_SIZE);
    drawBoxOutline(context, A_BOX_X, A_BOX_Y, BOX_SIZE, BOX_SIZE);
    drawBoxLabels(context, 9, 0, -1, 50, 0, 95, 20);
    drawBoxLabels(context, 1, 10, 1, 67, 20, 275, 0);
    drawBoxLabels(context, 1, 10, 1, 387, 20, 275, 0);
    drawBoxLabels(context, 10, 100, 10, 585, 0, 255, -20);
};

// Keyboard......................................................

function showKeyboard(from) {
    var keyboardElement = document.getElementById('keyboard');

    if (fromKey.substring(0,4) === 'prod') {
        keyboardElement.style.left = '378px';
    } else {
        keyboardElement.style.left = '58px';
    };
    keyboardElement.style.height = '240px';
    keyboardElement.style.top = '58px';
    keyboardElement.style.border = 'thin inset rgba(0,0,0,0.5)';
    keyboardElement.style.borderRadius = '20px';

    keyboard.resize(1000, 368);
    keyboard.translucent = true;
    keyboard.draw();
};

function hideKeyboard() {
   var keyboardElement = document.getElementById('keyboard');

   keyboardElement.style.height = '0px';
   keyboardElement.style.top = '0px';
   keyboardElement.style.border = '';
   keyboardElement.style.borderRadius = '';

   keyboard.resize(1000, 0);
};

function whichBox(x, y) {
    if ((x < 0) || (y >= BOX_SIZE)) {
        return '';
    }
    if (x < BOX_SIZE) {
        return 'Q';
    } else {
        x = x + Q_BOX_X - A_BOX_X;  // adjust x for 'A' box
        if ((x < 0) || (x > BOX_SIZE)) {
            return '';
        } else {
            return 'A';
        }
    }
};

function fillBox(box, x, y) {
    var n1, n2;
    
    if (box === 'Q') {
        if ((x >= BOX_SIZE - GRID_STEP) || (y < GRID_STEP)) {
            return;  //ignore 10 row for factor1 and factor2
        } else {
            n1 = 10 - Math.floor(y / GRID_STEP);  // factor1
            n2 = Math.floor(x / GRID_STEP) + 1;  // factor2
            fillQuestion(n1, n2);
        }
    } else if (box === 'A') {
        x = x + Q_BOX_X - A_BOX_X;  // adjust x for 'A' box
        n2 = Math.floor(x / GRID_STEP) + 1;  // ones digit of answer
        n2 = (n2 < 10) ? n2 : 0;  // ones digit is 0 in last column
        n1 = 10 - Math.floor(y / GRID_STEP);  // tens digit
        n1 = (n2 > 0) ? n1 - 1 : n1;  // decrement unless ones digit is 0
        if (n1 < 10) {  // ignore answer of 100
            fillAnswer(n1, n2);
        }
    }
};
// Initialization................................................
// Touch Event Handlers........................................
canvas.ontouchstart = function (e) { 
   e = e || window.event;  // for IE
   e.preventDefault(e);
   mouseDownOrTouchStart(windowToCanvas(e.pageX, e.pageY));
};

canvas.ontouchmove = function (e) { 
   e = e || window.event;  // for IE
   e.preventDefault(e);
   mouseMoveOrTouchMove(windowToCanvas(e.pageX, e.pageY));
};

canvas.ontouchend = function (e) { 
   e = e || window.event;  // for IE
   e.preventDefault(e);
   mouseUpOrTouchEnd(windowToCanvas(e.pageX, e.pageY));
};

// Mouse Event Handlers........................................

canvas.onmousedown = function (e) { 
   e = e || window.event;  // for IE
   e.preventDefault(e);
   mouseDownOrTouchStart(windowToCanvas(e.clientX, e.clientY));
};

canvas.onmousemove = function (e) { 
   e = e || window.event;  // for IE
   e.preventDefault(e);
   mouseMoveOrTouchMove(windowToCanvas(e.clientX, e.clientY));
};

canvas.onmouseup = function (e) { 
   e = e || window.event;  // for IE
   e.preventDefault(e);
   mouseUpOrTouchEnd(windowToCanvas(e.clientX, e.clientY));
};

function mouseDownOrTouchStart(loc) {
    'use strict';
    var x, y, box;
    x = loc.x - Q_BOX_X;
    y = loc.y - Q_BOX_Y;
    
    box = whichBox(x, y);

    // Now box is either 'A' or 'Q' and x,y is in the box.
    // or box is '' and x,y is not in the box.
    if (box) {
        fillBox(box, x, y);
        dragging = true;
    }
};

function mouseMoveOrTouchMove(loc) {
    'use strict';
    var x, y, box;
    
    if (dragging) {
        x = loc.x - Q_BOX_X;
        y = loc.y - Q_BOX_Y;
        
        box = whichBox(x, y);

        // Now box is either 'A' or 'Q' and x,y is in the box.
        // or box is '' and x,y is not in the box.
        if (box) {
            fillBox(box, x, y);
        }
    }
};

function mouseUpOrTouchEnd(loc) {
    'use strict';
    dragging = false;
};
/*
canvas.onmousedown = function (e) {
    'use strict';
    var loc, x, y, box;
    e = e || window.event;  // for IE
    e.preventDefault();
    loc = windowToCanvas(e.clientX, e.clientY);
    x = loc.x - Q_BOX_X;
    y = loc.y - Q_BOX_Y;
    
    box = whichBox(x, y);

    // Now box is either 'A' or 'Q' and x,y is in the box.
    // or box is '' and x,y is not in the box.
    if (box) {
        fillBox(box, x, y);
        dragging = true;
    }
};

canvas.onmousemove = function (e) {
    'use strict';
    var loc, x, y, box;
    
    if (dragging) {
        e = e || window.event;  // for IE
        e.preventDefault();
        loc = windowToCanvas(e.clientX, e.clientY);
        x = loc.x - Q_BOX_X;
        y = loc.y - Q_BOX_Y;
        
        box = whichBox(x, y);

        // Now box is either 'A' or 'Q' and x,y is in the box.
        // or box is '' and x,y is not in the box.
        if (box) {
            fillBox(box, x, y);
        }
    }
};

canvas.onmouseup = function (e) {
    dragging = false;
};
*/
askme.onclick = function (e) {
    'use strict';
    e.preventDefault();
    hideKeyboard();
    askQuestion();    // sets problem.factor1 .factor2 and .product
};

showme.onclick = function (e) {
    'use strict';
    e.preventDefault();
    hideKeyboard();
    showAnswer();
};

fact1.onclick = function (e) {
    'use strict';
    fromKey = 'fact1';
    fact1.focus();
    showKeyboard();
};

fact2.onclick = function (e) {
    'use strict';
    fromKey = 'fact2';
    fact2.focus();
    showKeyboard();
};

prod1.onclick = function (e) {
    'use strict';
    fromKey = 'prod1';
    prod1.focus();
    showKeyboard();
};

prod2.onclick = function (e) {
    'use strict';
    fromKey = 'prod2';
    prod2.focus();
    showKeyboard();
};

keyboard.appendTo('keyboard');
keyboard.addKeyListener( function (key) {
    fact2.blur();  // these 2 buttons don't change focus
    prod2.blur();  // so need to lose focus here
    if (fromKey === 'fact1') {
        fact1.value = key;
        problem.factor1 = fact1.value;
        fillQuestionBox(problem.factor1, problem.factor2);
        clearAnswer();
        fromKey = 'fact2';
        fact2.focus();  // keyboard left on
    } else if (fromKey === 'fact2'){
        fact2.value = key;
        problem.factor2 = fact2.value;
        fillQuestionBox(problem.factor1, problem.factor2);
        clearAnswer();
        hideKeyboard();
    } else if (fromKey === 'prod1'){
        prod1.value = key;
        problem.answer1 = prod1.value;
        fillAnswerBox(calcGuess());
        fromKey = 'prod2';
        prod2.focus();  // keyboard left on
    } else if (fromKey === 'prod2'){
        prod2.value = key;
        problem.answer2 = prod2.value;
        fillAnswerBox(calcGuess());
        hideKeyboard();
    }
});

drawScreen();
askQuestion();    // sets problem.factor1 .factor2 and .product
