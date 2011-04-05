module ParseI = ParsingOwn.Make(LexingOwn)
module Parsing = ParseI
open Parsing

open Utf16
exception JSParseError = Parsing.Parse_error
open ProglangUtils
open ExtString

(* Defines functions next_lexeme lexbuf and new_file.        *)
(* next_lexeme lexbuf returns a lexeme with it's linenumber, *)
(* new_file resets the linenumber counter to zero.           *)
let (next_lexeme,set_location) =
  (* Closure variable linenumber *)
  let linenumber = ref 1
  and collumn = ref 0
  and absolute = ref 0
  and filename = ref "" in

  let rec sl = fun fil lin col abs->
    filename := fil ;
    linenumber := lin ;
    collumn := col ;
    absolute := abs

  and nl lexbuf =
    let old_position =
      Annotation.create_position !filename !linenumber !collumn !absolute
    in
    let end_pos =
      Annotation.create_position "" 0 0 0 in
    let r =
      JSLexer.mainlexer
        lexbuf 
        (Annotation.create_annotation 
            (Some (Annotation.create_dimension old_position end_pos)))
    and (st,en) = Ulexing.loc lexbuf
    in let length = en - st in
      collumn := !collumn + length ;
      absolute := !absolute + length ;
      match r with
          JSParse.Lwhitespace i -> nl lexbuf
        | JSParse.Lcomment (i, s) ->
            if String.contains s '\n' then begin
              linenumber := !linenumber + (String.countnl s) ;
              collumn := String.length s - String.rindex s '\n' - 1;
            end;
            nl lexbuf
        | JSParse.LDcomment (i,s) ->
            if String.contains s '\n' then begin
              linenumber := !linenumber + (String.countnl s);
              collumn := String.length s - String.rindex s '\n' - 1;
            end;
            nl lexbuf
        | JSParse.Lline_terminator i ->
            linenumber := !linenumber + 1 ;
            collumn := 0 ;
            nl lexbuf
        | _ -> r
  in (nl,sl)


type encoding = Regular of Ulexing.enc | EUtf16 of byte_order option
let string_of_encoding = function
    Regular Ulexing.Utf8  -> "utf8"
  | EUtf16 None -> "utf16"
  | EUtf16 (Some Big_endian) ->
      "utf16be"
  | EUtf16 (Some Little_endian) ->
      "utf16le"
  | Regular Ulexing.Ascii ->
      "ascii"
  | Regular Ulexing.Latin1 ->
      "latin1"

let parse_program ic enc =
  let lexemes =
    match enc with
        Regular Ulexing.Utf8 -> Ulexing.from_utf8_channel ic
      | Regular Ulexing.Ascii | Regular Ulexing.Latin1 ->
          Ulexing.from_latin1_channel ic
      | EUtf16 opt_bo -> from_utf16_channel ic opt_bo
  in
  JSParse.program next_lexeme lexemes

let parse_program_str s enc =
  let lexemes =
    match enc with
      | Regular Ulexing.Utf8 -> Ulexing.from_utf8_string s
      | Regular Ulexing.Ascii | Regular Ulexing.Latin1 ->
	Ulexing.from_latin1_string s
      | EUtf16 opt_bo -> from_utf16_string s opt_bo
  in
  JSParse.program next_lexeme lexemes

let parse_selts ic enc = 
  let AST.Program (_,selts) = parse_program ic enc in
    selts

let parse_statems ic enc =
  let AST.Program (_,selts) = parse_program ic enc in
  let statems =
    List.fold_left
      (fun statems -> function
           AST.Statement (_,statem) -> statem :: statems
         | x -> 
             let str = AST.so_source_element (fun x -> x) 0 x
             in failwith ("not a valid statement: \n" ^
                          (String.sub str 0 (min (String.length str) 80)) ^
                          (if String.length str > 80 then " ..." else "")))
      [] selts
  in List.rev statems

let std_parse filename = 
  let ic = open_in filename in
    parse_selts ic (Regular Ulexing.Utf8)
