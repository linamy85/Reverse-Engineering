/*var NW = require('nw.gui');*/
const gateNum = { "JK": 0 , "RS": 1, "T": 2, "D": 3, "or": 4, "and": 5, "not": 6, "in": 7, "out": 8};
var used = [0,0,0,0,0,0,0,0,0];

/* spec of target // respect to connection

   JK, RS => JK-[index]-[J/K]
   T, D => T-[index]

   and, or => and-[index]-0/1  // for uniqueness
   not => not-[index]

   out => out-[index]-[output_name]
   */

/* spec of source // respect to connection

   JK, RS, T, D => JK-[index]-[0/1] // 0 for Q' , 1 for Q

   and, or, not => and-[index]

   in => in-[index]-[output_name]
   */

jsPlumb.ready(function () {
  let allData = {};

  var instance = window.jsp = jsPlumb.getInstance({
    // default drag options
    DragOptions: { cursor: 'pointer', zIndex: 2000 },
    // the overlays to decorate each connection with.  note that the label overlay uses a function to generate the label text; in this
    // case it returns the 'labelText' member that we set on each connection in the 'init' method below.
    ConnectionOverlays: [
      [ "Arrow", {
        location: 1,
        visible:true,
        id:"ARROW",
        events:{
          click:function() { alert("you clicked on the arrow overlay")}
        }
      } ],
      [ "Label", { // on the line
        location: 0.1,
        id: "label",
        cssClass: "aLabel",
        events:{
          tap:function() { alert("hey"); }
        }
      }]
    ],
    Container: "canvas"
  });

  var basicType = {
    connector: "FlowChart",
    paintStyle: { strokeStyle: "red", lineWidth: 4 },
    hoverPaintStyle: { strokeStyle: "blue" },
    overlays: [
      "Arrow"
    ]
  };
  instance.registerConnectionType("basic", basicType);

  // this is the paint style for the connecting lines..
  var connectorPaintStyle = {
    lineWidth: 4,
    strokeStyle: "#61B7CF",
    joinstyle: "round",
    outlineColor: "white",
    outlineWidth: 2
  },
  // .. and this is the hover style.
  connectorHoverStyle = {
    lineWidth: 4,
    strokeStyle: "#216477",
    outlineWidth: 2,
    outlineColor: "white"
  },
  endpointHoverStyle = {
    fillStyle: "#216477",
    strokeStyle: "#216477"
  },
  // the definition of source endpoints (the small blue ones)

  /*defines the source node*/
  sourceEndpoint = {
    endpoint: "Dot",
    paintStyle: {
      strokeStyle: "#7AB02C",
      fillStyle: "transparent",
      radius: 7,
      lineWidth: 3
    },
    isSource: true,
    connector: [ "Flowchart", { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ],
    connectorStyle: connectorPaintStyle,
    hoverPaintStyle: endpointHoverStyle,
    maxConnections: 10,
    connectorHoverStyle: connectorHoverStyle,
    dragOptions: {},
    overlays: [
      [ "Label", {
        location: [0.5, 1.5],
        label: "Drag",
        cssClass: "endpointSourceLabel",
        visible:false
      } ]
    ]
  },

  /*clockEndpoint = {
    endpoint: "Triangle",
    paintStyle: { fillStyle: "#7AB02C", radius: 11, rotation: 90 },
    hoverPaintStyle: endpointHoverStyle,
    maxConnections: -1,
    dropOptions: { hoverClass: "hover", activeClass: "active" },
    isTarget: true,
    overlays: [
    [ "Label", { location: [0.5, -0.5], label: "Drop", cssClass: "endpointTargetLabel", visible:false } ]
    ]
    },*/

  // the definition of target endpoints (will appear when the user drags a connection)

  /*defines the point of target node*/
  targetEndpoint = {
    endpoint: "Dot",
    paintStyle: { fillStyle: "#7AB02C", radius: 11 },
    hoverPaintStyle: endpointHoverStyle,
    maxConnections: 1,
    dropOptions: { hoverClass: "hover", activeClass: "active" },
    isTarget: true,
    overlays: [
      [ "Label", { location: [0.5, -0.5], label: "Drop", cssClass: "endpointTargetLabel", visible:false } ]
    ]
  },
  init = function (connection) {
    connection.getOverlay("label").setLabel(connection.sourceId.substring(15) + "-" + connection.targetId.substring(15));
  };

  var _addEndpoints = function (toId, sourceAnchors, targetAnchors/*, clockAnchors*/) {
    console.log( 'here: ' + allData[toId] );
    allData[ toId ][ 'EP' ] = []
    for (var i = 0; i < sourceAnchors.length; i++) {
      var sourceUUID = toId + sourceAnchors[i];
      let ep = instance.addEndpoint("flowchart" + toId, sourceEndpoint, {
        anchor: sourceAnchors[i], uuid: sourceUUID
      });
      allData[ toId ][ 'EP' ].push(ep);
    }
    for (var j = 0; j < targetAnchors.length; j++) {
      var targetUUID = toId + targetAnchors[j];
      let ep = instance.addEndpoint("flowchart" + toId, targetEndpoint, {
        anchor: targetAnchors[j], uuid: targetUUID
      });
      allData[ toId ][ 'EP' ].push(ep);
    }

  };

  /*
     add gate from button
     */
  addGate = function(type){

    let gateInit = function(gateId) {
      $('#flowchart' + gateId).css({
        left:100,
        top: 200
      });
    };


    console.log("Add Gate", type);
    var newGate = document.createElement("div");
    var gateId = type + '-' + used[ gateNum[ type ] ];
    used[ gateNum[type] ]++;




    if(gateNum[type] < 2) { // JK, RS
      newGate.id = 'flowchart' + gateId;
      allData[ gateId ] = {};

      newGate.className = "window jtk-node";
      $('#canvas').append( newGate );


      $('#flowchart' + gateId).append('<h4 align="left">' + type[0] + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + 'Q' + '</h4>');
      $('#flowchart' + gateId).append('<h4 align="left">' + type[1] + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + 'Q\'' + '</h4>');

      gateInit(gateId);
      _addEndpoints(gateId,
        [
        "TopRight", "BottomRight"/*[ 1, 0.2, 1, 0, 0, 0, "right" ], [ 1, 0.8, 1, 0, 0, 0, "right" ]*/
      ], [
        "TopLeft", "BottomLeft"/*[ 0, 0.2, 0, 0, 0, 0, "left" ], [ 0, 0.8, 0, 0, 0, 0, "left" ]*/
      ]/*, ["BottomCenter"]*/);

    } else if(gateNum[type] < 4) { // T, D
      newGate.id = 'flowchart' + gateId;
      allData[ gateId ] = {};

      newGate.className = "window jtk-node";
      $('#canvas').append( newGate );

      $('#flowchart' + gateId).append('<h4 align="left">' + type[0] + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + 'Q' + '</h4>');
      $('#flowchart' + gateId).append('<h4 align="right">' + 'Q\'' + '</h4>');
      gateInit(gateId);
      _addEndpoints(gateId, ["TopRight", "BottomRight"], ["TopLeft"]/*, ["BottomLeft"]*/);

    } else if(gateNum[type] == 4){ // or
      newGate.id = 'flowchart' + gateId;
      allData[ gateId ] = {};

      newGate.className = "window-or jtk-node";
      $('#canvas').append( newGate );
      gateInit(gateId);
      _addEndpoints(gateId, ["RightMiddle"], ["TopLeft", "BottomLeft"]/*, ["BottomLeft"]*/);

    } else if(gateNum[type] == 5){ // and
      newGate.id = 'flowchart' + gateId;
      allData[ gateId ] = {};

      newGate.className = "window-and jtk-node";
      $('#canvas').append( newGate );
      gateInit(gateId);
      _addEndpoints(gateId, ["RightMiddle"], ["TopLeft", "BottomLeft"]/*, ["BottomLeft"]*/);

    } else if(gateNum[type] == 6){ // not
      newGate.id = 'flowchart' + gateId;
      allData[ gateId ] = {};

      newGate.className = "window-trian jtk-node";
      $('#canvas').append( newGate );
      gateInit(gateId);
      _addEndpoints(gateId, ["RightMiddle"], ["LeftMiddle"]);

    } else { // in, out
      var name = prompt( type+"put name?", type+(used[gateNum[type]]-1) );
      if(name == null) {
        used[ gateNum[type] ]--;
        return;
      }
      gateId = gateId + '-' + name;
      allData[ gateId ] = {};
      newGate.id = 'flowchart' + gateId;



      newGate.className = "window-trian-" + type + " jtk-node";
      $('#canvas').append( newGate );

      gateInit(gateId);

      if(type == "in") {
        _addEndpoints(gateId, ["RightMiddle"], []);
      } else {
        _addEndpoints(gateId, [], ["LeftMiddle"]);
      }

      $('#flowchart' + gateId).append('<h3>' + name + '</h3>');


    }
    allGates.push(gateId);

    instance.draggable($('#flowchart' + gateId)/*, { grid: [20, 20] }*/);


    allData[ gateId ][ 'Conn' ] = [];

    $('#flowchart' + gateId).dblclick(function() {
      console.log('[[[[[[[[[[[[[[[[[[[      ' + gateId + '         ]]]]]]]]]]]]]]]]]]]' + allData[gateId]);
      if(allData[gateId]['Conn'].length > 0) {
        alert('善哉善哉。只有孤單者得以歸去。');
        return;
      }
      if(!confirm('You want to delete ' + gateId + ' ?'))
        return;
      jsPlumb.detachAllConnections($('#flowchart' + gateId));
      jsPlumb.removeAllEndpoints('flowchart' + gateId);
      jsPlumb.detach($('#flowchart' + gateId));
      jsPlumb.remove($('#flowchart' + gateId));


      // remove endpoints
      for(var ep of allData[ gateId ][ 'EP' ]) {
        jsPlumb.deleteEndpoint(ep);
      }
      // remove gate index
      FindAndDelete(allGates, gateId);
      // remove connection
      for(var conne of allData[ gateId ][ 'Conn' ]) {
        delete allConnect[ conne ];
      }

      delete allData[ gateId ];
      jsPlumb.repaintEverything();


    });

    /*$(document).bind( "mousemove" , function(e) {
      $('#flowchart' + gateId).css({
      left: e.pageX - 100,
      top: e.pageY - 200
      });
      $(document).bind( "click" , function(e){
      $(document).unbind( "mousemove" );
      });

      });*/

  }

  clearAll = function(){

    jsPlumb.detachEveryConnection();
    jsPlumb.deleteEveryEndpoint();
    jsPlumb.empty('canvas');

    allGates = [];
    allConnect = {};
    allEp = {};

    $('#output').text('');
  }

  // suspend drawing and initialise.
  instance.batch(function () {

    // listen for new connections; initialise them the same way we initialise the connections at startup.
    instance.bind("connection", function (connInfo, originalEvent) {
      /*init(connInfo.connection);*/
    });

    // make all the window divs draggable
    instance.draggable(jsPlumb.getSelector(".flowchart-demo .window"), { grid: [20, 20] });
    // THIS DEMO ONLY USES getSelector FOR CONVENIENCE. Use your library's appropriate selector
    // method, or document.querySelectorAll:
    //jsPlumb.draggable(document.querySelectorAll(".window"), { grid: [20, 20] });

    //
    // listen for clicks on connections, and offer to delete connections on click.
    //
    instance.bind("click", function (conn, originalEvent) {
      console.log(conn);
      if (confirm("Delete connection from " + conn.sourceId + " to " + conn.targetId + "?")) {
        instance.detach(conn); // delete line
        delete allConnect[conn.id];
        console.log( allConnect );

        let src = conn.sourceId.replace('flowchart', '');
        let trg = conn.targetId.replace('flowchart', '');
        FindAndDelete( allData[src]['Conn'] , conn.id);
        FindAndDelete( allData[trg]['Conn'] , conn.id);
      }

      /*conn.toggleType("basic");*/
    });

    instance.bind("connectionDrag", function (connection) {
      /*console.log("connection " + connection.id + " is being dragged. suspendedElement is ", connection.suspendedElement, " of type ", connection.suspendedElementType);*/
    });

    let valid = function( str ) {
      return !str.startsWith( "jsPlumb" );
    }

    instance.bind("connectionDragStop", function (connection) {

      /*console.log(connection);
        console.log('+++++++++++');
        */

      var conObj = getConId( connection );

      if( valid( conObj.target ) ) {
        allConnect[connection.id] = conObj;

        console.log( '  ++   ' , conObj.source + ' --> ' + conObj.target );
        console.log( '-------------------------' );
        for(var con in allConnect){
          console.log(con + ' :: ' + allConnect[con].source + ' -> ' + allConnect[con].target + '\n');
        }
        console.log( '-------------------------' );

        let src = connection.sourceId.replace('flowchart', '');
        let trg = connection.targetId.replace('flowchart', '');
        allData[ src ][ 'Conn' ].push(connection.id);
        allData[ trg ][ 'Conn' ].push(connection.id);
      }
    });
  });

  jsPlumb.fire("jsPlumbDemoLoaded", instance);

});

var addGate, clearAll;
var allGates = [];
var allConnect = {};


var getConId = function(connection) {

  if( (typeof connection.source == 'undefined' ) || (typeof connection.target == 'undefined' ) ) { // not successful connected
    return {};
  }

  var source = connection.sourceId.replace('flowchart', '');
  var target = connection.targetId.replace('flowchart', '');
  var sourceAnc = connection.endpoints[0].anchor.type;
  var targetAnc = connection.endpoints[1].anchor.type;
  var srcType = source.split('-')[0];
  var trgType = target.split('-')[0];


  /*
     src: type-id-out(Q for 1 or Q' for 0)
     tar: type-id-in(J or K or R or S)
     */
  if( srcType == 'JK' || srcType == 'RS' || srcType == 'T' || srcType == 'D'){
    if( sourceAnc == "BottomRight" ){ // Q'
      source = source + '-0';
    } else { // Q
      source = source + '-1';
    }
  }

  if( trgType == 'JK' || trgType == 'RS' ) {
    if( targetAnc == "TopLeft" ) {
      target = target + '-' + trgType[0];
    } else {
      target = target + '-' + trgType[1];
    }
  } else if( trgType == 'and' || trgType == 'or' ) {
    if( targetAnc == 'TopLeft' ) {
      target = target + '-0';
    } else {
      target = target + '-1';
    }
  }

  return {
    target: target,
    source: source
  };



}

var FindAndDelete = function(ar, it) {
  for(var i in ar) { // update all gate number
    if( ar[i] == it ) {
      ar.splice(i, 1);
      console.log('Find ' + it + '-> ' + ar);
    }
  }
}
