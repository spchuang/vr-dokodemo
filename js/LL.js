//make sure to also include 
//<script type="text/javascript" src="https://js.leapmotion.com/0.2.2/leap.js"></script>

//EXAMPLE
/* <script>
        var leap = new LL();
        leap.onSwipeRight = function(e){
          console.log(e);
        };
        leap.onSwipeLeft = function(e){
          console.log(e);
        };
        leap.onSwipeUp = function(e){
          console.log(e);
        };
        leap.onSwipeDown = function(e){
          console.log(e);
        };
        leap.onCircle = function(e){
          console.log(e);
        };
    </script> */

var LL = function(){
  var that= this;
  // Get the canvas element from the HTML document
  var canvas = document.getElementById( 'canvas' );
  // Get the canvas context to draw with
  var ctx = canvas.getContext( '2d' );
  // Get the canvas width and height for scaling
  var width  = canvas.width,
      height = canvas.height;

  var time = new Date().getTime() / 1000;

  // Transform Leap coordinates to scene coordinates
  //   leapPosition is a [ x, y, z ] array
  //   returns a [ x, y ] array
  function leapToScene( leapPosition, leapScalar ) {
    var canvasPos = [ 0, 0 ];
    canvasPos[0] = width/2 + leapPosition[0];
    canvasPos[1] = height  - leapPosition[1];
    return canvasPos;
  };

  // Create a Leap controller so we can emit gesture events
  var controller = new Leap.Controller( { enableGestures: true } );

  // Emit gesture events before emitting frame events
  controller.addStep( function( frame ) {
    for ( var g = 0; g < frame.gestures.length; g++ ) {
      var gesture = frame.gestures[g];
      controller.emit( gesture.type, gesture, frame );
    }
    return frame; // Return frame data unmodified
  });

  // Circle gesture event listener
  controller.on( 'circle', function( circle, frame ) {
    if (circle.state == 'start' || circle.state == 'stop') {
      var curr = new Date().getTime() / 1000;
      if (circle.state == 'start' && curr - time > 1.5)
      {
        that.handleCircle({direction: 'circle'});
        time = new Date().getTime() / 1000;
      }
      //console.log(circle.state, circle.type, circle.id,
        //          'radius:', circle.radius);
    }
  });


  // Swipe gesture event listener
  controller.on( 'swipe', function( swipe, frame ) {
    if (swipe.state == 'start' || swipe.state == 'stop') {
      var dir = swipe.direction;
      var dirStr = dir[0] > 0.8 ? 'right' : dir[0] < -0.8 ? 'left'
                 : dir[1] > 0.8 ? 'up'    : dir[1] < -0.8 ? 'down'
                 : dir[2] > 0.8 ? 'backward' : 'forward';
      var curr = new Date().getTime() / 1000;
      if (swipe.state == 'start' &&  curr - time > 1.5)
      {
        if (dirStr == 'right')
          that.handleSwipeRight({direction: 'right'}); 
        else if (dirStr == 'left')
          that.handleSwipeLeft({direction: 'left'});
        else if (dirStr == 'down')
          that.handleSwipeDown({direction: 'down'});
        else if (dirStr == 'up')
          that.handleSwipeUp({direction: 'up'});
        else if (dirStr == 'forward')
          that.handleSwipeForward({direction: 'forward'});
        else if (dirStr == 'backward')
          that.handleSwipeBackward({direction: 'backward'});
        time = new Date().getTime() / 1000;
      }
      //console.log(swipe.state, swipe.type, swipe.id, dirStr,
        //          'direction:', dir);
    }
  });

  // Start listening for frames
  controller.connect();

  this.handleSwipeRight = function (e) {if (this.onSwipeRight) this.onSwipeRight(e);};
  this.handleSwipeLeft = function (e) {if (this.onSwipeLeft) this.onSwipeLeft(e);};
  this.handleSwipeUp = function (e) {if (this.onSwipeUp) this.onSwipeUp(e);};
  this.handleSwipeDown = function (e) {if (this.onSwipeDown) this.onSwipeDown(e);};
  this.handleSwipeForward = function (e) {if (this.onSwipeForward) this.onSwipeForward(e);};
  this.handleSwipeBackward = function (e) {if (this.onSwipeBackward) this.onSwipeBackward(e);};
  this.handleCircle = function (e) {if (this.onCircle) this.onCircle(e);};

};
