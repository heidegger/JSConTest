(** Parser Interface for ocamlyacc.

    Use this module to parametrize ocamlyacc
    files with an other lexer than ocamllex. 

    First add this three lines in front of our
    {i mly} file to use the other lexer.
    
{v module Parsing = ParsingOwn.Make(LexingOwn)
open Parsing
module Lexing = Parsing.Lexing v}

    Second create a file with extension mlyy, that
    contains 

{v module Lexing : sig
  type lexbuf = LexingOwn.lexbuf
end v}

Using a shell scrit that contains
{v ocamlyacc $1
BASE="`basename "$1" ".mly"`"
cat "$BASE.mlyy" "$BASE.mli" > "$BASE.mli_mtp"
mv "$BASE.mli_mtp" "$BASE.mli" v}

instead of calling ocamlyacc in our Makefile 
directly allows you to use the ocamlyacc parser
generator with an arbitrary lexer.
    
    @author: Phillip Heidegger
*)

module type LEXER =
  sig
    type lexbuf
    type position = int
    val dummy_pos : position
    val get_start_pos : lexbuf -> position
    val get_current_pos : lexbuf -> position
    val get_position_cnum : position -> position
  end

module type PARSING =
  sig
    exception Parse_error
    exception YYexit of Obj.t
    type position
    type lexbuf
    type parser_env
    type parse_tables = {
      actions : (parser_env -> Obj.t) array;
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
      names_block : string;
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
    val yyparse : parse_tables -> int -> (lexbuf -> 'a) -> lexbuf -> 'b
    val peek_val : parser_env -> int -> 'a
    val is_current_lookahead : 'a -> bool
    val parse_error : string -> unit
    module Lexing : LEXER
  end

module Make :
  functor (L : LEXER) ->
    PARSING
  with type position = L.position
  and type Lexing.position = L.position
  and type lexbuf = L.lexbuf
  and type Lexing.lexbuf = L.lexbuf
  
