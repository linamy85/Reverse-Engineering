// 

var renderer = PIXI.autoDetectRenderer( window.innerWidth , window.innerHeight-50 , null );
renderer.backgroundColor = 0xADFC92;
renderer.transparent = false;

var stage = new PIXI.Stage( 0xadfc92 , true );


// add the renderer view element to the DOM
document.body.appendChild(renderer.view);
renderer.view.style.position = "absolute";
renderer.view.style.top = "50px";
renderer.view.style.left = "0px";
requestAnimationFrame( animate );

// // create a texture from an image path
// var texture = PIXI.Texture.fromImage("../../../img/initializing@2x.png");

//[> toolbar <]
//var toolbar_con = new PIXI.Container();
//stage.addChild( toolbar_con );





// render the tilemap to a render texture
var ff_width = 80, ff_height = 100;

var texture = new PIXI.RenderTexture( renderer , ff_width , ff_height );
r1 = new PIXI.Graphics()
r1.beginFill(0xFFFF00);
r1.drawRect(0, 0, ff_width, ff_height );
r1.endFill()
texture.render(r1);

var text = new PIXI.Text(" J\n\n K\n");
texture.render( text );



for (var i=0; i < 10; i++) 
{
  createBunny(Math.random() * window.innerWidth, Math.random() * window.innerHeight)
};


function createBunny(x, y)
{
  // create our little bunny friend..
  var bunny = new PIXI.Sprite(texture);
  //  bunny.width = 300;
  // enable the bunny to be interactive.. this will allow it to respond to mouse and touch events     
  bunny.interactive = true;
  // this button mode will mean the hand cursor appears when you rollover the bunny with your mouse
  bunny.buttonMode = true;

  // center the bunnys anchor point
  bunny.anchor.x = 0.5;
  bunny.anchor.y = 0.5;
  // make it a bit bigger, so its easier to touch
  bunny.scale.x = bunny.scale.y = 0.5;

  // use the mousedown and touchstart
  bunny.mousedown = bunny.touchstart = function(event)
  {
    //      data.originalEvent.preventDefault()
    // store a refference to the data
    // The reason for this is because of multitouch
    // we want to track the movement of this particular touch
    this.data = event.data;
    this.alpha = 0.5;
    this.dragging = true;
    this.sx = this.data.getLocalPosition(bunny).x * bunny.scale.x;
    this.sy = this.data.getLocalPosition(bunny).y * bunny.scale.y;    
  };

    // set the events for when the mouse is released or a touch is released
    bunny.mouseup = bunny.mouseupoutside = bunny.touchend = bunny.touchendoutside = function(data)
    {
      this.alpha = 1
      this.dragging = false;
      // set the interaction data to null
      this.data = null;
    };

    // set the callbacks for when the mouse or a touch moves
    bunny.mousemove = bunny.touchmove = function(data)
    {
      if(this.dragging)
        {
          // need to get parent coords..
          var newPosition = this.data.getLocalPosition(this.parent);
           //this.position.x = newPosition.x;
           //this.position.y = newPosition.y;
          this.position.x = newPosition.x - this.sx;
          this.position.y = newPosition.y - this.sy;
        }
    }

    // move the sprite to its designated position
    bunny.position.x = x;
    bunny.position.y = y;

    // add it to the stage
    stage.addChild(bunny);
}

function animate() {

  requestAnimationFrame( animate );

  // just for fun, lets rotate mr rabbit a little
  //stage.interactionManager.update();
  // render the stage   
  renderer.render(stage);
}

