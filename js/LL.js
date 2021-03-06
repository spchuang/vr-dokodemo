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
        leap.onSwipeForward = function(e){
          console.log(e);
        }
        leap.onSwipeBackward = function(e){
          console.log(e);
        }
        leap.onKeyTap = function(e) {
          console.log(e);
        }
    </script> */

var LL = function(){
  var that= this,
      time = new Date().getTime() / 1000;
  var cumulate_state = 0;

  var hasFingers = 'no';

  // Create a Leap controller so we can emit gesture events
  var controller = new Leap.Controller( { enableGestures: true } );

  // Emit gesture events before emitting frame events
  controller.addStep( function( frame ) {
    cumulate_state++;

    //if finger detected
    if(frame.fingers.length){

      if(hasFingers=='no' && cumulate_state>20){
        hasFingers = 'yes';
        cumulate_state=0;
        that.fingerEnterHandle();
      }
    }else{
      if(hasFingers=='yes' && cumulate_state>20){
        hasFingers = 'no';
        cumulate_state=0;
        that.fingerLeaveHandle();
      }
    }
    

    for ( var g = 0; g < frame.gestures.length; g++ ) {
      var gesture = frame.gestures[g];
      controller.emit( gesture.type, gesture, frame );
    }
    return frame; // Return frame data unmodified
  });

  // Circle gesture event listener
  controller.on( 'circle', function( circle, frame ) {
   
    if(circle.radius > 35){
       //console.log(circle);
      if (circle.state == 'start' || circle.state == 'stop') {
      var curr = new Date().getTime() / 1000;
      if (circle.state == 'start' && curr - time > 0.6)
      {
        that.handleCircle({direction: 'circle'});
        time = new Date().getTime() / 1000;
      }
      //console.log(circle.state, circle.type, circle.id,
        //          'radius:', circle.radius);
    }

    }
    
  });

  //Screen Tap shitty right now fk it
  //Screen Tap gesture event listener
/*  controller.on('screenTap', function(screenTap, frame) {
    var curr = new Date().getTime() / 1000;
    if ((screenTap.state == 'start' || screenTap.state == 'stop')
         && curr - time > 0.5){
      that.handleScreenTap({direction: 'Screen Tap'});
      time = new Date().getTime() / 1000;
    }
  });*/

  //Key Tap gesture event listener
  controller.on('keyTap', function(keyTap, frame) {
    var curr = new Date().getTime() / 1000;
    if ((keyTap.state == 'start' || keyTap.state == 'stop')
         && curr - time > 0.5){
      that.handleKeyTap({direction: 'Key Tap'});
      time = new Date().getTime() / 1000;
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
      if (swipe.state == 'start' &&  curr - time > 0.6)
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

  this.fingerEnterHandle = function (e) {if (this.onFingerEnter) this.onFingerEnter(e);};
  this.fingerLeaveHandle = function (e) {if (this.onFingerLeave) this.onFingerLeave(e);};

  this.actionDetect = function (e) {if (this.onActionDetect) this.onActionDetect(e);};
  this.handleSwipeRight = function (e) {if (this.onSwipeRight) this.onSwipeRight(e);};
  this.handleSwipeLeft = function (e) {if (this.onSwipeLeft) this.onSwipeLeft(e);};
  this.handleSwipeUp = function (e) {if (this.onSwipeUp) this.onSwipeUp(e);};
  this.handleSwipeDown = function (e) {if (this.onSwipeDown) this.onSwipeDown(e);};
  this.handleSwipeForward = function (e) {if (this.onSwipeForward) this.onSwipeForward(e);};
  this.handleSwipeBackward = function (e) {if (this.onSwipeBackward) this.onSwipeBackward(e);};
  this.handleCircle = function (e) {if (this.onCircle) this.onCircle(e);};
  //this.handleScreenTap = function (e) {if (this.onScreenTap) this.onScreenTap(e);};
  this.handleKeyTap = function (e) {if (this.onKeyTap) this.onKeyTap(e);};

};
