(***********************************************************************)
(*                                                                     *)
(*                           Objective Caml                            *)
(*                                                                     *)
(*            Xavier Leroy, projet Cristal, INRIA Rocquencourt         *)
(*                                                                     *)
(*  Copyright 1996 Institut National de Recherche en Informatique et   *)
(*  en Automatique.  All rights reserved.  This file is distributed    *)
(*  under the terms of the GNU Library General Public License, with    *)
(*  the special exception on linking described in file ../LICENSE.     *)
(*                                                                     *)
(***********************************************************************)

(* $Id: parsing.ml,v 1.18 2004/01/01 16:42:40 doligez Exp $ *)

(* The parsing engine *)

module type LEXER = sig
  type lexbuf 
  type position = int
  val dummy_pos : position
  val get_start_pos : lexbuf -> position
  val get_current_pos : lexbuf -> position
  val get_position_cnum : position -> position
end
module type PARSING = sig
  exception Parse_error
  exception YYexit of Obj.t

  type position
  type lexbuf
  type parser_env
  type parse_tables =
      { actions : (parser_env -> Obj.t) array;
        transl_const : int array;
        transl_block : int array;
        lhs : string;
        len : string;
        defred : string;
        dgoto : string;
        sindex : string;
        rindex : string;
        gindex : string;
        tablesize : int;
        table : string;
        check : string;
        error_function : string -> unit;
        names_const : string;
        names_block : string 
      }


  val symbol_start : unit -> int
  val symbol_end : unit -> int
  val rhs_start : int -> int
  val rhs_end : int -> int
  val symbol_start_pos : unit -> position
  val symbol_end_pos : unit -> position
  val rhs_start_pos : int -> position
  val rhs_end_pos : int -> position
  val clear_parser : unit -> unit
  val yyparse :
    parse_tables -> int -> (lexbuf -> 'a) -> lexbuf -> 'b
  val peek_val : parser_env -> int -> 'a
  val is_current_lookahead : 'a -> bool
  val parse_error : string -> unit

  module Lexing : LEXER
end

module Make : functor (L: LEXER) -> PARSING
  with type position = L.position
  and type Lexing.position = L.position
  and type lexbuf = L.lexbuf
  and type Lexing.lexbuf = L.lexbuf
  =
  functor (L: LEXER) -> struct
    exception YYexit of Obj.t
    exception Parse_error

    type position = L.position
    type lexbuf = L.lexbuf
    open L
      (* Internal interface to the parsing engine *)

    type parser_env =
        { mutable s_stack : int array;        (* States *)
          mutable v_stack : Obj.t array;      (* Semantic attributes *)
          mutable symb_start_stack : position array; (* Start positions *)
          mutable symb_end_stack : position array;   (* End positions *)
          mutable stacksize : int;            (* Size of the stacks *)
          mutable stackbase : int;            (* Base sp for current parse *)
          mutable curr_char : int;            (* Last token read *)
          mutable lval : Obj.t;               (* Its semantic attribute *)
          mutable symb_start : position;      (* Start pos. of the current symbol*)
          mutable symb_end : position;        (* End pos. of the current symbol *)
          mutable asp : int;                  (* The stack pointer for attributes *)
          mutable rule_len : int;             (* Number of rhs items in the rule *)
          mutable rule_number : int;          (* Rule number to reduce by *)
          mutable sp : int;                   (* Saved sp for parse_engine *)
          mutable state : int;                (* Saved state for parse_engine *)
          mutable errflag : int }             (* Saved error flag for parse_engine *)
          
    type parse_tables =
        { actions : (parser_env -> Obj.t) array;
          transl_const : int array;
          transl_block : int array;
          lhs : string;
          len : string;
          defred : string;
          dgoto : string;
          sindex : string;
          rindex : string;
          gindex : string;
          tablesize : int;
          table : string;
          check : string;
          error_function : string -> unit;
          names_const : string;
          names_block : string 
        }

  type parser_input =
      Start
    | Token_read
    | Stacks_grown_1
    | Stacks_grown_2
    | Semantic_action_computed
    | Error_detected

  type parser_output =
      Read_token
    | Raise_parse_error
    | Grow_stacks_1
    | Grow_stacks_2
    | Compute_semantic_action
    | Call_error_function

  external parse_engine :
    parse_tables -> parser_env -> parser_input -> Obj.t -> parser_output
    = "caml_parse_engine"
      
  let env =
    { s_stack = Array.create 100 0;
      v_stack = Array.create 100 (Obj.repr ());
      symb_start_stack = Array.create 100 dummy_pos;
      symb_end_stack = Array.create 100 dummy_pos;
      stacksize = 100;
      stackbase = 0;
      curr_char = 0;
      lval = Obj.repr ();
      symb_start = dummy_pos;
      symb_end = dummy_pos;
      asp = 0;
      rule_len = 0;
      rule_number = 0;
      sp = 0;
      state = 0;
      errflag = 0 
    }

  let grow_stacks() =
    let oldsize = env.stacksize in
    let newsize = oldsize * 2 in
    let new_s = Array.create newsize 0
    and new_v = Array.create newsize (Obj.repr ())
    and new_start = Array.create newsize dummy_pos
    and new_end = Array.create newsize dummy_pos in
      Array.blit env.s_stack 0 new_s 0 oldsize;
      env.s_stack <- new_s;
      Array.blit env.v_stack 0 new_v 0 oldsize;
      env.v_stack <- new_v;
      Array.blit env.symb_start_stack 0 new_start 0 oldsize;
      env.symb_start_stack <- new_start;
      Array.blit env.symb_end_stack 0 new_end 0 oldsize;
      env.symb_end_stack <- new_end;
      env.stacksize <- newsize

  let clear_parser() =
    Array.fill env.v_stack 0 env.stacksize (Obj.repr ());
    env.lval <- Obj.repr ()

  let current_lookahead_fun = ref (fun (x : Obj.t) -> false)

  let yyparse tables start lexer_fun lexbuf =
    let rec loop cmd arg =
      match parse_engine tables env cmd arg with
          Read_token ->
	        let medVal = lexer_fun lexbuf in 
            let t = Obj.repr(medVal) in
              env.symb_start <- get_start_pos lexbuf;
              env.symb_end <- get_current_pos lexbuf;
              loop Token_read t
        | Raise_parse_error ->
            raise Parse_error
        | Compute_semantic_action ->
            let (action, value) =
              try
                (Semantic_action_computed, tables.actions.(env.rule_number) env)
              with Parse_error ->
                (Error_detected, Obj.repr ()) in
              loop action value
        | Grow_stacks_1 ->
            grow_stacks(); loop Stacks_grown_1 (Obj.repr ())
        | Grow_stacks_2 ->
            grow_stacks(); loop Stacks_grown_2 (Obj.repr ())
        | Call_error_function ->
            tables.error_function "syntax error";
            loop Error_detected (Obj.repr ()) in
    let init_asp = env.asp
    and init_sp = env.sp
    and init_stackbase = env.stackbase
    and init_state = env.state
    and init_curr_char = env.curr_char
    and init_errflag = env.errflag in
      env.stackbase <- env.sp + 1;
      env.curr_char <- start;
      env.symb_end <- get_current_pos(lexbuf);
      try
        loop Start (Obj.repr ())
      with exn ->
        let curr_char = env.curr_char in
          env.asp <- init_asp;
          env.sp <- init_sp;
          env.stackbase <- init_stackbase;
          env.state <- init_state;
          env.curr_char <- init_curr_char;
          env.errflag <- init_errflag;
          match exn with
              YYexit v ->
                Obj.magic v
            | _ ->
                current_lookahead_fun :=
                  (fun tok ->
                     if Obj.is_block tok
                     then tables.transl_block.(Obj.tag tok) = curr_char
                     else tables.transl_const.(Obj.magic tok) = curr_char);
                raise exn

  let peek_val env n =
    Obj.magic env.v_stack.(env.asp - n)

  let symbol_start_pos () =
    if env.rule_len > 0
    then env.symb_start_stack.(env.asp - env.rule_len + 1)
    else env.symb_end_stack.(env.asp)
      
  let symbol_end_pos () = env.symb_end_stack.(env.asp)
  let rhs_start_pos n = env.symb_start_stack.(env.asp - (env.rule_len - n))
  let rhs_end_pos n = env.symb_end_stack.(env.asp - (env.rule_len - n))

  let symbol_start () = get_position_cnum (symbol_start_pos ())
  let symbol_end () = get_position_cnum (symbol_end_pos ())
  let rhs_start n = get_position_cnum (rhs_start_pos n)
  let rhs_end n = get_position_cnum (rhs_end_pos n)

  let is_current_lookahead tok =
    (!current_lookahead_fun)(Obj.repr tok)

  let parse_error (msg : string) = ()

  module Lexing = L

end
