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
let regexp rtop = "top" | "T" | "Top"
let regexp rid = "id" | "ID" | "Id"
let regexp robject = "Object" | "object"

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
let regexp string = '"' ([^'"']* | "\\\"") '"'
let regexp jsident = "js:" ['a'-'z' 'A'-'Z' '0'-'9' '_']* 
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

let rec token = lexer
  | left            -> token lexbuf
  | [' ' '\t' '\n'] -> token lexbuf
  | dependend       -> 
      let s = Ulexing.utf8_lexeme lexbuf in
      let scope = (String.rindex s '$') + 1 in
      let l = String.length s in
        LDepend (scope,int_of_string (String.sub s scope (l - scope)))
  | rdotdotdot      -> L3D
  | rundf           -> LUndf
  | rvoid           -> LVoid
  | rtop            -> LTop
  | floating        -> LSingleFloat (float_of_string (Ulexing.utf8_lexeme lexbuf))
  | digit+          -> LSingleInteger (int_of_string (Ulexing.utf8_lexeme lexbuf))
  | string          -> 
      let s = Ulexing.utf8_lexeme lexbuf in
      let s = String.sub s 1 (String.length s - 2) in
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
  | identifier      -> 
      let s = Ulexing.utf8_lexeme lexbuf in
        LIdentifier s
  | rnbtest         -> 
      let s = Ulexing.utf8_lexeme lexbuf in
      let l = String.length s in
        LNumberTests  (int_of_string (String.sub s 7 (l - 7)))
  | "*"+ "/"        -> LEOF
  | "*"+ "/" eof    -> LEOF
