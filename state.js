

jsPlumb.ready(function () {

    // setup some defaults for jsPlumb.
    var instance = jsPlumb.getInstance({
        Endpoint: ["Dot", {radius: 2}],
        Connector:"StateMachine",
        HoverPaintStyle: {strokeStyle: "#1e8151", lineWidth: 5 },
        ConnectionOverlays: [
            [ "Arrow", {
                location: 1,
                id: "arrow",
                length: 14,
                foldback: 0.8
            } ],
            [ "Label", {
              id: "label",
              cssClass: "aLabel"
            }]
        ],
        Container: "state-canvas"
    });

    instance.registerConnectionType("basic", { anchor:"Continuous", connector:"StateMachine" });

    window.jsp = instance;

    var stateCanvas = document.getElementById("state-canvas");
    var windows = jsPlumb.getSelector(".statemachine-demo .w");


    //
    // initialise element as connection targets and source.
    //
    var initNode = function(el) {

        // initialise draggable elements.
        instance.draggable(el);

        instance.makeSource(el, {
            filter: ".ep",
            anchor: "Continuous",
            connectorStyle: { strokeStyle: "#5c96bc", lineWidth: 2, outlineColor: "transparent", outlineWidth: 4 },
            connectionType:"basic",
            extract:{
                "action":"the-action"
            },
            /*maxConnections: 2,
            onMaxConnections: function (info, e) {
                alert("Maximum connections (" + info.maxConnections + ") reached");
            }*/
        });

        instance.makeTarget(el, {
            dropOptions: { hoverClass: "dragHover" },
            anchor: "Continuous",
            allowLoopback: true
        });

        // this is not part of the core demo functionality; it is a means for the Toolkit edition's wrapped
        // version of this demo to find out about new nodes being added.
        //
        instance.fire("jsPlumbDemoNodeAdded", el);
    };


    getAns = function() {
        let ret = solve();

        let convertState = function( st , size ) {
            let a = '';
            while(st > 0) {
              a += '' + (st % 2);
              st = st >> 1;
            }
            while(a.length < size) {
              a += '0';
            }
            return a;
        };

        let createNode = function( state_num ) { // create nodes in clockwise
          let center = { x: 400, y: 400 };
          let radius = 300;
          // create Node with id="state[id]" & class="w"
          for( var i = 0 ; i < (state_num) ; i++ ) {
            var st = document.createElement( 'div' );
            st.className = 'w';
            st.id = 'state' + call + '-' + i;
            st.innerHTML = convertState( i, n_reg ); // ep ?
            let theta = 2*Math.PI*i/(state_num);
            st.style.left = (center.x + radius*Math.sin( theta )) + 'px';
            st.style.top = (center.y + radius*Math.cos( theta )) + 'px';
            instance.getContainer().appendChild(st);
            initNode(st);
          }
        };

        createNode( ret.length );
        for( var reg = 0 ; reg < (ret.length) ; reg++ ) { // reg_status
          for( var inp = 0 ; inp < ret[reg].length ; inp++ ) { // input_status
            instance.connect( {
              source: "state" + call + '-' + reg ,
              target: "state" + call + '-' + ret[reg][inp][0] ,
              type:"basic" ,
              overlays:[
                  [ "Label", {
                    label:"IN: " + convertState( inp , n_in ) + ' -> OUT: ' + convertState( ret[reg][inp][1] , n_out ),
                    location:0.25,
                    id:"myLabel",
                    cssClass: "aLabel" } ]
                ],
            } );
          }
        }

        let order = 'The state sequence ::  ';
        for( var gate of allGates ) {
          let gt = gate.split('-')[0];
          if(['JK','RS','T','D'].indexOf( gt ) >= 0)
            order += (gate + ' > ');
        }
        order = order.substring(0, order.length -2);

        $('#output').text(order);

        call += 1;

    };

    clearStates = function() {
      jsPlumb.detachEveryConnection();
      jsPlumb.deleteEveryEndpoint();
      jsPlumb.empty('state-canvas');
    }

    // suspend drawing and initialise.
    instance.batch(function () {

    });

    jsPlumb.fire("jsPlumbDemoLoaded", instance);

});

var getAns, clearStates;
var call = 0;
