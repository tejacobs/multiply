/*
 * Copyright (C) 2012 David Geary. This code is from the book
 * Core HTML5 Canvas, published by Prentice-Hall in 2012.
 *
 * Code has been modified for this application.
*/

var COREHTML5 = COREHTML5 || {};

// Key Constructor....................................................................

COREHTML5.Key = function (text) { 
   this.text = text;
   this.selected = false;
   this.translucent = false;
}

COREHTML5.Key.prototype = {  // IE can't handle arcTo()
   createPath: function (context) {
      context.beginPath();

      context.moveTo(this.left + this.cornerRadius, this.top);

      context.lineTo(this.left + this.width - this.cornerRadius, this.top);

      context.arc(this.left + this.width - this.cornerRadius,
                  this.top + this.cornerRadius,
                  this.cornerRadius,
                  1.5 * Math.PI, 0);

      context.lineTo(this.left + this.width, this.top + this.height - this.cornerRadius);

      context.arc(this.left + this.width - this.cornerRadius,
                  this.top + this.height - this.cornerRadius,
                  this.cornerRadius,
                  0, 0.5 * Math.PI);

      context.lineTo(this.left + this.cornerRadius, this.top + this.height);

      context.arc(this.left + this.cornerRadius,
                  this.top + this.height - this.cornerRadius,
                  this.cornerRadius,
                  0.5 * Math.PI, Math.PI);

      context.lineTo(this.left, this.top + this.cornerRadius);

      context.arc(this.left + this.cornerRadius,
                  this.top + this.cornerRadius,
                  this.cornerRadius,
                  Math.PI, 1.5 * Math.PI);
   },

   createKeyGradient: function (context) {
      var keyGradient = context.createLinearGradient(
                           this.left, this.top,
                           this.left, this.top + this.height);
      if (this.selected) {
         keyGradient.addColorStop(0,   'rgb(208, 208, 210)');
         keyGradient.addColorStop(1.0, 'rgb(162, 162, 166)');
      }
      else if (this.translucent) {
         keyGradient.addColorStop(0,   'rgba(298, 298, 300, 0.20)');
         keyGradient.addColorStop(1.0, 'rgba(255, 255, 255, 0.20)');
      }
      else {
         keyGradient.addColorStop(0,   'rgb(238, 238, 240)');
         keyGradient.addColorStop(1.0, 'rgb(192, 192, 196)');
      }

      return keyGradient;
   },
   
   setKeyProperties: function (context, keyGradient) {
     context.shadowColor = 'rgba(0, 0, 0, 0.8)';
	   context.shadowOffsetX = 1;
	   context.shadowOffsetY = 1;
      context.shadowBlur = 1;

      context.lineWidth = 0.5;

      context.strokeStyle = 'rgba(0, 0, 0, 0.7)';
      context.fillStyle = keyGradient;
   },
      
   setTextProperties: function (context) {
	   context.shadowColor = undefined;
	   context.shadowOffsetX = 0;

//      context.font = '100 ' + this.height/3 + 'px Helvetica';
      context.font = '100 ' + this.height/2 + 'px Helvetica';
      context.fillStyle = 'rgba(0,0,0,0.4)';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
   },
      
   draw: function (context) {
      var keyGradient = this.createKeyGradient(context);
      
      context.save();

      this.createPath(context);

      this.setKeyProperties(context, keyGradient);
      context.stroke();
      context.fill();

      this.setTextProperties(context);
      context.fillText(this.text, this.left + this.width/2,
                                       this.top + this.height/2);

      context.restore();
   },

   erase: function(context) {
      context.clearRect(this.left-2, this.top-2,
                        this.width+6, this.height+6);
   },

   redraw: function (context) {
      this.erase(context);
      this.draw(context);
   },

   toggleSelection: function (context) {
      this.selected = !this.selected;
   },
   
   isPointInKey: function (context, x, y) {
      this.createPath(context);
      return context.isPointInPath(x, y);
   },

   select: function (key) {
      this.selected = true;
   },

   deselect: function (key) {
      this.selected = false;
   },
}
   
// Keyboard Constructor...............................................................

COREHTML5.Keyboard = function() {
   var keyboard = this;
   
   this.keys = [
       [ new COREHTML5.Key('7'), new COREHTML5.Key('8'), new COREHTML5.Key('9') ],
       [ new COREHTML5.Key('4'), new COREHTML5.Key('5'), new COREHTML5.Key('6') ],
       [ new COREHTML5.Key('1'), new COREHTML5.Key('2'), new COREHTML5.Key('3') ],
       [ new COREHTML5.Key('0') ]
   ];

   this.KEYBOARD_HEIGHT = 200,
   this.KEY_COLUMNS = 3,
   this.KEY_ROWS = 4,
   
   this.createCanvas();
   this.createDOMElement();

   this.translucent = false;
   this.keyListenerFunctions = [];

   this.context.canvas.onmousedown = function (e) {
      keyboard.mouseDownOrTouchStart(keyboard.context,
         keyboard.windowToCanvas(keyboard.context.canvas, e.clientX, e.clientY));

      e.preventDefault(); // prevents inadvertent selections on desktop
   };

   this.context.canvas.ontouchstart = function (e) {
      keyboard.mouseDownOrTouchStart(keyboard.context,
         keyboard.windowToCanvas(keyboard.context.canvas,
                                 e.touches[0].clientX, e.touches[0].clientY));

      e.preventDefault(); // prevents flashing on iPad
   };
   
   return this;
}

// Keyboard Constructor...............................................................

COREHTML5.Keyboard.prototype = {

   // General functions ..............................................................

   windowToCanvas: function (canvas, x, y) {
      var bbox = canvas.getBoundingClientRect();
      return { x: x - bbox.left * (canvas.width  / bbox.width),
               y: y - bbox.top  * (canvas.height / bbox.height)
             };
   },
   
   createCanvas: function () {
      var canvas = document.createElement('canvas');
      this.context = canvas.getContext('2d');
   },
   
   createDOMElement: function () {
      this.domElement = document.createElement('div');
      this.domElement.appendChild(this.context.canvas);
   },

   appendTo: function (elementName) {
      var element = document.getElementById(elementName);

      element.appendChild(this.domElement);
      this.domElement.style.width = element.offsetWidth + 'px';
      this.domElement.style.height = element.offsetHeight + 'px';
      this.resize(element.offsetWidth, element.offsetHeight);
      this.createKeys();
   },

   resize: function (width, height) {
      this.domElement.style.width = width + 'px';
      this.domElement.style.height = height + 'px';

      this.context.canvas.width = width;
      this.context.canvas.height = height;
   },

   // Drawing Functions.................................................................

   drawKeys: function () {
      for (var row=0; row < this.keys.length; ++row) {
         for (var col=0; col < this.keys[row].length; ++col) {
            key = this.keys[row][col];

            key.translucent = this.translucent;
            key.draw(this.context);
         }
      }
   },
   
   draw: function (context) {
      var originalContext, key;

      if (context) {
         originalContext = this.context;
         this.context = context;
      }

      this.context.save();
      this.drawKeys();
      
      if (context) {
         this.context = originalContext;
      }

      this.context.restore();
   },

   erase: function() {
      // Erase the entire canvas
      this.context.clearRect(0, 0, this.context.canvas.width,
                             this.context.canvas.height);
   },

   // Keys..............................................................................

   adjustKeyPosition: function (key, keyTop, keyMargin, keyWidth) {
      var key = this.keys[row][col],
          keyMargin = this.domElement.clientWidth / (this.KEY_COLUMNS*4),
          keyWidth =
          ((this.domElement.clientWidth - 2*keyMargin) / this.KEY_COLUMNS) - keyMargin,
          keyLeft = keyMargin + col * keyWidth + col * keyMargin;

          if (row === 3) keyLeft += keyWidth + keyMargin;
      key.left = keyLeft;
      key.top = keyTop;
   },

   adjustKeySize: function (key, keyMargin, keyWidth, keyHeight) {
      key.width = keyWidth;
      key.height = keyHeight;
      key.cornerRadius = 5;
   },
   
   createKeys: function() {
      var key,
          keyMargin,
          keyWidth,
          keyHeight,
          spacebarPadding = 0;

      for (row=0; row < this.keys.length; ++row) {
         for (col=0; col < this.keys[row].length; ++col) {
            key = this.keys[row][col];
            keyMargin = this.domElement.clientWidth / (this.KEY_COLUMNS*8);
            keyWidth =
            ((this.domElement.clientWidth - 2*keyMargin) / this.KEY_COLUMNS) - keyMargin;
//            keyHeight = ((this.KEYBOARD_HEIGHT - 2*keyMargin) / this.KEY_ROWS) - keyMargin;
            keyHeight = ((this.KEYBOARD_HEIGHT - 2*keyMargin) / this.KEY_ROWS);
            keyTop = keyMargin + row * keyHeight + row * keyMargin;

            this.adjustKeyPosition(key, keyTop, keyMargin, keyWidth);
            this.adjustKeySize(key, keyMargin, keyWidth, keyHeight);
         }
      }
   },

   getKeyForLocation: function (context, loc) {
      var key;
      
      for (var row=0; row < this.keys.length; ++row) {
         for (var col=0; col < this.keys[row].length; ++col) {
            key = this.keys[row][col];

            if (key.isPointInKey(context, loc.x, loc.y)) {
              return key;
            }
         }
      }
      return null;
   },
   activateKey: function (key, context) {
      key.select();
      setTimeout( function (e) {
                     key.deselect();
                     key.redraw(context);
                  }, 200);

      key.redraw(context);

      this.fireKeyEvent(key);
   },
   
   // Key listeners.....................................................................

   addKeyListener: function (listenerFunction) {
      this.keyListenerFunctions.push(listenerFunction);
   },
   
   fireKeyEvent: function (key) {
      for (var i=0; i < this.keyListenerFunctions.length; ++i) {
         this.keyListenerFunctions[i](key.text);
      }
   },

   // Event handlers....................................................................

   mouseDownOrTouchStart: function (context, loc) {
      var key = this.getKeyForLocation(context, loc);
      this.activateKey(key, context);
   }
};
