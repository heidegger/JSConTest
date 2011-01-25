(*pp camlp4o -I `ocamlfind query ulex` pa_ulex.cma *)

open ContractParse

let regexp rtrue = "true" | "True"
let regexp rfalse = "false" | "False"
let regexp rbool = "bool" | "boolean" | "Boolean"
let regexp rint = "int" | "integer" | "Integer"
let regexp rstring = "string" | "String"
let regexp rfloat = "float" | "Float"
let regexp rundf = "undf" | "undefined"
let regexp rvoid = "void"
let regexp rnull = "null"
let regexp rtop = "top" | "T" | "Top"
let regexp rid = "id" | "ID" | "Id"
let regexp robject = "Object" | "object"
let regexp ror = "or"
let regexp rlength = "length"
let regexp rnatural = "natural" | "nat"

let regexp rlparan = "("
let regexp rrparan = ")"
let regexp rlbraket = "["
let regexp rrbraket = "]"
let regexp rstar = "*"
let regexp rarrow = "->"
let regexp rcolon = ":"
let regexp rcomma = ","
let regexp left = "/*c" "*"*
let regexp rsemicolon = ";"
let regexp rbar = "|"
let regexp rlbrace = "{"
let regexp rrbrace = "}"
let regexp rdotdotdot = "," " "* "..."
let regexp rdot = "."

let regexp rat = "@"
let regexp rsconstants = "strings"
let regexp rnconstants = "numbers"
let regexp rlabels = "labels"

let regexp digit = ['0'-'9']
let regexp exponent = ['e' 'E'] ['+' '-'] digit+
let regexp floating = (digit+ '.' digit* | digit* '.' digit+) exponent?

let regexp escape_sequence = 
  "\\b" | "\\t" | "\\n" | "\\f" | "\\r" |
  "\\\"" | "\\" "'" | "\\\\" 
let regexp upper = ['A' - 'Z']
let regexp lower = ['a' - 'z']
let regexp char = lower | upper | digit | '_'| escape_sequence
let regexp string = '"' char* '"'
let regexp jsident = "js:" ['a'-'z' 'A'-'Z' '0'-'9' '_']* 
let regexp customcontract = "cc:" ['a'-'z' 'A'-'Z' '0'-'9' '_']* 
let regexp identifier = ['a'-'z' 'A'-'Z' '0'-'9' '_']* 
let regexp dependend = ("$")+ ['1'-'9'] digit*
let regexp rlet = "let"


let regexp rnotest = "~noTests"
let regexp rnoasserts = "~noAsserts"
let regexp rnbtest = "#Tests:" digit+
let regexp rnoeffects = "~noEffects" | "~noeffects"
let regexp reffects = "~Effects" | "~effects"

let regexp rthis = "this"
let regexp rwith = "with" | "With"
let regexp rquestionmark = "?"



let regexp re_escape_sequence =
  "\\" "/" | escape_sequence

let regexp re_character     =
  (* Anything but slash and backslash (but with escape_sequences) *)
  [0-0x002e] | [0x0030-0x005b] | [0x005d-0xffff] | re_escape_sequence

let regexp re_flags =
  "" (* no flag *)
  | "g" | "i" | "m" (* one flag *)
  | "gi" | "gm" | "ig" | "im" | "mg" | "mi" (* two flags*) 
  | "gim" | "gmi" | "igm" | "img" | "mgi" | "mig" (* three flags *)
  

let regexp re_literal = 
  '/' re_character* '/' re_flags


let token =
  let left_read = ref false in
  let rec token lexbuf =
    let left_lexer = lexer
      | left -> 
          left_read := true;
          token lexbuf
      | _ -> failwith "This should never happen"
    in

    let other_lexer = lexer
      | [' ' '\t' '\n'] -> token lexbuf
      | dependend       -> 
          let s = Ulexing.utf8_lexeme lexbuf in
          let scope = (String.rindex s '$') + 1 in
          let l = String.length s in
          LDepend (scope,int_of_string (String.sub s scope (l - scope)))
      | rdotdotdot      -> L3D
      | rundf           -> LUndf
      | rvoid           -> LVoid
      | rnull           -> LNull
      | rtop            -> LTop
      | floating        -> LSingleFloat (float_of_string (Ulexing.utf8_lexeme lexbuf))
      | digit+          -> LSingleInteger (int_of_string (Ulexing.utf8_lexeme lexbuf))
      | string          -> 
          let s = Ulexing.utf8_lexeme lexbuf in
          let s = String.sub s 1 (String.length s - 2) in
          let s = String.escaped s in
          LSingleString s
      | rtrue           -> Ltrue
      | rfalse          -> Lfalse
      | rbool           -> LBool
      | rint            -> LInteger
      | rlparan         -> LPARAN
      | rrparan         -> RPARAN
      | rlbraket        -> LBRAKET
      | rrbraket        -> RBRAKET
      | rstar           -> LSTAR
      | rarrow          -> LARROW
      | rcolon          -> LCOLON
      | rcomma          -> LCOMMA
      | rsemicolon      -> LSEMICOLON
      | rstring         -> LString
      | rfloat          -> LFloat
      | rat             -> LAT
      | rnconstants     -> LNConstants
      | rsconstants     -> LSConstants
      | rlabels         -> LLabels
      | rlbrace         -> LLBRACE
      | rrbrace         -> LRBRACE
      | robject         -> LObject
      | jsident         -> 
          let s = Ulexing.utf8_lexeme lexbuf in
          let l = String.length s in
          LJSIdent (String.sub s 3 (l - 3)) 
      | customcontract ->
          let s = Ulexing.utf8_lexeme lexbuf in
          let l = String.length s in
          LCustomContract (String.sub s 3 (l - 3)) 
      | rbar            -> LBAR
      | rdot            -> LDOT
      | rid             -> LId
      | rnotest         -> LNoTests
      | rnoasserts      -> LNoAsserts
      | rnoeffects      -> LNoEffects
      | reffects        -> LEffects
      | rthis           -> LThis
      | rwith           -> LWith
      | rquestionmark   -> LQUESTION
      | rnatural        -> LNatural
      | rlength         -> LLength
      | ror             -> LUnion  
      | re_literal      -> 
          LRegEx (Ulexing.utf8_lexeme lexbuf)            
      | identifier      -> 
          let s = Ulexing.utf8_lexeme lexbuf in
          LIdentifier s
      | rnbtest         -> 
          let s = Ulexing.utf8_lexeme lexbuf in
          let l = String.length s in
          LNumberTests  (int_of_string (String.sub s 7 (l - 7)))
      | "*"+ "/"        -> 
          left_read := false;
          LEOF
      | "*"+ "/" eof    -> 
          left_read := false;
          LEOF
            
    in
      if (!left_read) 
      then other_lexer lexbuf
      else left_lexer lexbuf
  in
    token

