(*******************************)
(* Javascript Lexer Definition *)
(*    to be used with Ulex     *)
(* --------------------------  *)
(*******************************)


(*                  ---------                   *)
(* Signature of the module JavascriptDefinition *)
(*                  ---------                   *)

exception Eof
exception Unknown_lexeme of string

(* Method lexing next lexeme in lexbuf *)

val mainlexer : Ulexing.lexbuf -> Annotation.t -> JSParse.token
