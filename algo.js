// solve :: ( allGates , allConect ) ->  State X in -> State X out
var n_reg  = 0;
var n_in   = 0;
var n_out  = 0;
var n_gate = 0;

var solve = function() {

  n_reg  = 0;
  n_in   = 0;
  n_out  = 0;
  n_gate = 0;


  let debug = console.log;
  let get_bit = function( x , i ) {
    return ( x >> i ) & 1;
  };
  let type = function( str ) {
    let tmp = str.split( '-' )[ 0 ];
    switch( tmp ) {
      case "JK":
      case "RS":
      case "T":
      case "D":
        return "reg";
      case "and":
      case "or":
      case "not":
        return "gate";
      default:
        return tmp;
    }
  };
  let gate_op = {
    "JK" : function( cb , jb , kb ) {
      return ( jb & ( cb^1 ) ) | ( ( kb^1 ) & cb );
    },
    "RS" : function( cb , rb , sb ) {
      return ( sb & ( cb^1 ) ) | ( ( rb^1 ) & cb );
    },
    "T" : function( cb , tb ) {
      return cb^tb;
    },
    "D" : function( cb , db ) {
      return db;
    }
  };


  let reg_id = {};
  let in_id  = {};
  let out_id = {};
  for( let gate_id of allGates ) {
    console.log( gate_id );
    gate_tp = type( gate_id );
    console.log( gate_tp );
    switch( gate_tp ) {
      case "reg":
        reg_id[ gate_id ] = n_reg;
        n_reg ++;
        break ;
      case "in":
        in_id[ gate_id ] = n_in;
        n_in++;
        break;
      case "out":
        out_id[ gate_id ] = n_out;
        n_out++;
        break;
      case "gate":
        n_gate++;
        break;
    }
  }
  console.log( reg_id );
  console.log( in_id );
  console.log( out_id );
  let from_tbl = {};
  for( let con_id in allConnect ) {
    let con = allConnect[ con_id ];
    console.log( con );
    from_tbl[ con.target ] = con.source;
  }

  let tbl = {};
  let init_tbl = function( cmb_reg , cmb_in ) {
    tbl = {};
    let cur_reg = 0;
    let cur_in = 0;
    for( let gate_id of allGates ) {
      if( type( gate_id ) === 'reg' ) {
        let bit = get_bit( cmb_reg , cur_reg );
        tbl[ gate_id+"-1" ] = bit;
        tbl[ gate_id+"-0" ] = bit^1;
        reg_id[ gate_id ] = cur_reg;
        cur_reg++;
      }
      else if( type( gate_id ) == 'in' ) {
        let bit = get_bit( cmb_in , cur_in );
        tbl[ gate_id ] = bit;
        cur_in++;
      }
    }
    console.log( tbl );
  }
  console.log( from_tbl.toString() );
  let dfs = function( now ) { // now must be a target or in
    console.log( "dfs " + now );
    if( now in tbl ) {
      console.log( "  return dfs " + now + " == " + tbl[ now ].toString() );
      return tbl[ now ];
    }
    let res = 0;
    let src = from_tbl[ now ];
    let typ = src.split( '-' )[ 0 ];
    if( typ === "in" ) {
      res = dfs( src );
    } else if( typ === "and" ) {
      let b0 = dfs( src+"-0" );
      let b1 = dfs( src+"-1" );
      res = b0 & b1;
    } else if( typ === "or" ) {
      let b0 = dfs( src+"-0" );
      let b1 = dfs( src+"-1" );
      res = b0 | b1;
    } else if( typ === "not" ) {
      let b = dfs( src );
      res = b^1;
    } else if( typ === "JK" ) {
      res = tbl[ src ];
    } else if( typ === "RS" ) {
      res = tbl[ src ];
    } else if( typ === "T" ) {
      res = tbl[ src ];
    } else if( typ === "D" ) {
      res = tbl[ src ];
    }
    tbl[ now ] = res;
    console.log( "  return dfs " + now + " == " + res.toString() );
    return res;
  }
  let go = function( cmb_reg , cmb_in ) {
    init_tbl( cmb_reg , cmb_in );

    let cur_reg = 0;
    let cur_out = 0;
    let res_reg = 0;
    let res_out = 0;
    for( let gate_id of allGates ) {
      let typ = gate_id.split( '-' )[ 0 ];
      if( typ === 'JK' ) {
        let cur_bit = get_bit( cmb_reg , cur_reg );
        let j_bit   = dfs( gate_id + "-J" );
        let k_bit   = dfs( gate_id + "-K" );
        res_reg += gate_op[ "JK" ]( cur_bit , j_bit , k_bit ) << cur_reg;
        cur_reg++;
      } else if( typ === 'RS' ) {
        let cur_bit = get_bit( cmb_reg , cur_reg );
        let r_bit   = dfs( gate_id + "-R" );
        let s_bit   = dfs( gate_id + "-S" );
        res_reg += gate_op[ "RS" ]( cur_bit , r_bit , s_bit ) << cur_reg;
        cur_reg++;
      } else if( typ === 'T' ) {
        let cur_bit = get_bit( cmb_reg , cur_reg );
        let t_bit   = dfs( gate_id );
        res_reg += gate_op[ "T" ]( cur_bit , t_bit ) << cur_reg;
        cur_reg++;
      } else if( typ === 'D' ) {
        let cur_bit = get_bit( cmb_reg , cur_reg );
        let d_bit   = dfs( gate_id );
        res_reg += gate_op[ "D" ]( cur_bit , d_bit ) << cur_reg;
        cur_reg++;
      } else if( typ === 'out' ) {
        let o_bit = dfs( gate_id );
        res_out += o_bit << cur_out;
        cur_out++;
      }
    }
    return [ res_reg , res_out ];
  };


  console.log( "n_reg " + n_reg.toString() );
  console.log( "n_in " + n_in.toString() );
  console.log( "n_out " + n_out.toString() );
  console.log( "n_gate " + n_gate.toString() );
  let ret = new Array( ( 1 << n_reg ) );

  for( let cmb_reg = 0 ; cmb_reg < ( 1 << n_reg ) ; cmb_reg++ ) {
    ret[ cmb_reg ] = new Array( ( 1 << n_in ) );
    for( let cmb_in = 0 ; cmb_in < ( 1 << n_in ) ; cmb_in++ ) {
      ret[ cmb_reg ][ cmb_in ] = go( cmb_reg , cmb_in );
      let nxt_reg = ret[ cmb_reg ][ cmb_in ][ 0 ];
      let nxt_out = ret[ cmb_reg ][ cmb_in ][ 1 ];
      console.log( "  " + cmb_reg.toString( 2 ) + " --- " + cmb_in.toString( 2 ) + " \\ " + nxt_out.toString( 2 ) + " ---> " + nxt_reg.toString( 2 ) );
    }
  }

  return ret;

};
