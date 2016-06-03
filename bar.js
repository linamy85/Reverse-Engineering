// for toolbar
//

var bar_renderer = PIXI.autoDetectRenderer( window.innerWidth , 50 , null );
bar_renderer.backgroundColor =  0xBCFFDE;
bar_renderer.transparent = false;

var stage = new PIXI.Stage( 0xbcffde , true );

//document.getElementById("toolbar").appendChild( bar_renderer.view );
document.body.appendChild( bar_renderer.view );
bar_renderer.view.style.position = "absolute";
bar_renderer.view.style.top = "0px";
bar_renderer.view.style.left = "0px";
requestAnimationFrame( animate );

var button_size = 40;

function animate() {

  requestAnimationFrame( animate );

  //stage.interactionManager.update();
  // render the stage   
  renderer.render(stage);
}

