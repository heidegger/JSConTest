(*pp camlp4o -I `ocamlfind query ulex` pa_ulex.cma *)
(********************************)
(* Javascript Lexeme Definition *)
(*     to be used with Ulex     *)
(*  --------------------------  *)
(********************************)

(*         ------------           *)
(*   Including the lexeme types   *)
(*         ------------           *)

open JSParse

(*                    ---------------------                   *)
(* Regular Expressions needed to parse syntax (and some more) *)
(*                    ---------------------                   *)

exception Eof
exception Unknown_lexeme of string

(* Input Characters *)

let regexp unicode_input_character = [0-0xffff]

(* White Space Characters*)
let regexp tab  = 0x0009
let regexp vt   = 0x000b
let regexp ff   = 0x000c
let regexp sp   = 0x0020
let regexp nbsp = 0x00a0
(* let usp = ?? -> any other unicode "space separator" *)
let regexp whitespace = (tab | vt | ff | sp | nbsp )*

(* Line Terminator Characters *)
let regexp lf = 0x000a
let regexp cr = 0x000d
let regexp ls = 0x2028
let regexp ps = 0x2029
let regexp lineterminator = (lf | cr | ls | ps)

let regexp line_terminator =
  lf | cr | cr lf
let regexp input_character =
  (* Anything but lf and cr *)
  [0-0x0009] | [0x000b-0x000c] | [0x000e-0xffff] 

let regexp not_star           =
  (* Anything but star *)
  [0-0x0029] | [0x002b-0xffff] 

let regexp not_star_not_c =
  (* Anything but star or c *)
  [0-0x0029] | [0x002b-0x0062] | [0x0064-0xffff] 


let regexp not_star_not_slash =
  (* Anything but star and slash *)
  [0-0x0029] | [0x002b-0x002e] | [0x0030-0xffff]


let regexp xml_tag_character =
  (* Anything but '"' =22, ' =27, / =2f, < =3c, = =3D , > =3E, { =7B,  *)
  (* and whitespace *)
   [0x0000-0x0008] | [0x000b-0x000b] | [0x000e-0x0019] | 
   [0x0021-0x0021] | [0x0023-0x0026] | [0x0028-0x002e] | 
   [0x0030-0x003b] | [0x003f-0x007a] | [0x007c-0xffff]

let regexp xml_data_character = 
   (* Anything but {, < *)
   [0x0000-0x003b] | [0x003d-0x007a] | [0x007c-0xffff]

let regexp unicode_letter = 
  [0x0041-0x005a] | [0x0061-0x007a] | [0x00aa-0x00aa] | [0x00b5-0x00b5] |
  [0x00ba-0x00ba] | [0x00c0-0x00d6] | [0x00d8-0x00f6] | [0x00f8-0x01f5] |
  [0x01fa-0x0217] | [0x0250-0x02a8] | [0x02b0-0x02b8] | [0x02bb-0x02c1] |
  [0x02d0-0x02d1] | [0x02e0-0x02e4] | [0x037a-0x037a] | [0x0386-0x0386] |
  [0x0388-0x038a] | [0x038c-0x038c] | [0x038e-0x03a1] | [0x03a3-0x03ce] |
  [0x03d0-0x03d6] | [0x03da-0x03da] | [0x03dc-0x03dc] | [0x03de-0x03de] |
  [0x03e0-0x03e0] | [0x03e2-0x03f3] | [0x0401-0x040c] | [0x040e-0x044f] |
  [0x0451-0x045c] | [0x045e-0x0481] | [0x0490-0x04c4] | [0x04c7-0x04c8] |
  [0x04cb-0x04cc] | [0x04d0-0x04eb] | [0x04ee-0x04f5] | [0x04f8-0x04f9] |
  [0x0531-0x0556] | [0x0559-0x0559] | [0x0561-0x0587] | [0x05d0-0x05ea] |
  [0x05f0-0x05f2] | [0x0621-0x063a] | [0x0640-0x064a] | [0x0671-0x06b7] |
  [0x06ba-0x06be] | [0x06c0-0x06ce] | [0x06d0-0x06d3] | [0x06d5-0x06d5] |
  [0x06e5-0x06e6] | [0x0905-0x0939] | [0x093d-0x093d] | [0x0958-0x0961] |
  [0x0985-0x098c] | [0x098f-0x0990] | [0x0993-0x09a8] | [0x09aa-0x09b0] |
  [0x09b2-0x09b2] | [0x09b6-0x09b9] | [0x09dc-0x09dd] | [0x09df-0x09e1] |
  [0x09f0-0x09f1] | [0x0a05-0x0a0a] | [0x0a0f-0x0a10] | [0x0a13-0x0a28] |
  [0x0a2a-0x0a30] | [0x0a32-0x0a33] | [0x0a35-0x0a36] | [0x0a38-0x0a39] |
  [0x0a59-0x0a5c] | [0x0a5e-0x0a5e] | [0x0a72-0x0a74] | [0x0a85-0x0a8b] |
  [0x0a8d-0x0a8d] | [0x0a8f-0x0a91] | [0x0a93-0x0aa8] | [0x0aaa-0x0ab0] |
  [0x0ab2-0x0ab3] | [0x0ab5-0x0ab9] | [0x0abd-0x0abd] | [0x0ae0-0x0ae0] |
  [0x0b05-0x0b0c] | [0x0b0f-0x0b10] | [0x0b13-0x0b28] | [0x0b2a-0x0b30] |
  [0x0b32-0x0b33] | [0x0b36-0x0b39] | [0x0b3d-0x0b3d] | [0x0b5c-0x0b5d] |
  [0x0b5f-0x0b61] | [0x0b85-0x0b8a] | [0x0b8e-0x0b90] | [0x0b92-0x0b95] |
  [0x0b99-0x0b9a] | [0x0b9c-0x0b9c] | [0x0b9e-0x0b9f] | [0x0ba3-0x0ba4] |
  [0x0ba8-0x0baa] | [0x0bae-0x0bb5] | [0x0bb7-0x0bb9] | [0x0c05-0x0c0c] |
  [0x0c0e-0x0c10] | [0x0c12-0x0c28] | [0x0c2a-0x0c33] | [0x0c35-0x0c39] |
  [0x0c60-0x0c61] | [0x0c85-0x0c8c] | [0x0c8e-0x0c90] | [0x0c92-0x0ca8] |
  [0x0caa-0x0cb3] | [0x0cb5-0x0cb9] | [0x0cde-0x0cde] | [0x0ce0-0x0ce1] |
  [0x0d05-0x0d0c] | [0x0d0e-0x0d10] | [0x0d12-0x0d28] | [0x0d2a-0x0d39] |
  [0x0d60-0x0d61] | [0x0e01-0x0e2e] | [0x0e30-0x0e30] | [0x0e32-0x0e33] |
  [0x0e40-0x0e46] | [0x0e81-0x0e82] | [0x0e84-0x0e84] | [0x0e87-0x0e88] |
  [0x0e8a-0x0e8a] | [0x0e8d-0x0e8d] | [0x0e94-0x0e97] | [0x0e99-0x0e9f] |
  [0x0ea1-0x0ea3] | [0x0ea5-0x0ea5] | [0x0ea7-0x0ea7] | [0x0eaa-0x0eab] |
  [0x0ead-0x0eae] | [0x0eb0-0x0eb0] | [0x0eb2-0x0eb3] | [0x0ebd-0x0ebd] |
  [0x0ec0-0x0ec4] | [0x0ec6-0x0ec6] | [0x0edc-0x0edd] | [0x0f40-0x0f47] |
  [0x0f49-0x0f69] | [0x10a0-0x10c5] | [0x10d0-0x10f6] | [0x1100-0x1159] |
  [0x115f-0x11a2] | [0x11a8-0x11f9] | [0x1e00-0x1e9b] | [0x1ea0-0x1ef9] |
  [0x1f00-0x1f15] | [0x1f18-0x1f1d] | [0x1f20-0x1f45] | [0x1f48-0x1f4d] |
  [0x1f50-0x1f57] | [0x1f59-0x1f59] | [0x1f5b-0x1f5b] | [0x1f5d-0x1f5d] |
  [0x1f5f-0x1f7d] | [0x1f80-0x1fb4] | [0x1fb6-0x1fbc] | [0x1fbe-0x1fbe] |
  [0x1fc2-0x1fc4] | [0x1fc6-0x1fcc] | [0x1fd0-0x1fd3] | [0x1fd6-0x1fdb] |
  [0x1fe0-0x1fec] | [0x1ff2-0x1ff4] | [0x1ff6-0x1ffc] | [0x207f-0x207f] |
  [0x2102-0x2102] | [0x2107-0x2107] | [0x210a-0x2113] | [0x2115-0x2115] |
  [0x2118-0x211d] | [0x2124-0x2124] | [0x2126-0x2126] | [0x2128-0x2128] |
  [0x212a-0x2131] | [0x2133-0x2138] | [0x3005-0x3005] | [0x3031-0x3035] |
  [0x3041-0x3094] | [0x309b-0x309e] | [0x30a1-0x30fa] | [0x30fc-0x30fe] |
  [0x3105-0x312c] | [0x3131-0x318e] | [0x4e00-0x9fa5] | [0xac00-0xd7a3] |
  [0xf900-0xfa2d] | [0xfb00-0xfb06] | [0xfb13-0xfb17] | [0xfb1f-0xfb28] |
  [0xfb2a-0xfb36] | [0xfb38-0xfb3c] | [0xfb3e-0xfb3e] | [0xfb40-0xfb41] |
  [0xfb43-0xfb44] | [0xfb46-0xfbb1] | [0xfbd3-0xfd3d] | [0xfd50-0xfd8f] |
  [0xfd92-0xfdc7] | [0xfdf0-0xfdfb] | [0xfe70-0xfe72] | [0xfe74-0xfe74] |
  [0xfe76-0xfefc] | [0xff21-0xff3a] | [0xff41-0xff5a] | [0xff66-0xffbe] |
  [0xffc2-0xffc7] | [0xffca-0xffcf] | [0xffd2-0xffd7] | [0xffda-0xffdc]

let regexp unicode_digit =
  [0x0030-0x0039] | [0x0660-0x0669] | [0x06f0-0x06f9] | [0x0966-0x096f] |
  [0x09e6-0x09ef] | [0x0a66-0x0a6f] | [0x0ae6-0x0aef] | [0x0b66-0x0b6f] |
  [0x0be7-0x0bef] | [0x0c66-0x0c6f] | [0x0ce6-0x0cef] | [0x0d66-0x0d6f] |
  [0x0e50-0x0e59] | [0x0ed0-0x0ed9] | [0x0f20-0x0f29] | [0xff10-0xff19]

let regexp java_letter =
  unicode_letter | '$' | '_'
let regexp java_letter_or_digit =
  unicode_letter | unicode_digit | '$' | '_'
  
(* Basis for Numbers *)

let regexp non_zero_digit = ['1'-'9']
let regexp digit          = ['0'-'9']
let regexp hex_digit      = ['0'-'9'] | ['a'-'f'] | ['A'-'F']
let regexp octal_digit    = ['0'-'7']
let regexp zero_to_three  = ['0'-'3']
    
let regexp decimal_numeral = '0' | non_zero_digit digit*
let regexp hex_numeral     = '0' ('x' | 'X') hex_digit+
let regexp octal_numeral   = '0' octal_digit+
    
let regexp integer_type_suffix = 'l' | 'L'

let regexp exponent_part       = ('e' | 'E') ('+' | '-')? digit+
    
let regexp float_type_suffix   = 'f' | 'F' | 'd' | 'D'

let regexp single_character =
  (* Anything but quote and backslash *)
  [0-0x0026] | [0x0028-0x005b] | [0x005d-0xffff]
  
let regexp octal_escape =
  "\\" (octal_digit octal_digit? | zero_to_three octal_digit octal_digit) 
let regexp escape_sequence = 
  "\\b" | "\\t" | "\\n" | "\\f" | "\\r" |
  "\\\"" | "\\" "'" | "\\\\" | octal_escape
let regexp re_escape_sequence =
  "\\" "/" | escape_sequence
let regexp double_string_character =
  (* Anything but doublequote and backslash (but with escape_sequences) *)
  [0-0x0021] | [0x0023-0x005b] | [0x005d-0xffff] | escape_sequence
  
let regexp single_string_character =
  (* Anything but singlequote and backslash (but with escape_sequences) *)
  [0-0x0026] | [0x0028-0x005b] | [0x005d-0xffff] | escape_sequence
  
let regexp re_character     =
  (* Anything but slash and backslash (but with escape_sequences) *)
  [0-0x002e] | [0x0030-0x005b] | [0x005d-0xffff] | re_escape_sequence
  
(* ignorable Stuff *)
let regexp traditional_comment =
  "/*" not_star_not_c+ "*"+ (not_star_not_slash not_star* "*"+)* '/'
let regexp documentation_comment =
  "/**" "*"* (not_star_not_slash not_star* "*"+)* '/'
let regexp contract_comment =
  "/*c" "*"* (not_star_not_slash not_star* "*"+)* '/'
let regexp documentation_comment_init_begin = "/** CONTRACT INIT BEGIN */"
let regexp documentation_comment_init_end = "/** CONTRACT INIT END */"
let regexp end_of_line_comment =
  "//" input_character* line_terminator

(* Keywords *)

let regexp kw_this       = "this"
    
(* Future reserved Words  (now in get identifier function) *)

(* Literals *)

let regexp bl_true  = "true"
let regexp bl_false = "false"

let regexp nl_null  = "null"
	
let regexp decimal_integer_literal =
  decimal_numeral integer_type_suffix?
let regexp hex_integer_literal =
  hex_numeral integer_type_suffix?
let regexp octal_integer_literal =
  octal_numeral integer_type_suffix?
    
let regexp floating_point_literal =
    digit+ "." digit* exponent_part? float_type_suffix? 
  | "." digit+ exponent_part? float_type_suffix?
  | digit+ exponent_part float_type_suffix? 
  | digit+ exponent_part? float_type_suffix
    
let regexp double_string_literal =
  '"' double_string_character* '"'
let regexp single_string_literal =
  "'" single_string_character* "'"
let regexp string_literal =
    double_string_literal
  | single_string_literal
let regexp identifier =
  java_letter java_letter_or_digit*
let regexp re_literal =
  '/' re_character* '/' identifier | '/' re_character* '/'

(* Brackets and Stuff *)

let regexp lparen    = '('
let regexp rparen    = ')'
let regexp lbrace    = '{'
let regexp rbrace    = '}'
let regexp lbracket  = '['
let regexp rbracket  = ']'
let regexp semicolon = ';'
let regexp comma     = ','
let regexp dot       = '.'

(* Operators and Assignments *)

let regexp assign               = "="        
let regexp gt                   = ">"
let regexp lt                   = "<"
let regexp bang                 = "!"
let regexp tilde                = "~"
let regexp hook                 = "?"
let regexp colon                = ":"
let regexp eq                   = "=="
let regexp le                   = "<="
let regexp ge                   = ">="
let regexp ne                   = "!="
let regexp eqq                  = "==="
let regexp neq                  = "!=="
let regexp sc_or                = "||"
let regexp sc_and               = "&&"
let regexp incr                 = "++"
let regexp decr                 = "--"
let regexp plus                 = "+"
let regexp minus                = "-"
let regexp star                 = "*"
let regexp slash                = "/"
let regexp bit_and              = "&"
let regexp bit_or               = "|"
let regexp xor                  = "^" 
let regexp rem                  = "%"
let regexp lshift               = "<<"
let regexp rsignedshift         = ">>"
let regexp runsignedshift       = ">>>"
let regexp plusassign           = "+="
let regexp minusassign          = "-="
let regexp starassign           = "*="
let regexp slashassign          = "/="
let regexp andassign            = "&="
let regexp orassign             = "|="
let regexp xorassign            = "^="
let regexp remassign            = "%="
let regexp lshiftassign         = "<<="
let regexp rsignedshiftassign   = ">>="
let regexp runsignedshiftassign = ">>>="

(* Ignored Tokens *)

let regexp ignoredTokens =
    whitespace 
  | traditional_comment 
  | documentation_comment
  | end_of_line_comment

(* XML Zeug *)

let regexp xml_whitespace_character = (sp | tab | cr | lf)
let regexp xml_whitespace = xml_whitespace_character*

let regexp xml_empty_tag_close = "/>"

let regexp ctag_open = "</"

let regexp xml_tag_characters = xml_tag_character*
let regexp xml_data_characters = xml_data_character*

let regexp xml_comment_characters = (("-")?  [^'-'])*
let regexp xml_comment =  "<!--" xml_comment_characters  "-->"

let regexp xml_pi_characters = 
  ( [^"?"]* '?'+ [^"?>"]+ | [^"?"]* )* '?'*   

let regexp default_xml_namespace = "default xml namespace" 

let regexp xml_pi = "<?" xml_pi_characters "?>"

let regexp xml_cdata_characters = 
  ( "]]" [^'>']
  | ']' [^']']
  | [^']'] 
   )*
let regexp xml_cdata = "<![CDATA[" xml_cdata_characters "]]>"

(* Punctuators 8.2 *)

let regexp ddot = ".."
let regexp at = "@"
let regexp dcolon  = "::"


(* Stack implementation (should be not at top level) *)
type xmlContext = XMLTag | XMLData | RegEx | DivMode

(* Function to return a String with the mode *)
let xmlContext_to_string context = 
  match context with
    XMLTag -> "XMLTag"
  | XMLData -> "XMLData"
  | RegEx -> "RegEx"
  | DivMode -> "DivMode"

(* Funktion zur Ausgabe des Stacks. *) 
let rec string_from_contextStack xmlContext_to_string stack =
  let tmp = Stack.copy stack in
  if (Stack.is_empty stack)
  then
    print_string "[]: "
  else
    let top = Stack.pop tmp in
    
    print_string ("["^(xmlContext_to_string top)^"], ");
    string_from_contextStack xmlContext_to_string tmp

(* Verkuerzte Funktion. *) 
let print_stack s = string_from_contextStack xmlContext_to_string s


(* Helper function to avoid warning when popping from Stack. *)
(* It pops from the Stack and returns unit. *)
let stack_pop s = 
  let _ = Stack.pop s in
  ()


(* If we find an identifier this function finds out *)
(* whether it was a keyword,... or just normal identifier. *)

let get_identifier ln buf = 
  let regex rbuf = buf in
    match buf with
        (* Keywords *)
      | "break"      -> KWbreak ln
      | "case"       -> KWcase ln
      | "catch"      -> KWcatch ln
      | "continue"   -> KWcontinue ln
      | "default"    -> KWdefault ln
      | "delete"     -> KWdelete ln
      | "do"         -> KWdo ln
      | "else"       -> KWelse ln
      | "finally"    -> KWfinally ln
      | "for"        -> KWfor ln
      | "function"   -> KWfunction ln
      | "if"         -> KWif ln
      | "in"         -> KWin ln
      | "instanceof" -> KWinstanceof ln
      | "new"        -> KWnew ln
      | "return"     -> KWreturn ln
      | "switch"     -> KWswitch ln
          (* 'this' is special because we need to do some action. *)
          (* That's why it does not appear here. *)
      | "throw"      -> KWthrow ln
      | "try"        -> KWtry ln
      | "typeof"     -> KWtypeof ln
      | "var"        -> KWvar ln
      | "void"       -> KWvoid ln
      | "while"      -> KWwhile ln
      | "with"       -> KWwith ln
          
	  (* Future reserved words *)
      | "abstract"     -> FRWabstract ln
      | "boolean"      -> FRWboolean ln
      | "byte"         -> FRWbyte ln
      | "char"         -> FRWchar ln
      | "class"        -> FRWclass ln
      | "const"        -> FRWconst ln
      | "debugger"     -> FRWdebugger ln
      | "enum"         -> FRWenum ln
      | "export"       -> FRWexport ln
      | "extends"      -> FRWextends ln
      | "final"        -> FRWfinal ln
      | "float"        -> FRWfloat ln
      | "goto"         -> FRWgoto ln
      | "implements"   -> FRWimplements ln
      | "int"          -> FRWint ln
      | "interface"    -> FRWinterface ln
      | "long"         -> FRWlong ln
      | "native"       -> FRWnative ln
      | "package"      -> FRWpackage ln
      | "private"      -> FRWprivate ln
      | "protected"    -> FRWprotected ln
      | "short"        -> FRWshort ln
      | "static"       -> FRWstatic ln
      | "super"        -> FRWsuper ln
      | "synchronized" -> FRWsynchronized ln
      | "throws"       -> FRWthrows ln
      | "transient"    -> FRWtransient ln
      | "volatile"     -> FRWvolatile ln
          
      (* XML Keywords 8.1 *)
      (*   | "xml"          -> CKWxml *)
      (*   | "namespace"    -> CKWnamespace *)
      (*   | "each"         -> CKWeach  *)
          
      | _ -> Lident (ln, buf)



(*                 -----------------                     *)
(* The real lexing function, the fellowing does the work *)
(*                 -----------------                     *)
let (mainlexer) =
  (* Create Stack *)
  let s = Stack.create () in 
    (* Initialize Stack with RegEx because this is our starting mode. *)
    Stack.push RegEx s;
    let ml lexbuf ann =
      let set_ending = Annotation.set_ending (LexingOwn.lexeme_length lexbuf) in
      let rec xml_tag_lexer = lexer
        eof -> Leof (set_ending ann)
          
       (* Ignorables *)
       | xml_whitespace          -> XMLwhitespace (set_ending ann)
             
       (* Brackets *)
       | lbrace               -> Stack.push RegEx s; 
           Llbrace (set_ending  ann)
             
	   (* Assignments and operators*)
       | assign               ->  XMLassign 
           (set_ending  ann)
       | gt                   -> stack_pop s; 
           XMLtag_close (set_ending  ann)
       | xml_empty_tag_close      -> stack_pop s; 
	       stack_pop s; stack_pop s; XMLempty_tag_close 
             (set_ending ann);
	       (* Literals *)
       | string_literal       ->
	       let 
	           s = (Ulexing.utf8_lexeme lexbuf)
	       in
	         XMLattr_val 
               ((set_ending ann,(String.sub s 1 ((String.length s) - 2))))
	           (* tags *)
       | xml_tag_characters              -> 
	       XMLtag_chars ((set_ending ann), (Ulexing.utf8_lexeme lexbuf))
	         (* error *)
       | _            -> raise (Unknown_lexeme 
			                       (Ulexing.utf8_lexeme lexbuf))
           
      and xml_data_lexer = lexer
        | eof -> Leof (set_ending ann)
          
	    (* Ignorables, for better view (should be removed) *)
        | xml_comment           -> 
	        let s = (Ulexing.utf8_lexeme lexbuf) in 
	          XMLcomment ((set_ending ann), 
                          (String.sub s 4 ((String.length s) - 7)))
              
        | xml_pi                -> 
	        let s = (Ulexing.utf8_lexeme lexbuf) in 
	          XMLpi ((set_ending ann), (String.sub s 2 ((String.length s) - 4)))
              
        | xml_cdata             ->
	        let s = (Ulexing.utf8_lexeme lexbuf) in 
	          XMLcdata ((set_ending ann), 
                        (String.sub s 9 ((String.length s) -12)))
              
        | xml_whitespace        -> XMLwhitespace (set_ending ann)
          
	    (* Brackets, <, </ *)
        | lbrace      -> Stack.push RegEx s; Llbrace (set_ending ann)
        | lt (* < *)  -> Stack.push XMLTag s;
	        Stack.push XMLData s; Stack.push XMLTag s;
	        XMLotag_open (set_ending ann);

        (* </ close Tag open *)
        | ctag_open   -> stack_pop s; XMLctag_open (set_ending ann)
            
          
	    (* XML Data *)
        | xml_data_characters              -> 
	        XMLtext ((set_ending ann), (Ulexing.utf8_lexeme lexbuf))
        | _  -> raise (Unknown_lexeme (Ulexing.utf8_lexeme lexbuf))
          
          
(* Bei folgenden Tokens muss in den DIV Mode geschaltet werden: *)
(* +, -, ), this, Litaral, ], }, Identifer *)

    and java_regex = lexer
      | eof -> Leof (set_ending ann)
          
	  (* Ignorables *)
      | whitespace            -> Lwhitespace (set_ending ann)
      | line_terminator       -> Lline_terminator (set_ending ann)
      | traditional_comment   -> 
          Lcomment ((set_ending ann), (Ulexing.utf8_lexeme lexbuf))
      | documentation_comment_init_begin ->
          LInitBegin (set_ending ann)
      | documentation_comment_init_end ->
          LInitEnd (set_ending ann)
      | documentation_comment -> 
          LDcomment ((set_ending ann), (Ulexing.utf8_lexeme lexbuf))
      | contract_comment -> 
          LCcomment ((set_ending ann), (Ulexing.utf8_lexeme lexbuf))
      | end_of_line_comment   -> 
          Lcomment ((set_ending ann), (Ulexing.utf8_lexeme lexbuf))
          
	  (* Keyword 'this' *)
      | kw_this       -> Stack.push DivMode s; KWthis (set_ending ann)
	      
	  (* XML Tag start *)
      | lt                    -> Stack.push DivMode s; Stack.push XMLTag s;
	      Stack.push XMLData s; Stack.push XMLTag s;
          XMLotag_open (set_ending ann)
            
      | xml_comment           -> 
	      let s = (Ulexing.utf8_lexeme lexbuf) in 
	        XMLcomment ((set_ending ann), 
                       (String.sub s 4 ((String.length s) - 7)))
              
      | xml_pi                -> 
	      let s = (Ulexing.utf8_lexeme lexbuf) in 
	        XMLpi ((set_ending ann), (String.sub s 2 ((String.length s) - 4)))
              
      | xml_cdata             ->
	      let s = (Ulexing.utf8_lexeme lexbuf) in 
	        XMLcdata ((set_ending ann), 
                     (String.sub s 9 ((String.length s) -12)))
      | default_xml_namespace -> CKWdefaultxmlnamespace (set_ending ann)
          
      (*  | regexpflag            -> Lregexpflag (Ulexing.utf8_lexeme l) *)
      | re_literal            ->
	      let 
	          s = (Ulexing.utf8_lexeme lexbuf)
	      in
            Lregexp ((set_ending ann), String.sub s 1 ((String.length s)-1), "")
      | slash                 -> stack_pop s; 
          Lstring ((set_ending ann), "REGEX: Slash")
          
	  (* Brackets and Stuff *)
      | lparen    -> Llparen (set_ending ann) 
      | rparen    -> Stack.push DivMode s; Lrparen (set_ending ann)
      | lbrace    -> Stack.push DivMode s; Stack.push RegEx s; 
          Llbrace (set_ending ann)
      | rbrace    -> stack_pop s; Lrbrace (set_ending ann)
      | lbracket  -> Llbracket (set_ending ann)
      | rbracket  -> Stack.push DivMode s; Lrbracket (set_ending ann)
      | semicolon -> Lsemicolon (set_ending ann)
      | comma     -> Lcomma (set_ending ann)
      | dot       -> Ldot (set_ending ann)
          
	  (* Punctuator Extension for E4X *)
      | ddot      -> Lddot (set_ending ann)
      | at        -> Lat (set_ending ann)
      | dcolon    -> Ldcolon (set_ending ann)
 
	  (* Assignments and operators*)
      | assign               -> Lassign (set_ending ann)
      | gt                   -> Lgreater (set_ending ann)
      | bang                 -> Lbang (set_ending ann)
      | tilde                -> Ltilde (set_ending ann)
      | hook                 -> Lhook (set_ending ann)
      | colon                -> Lcolon (set_ending ann)
      | eq                   -> Leq (set_ending ann)
      | le                   -> Lle (set_ending ann)
      | ge                   -> Lge (set_ending ann)
      | ne                   -> Lne (set_ending ann)
      | eqq                  -> Leqq (set_ending ann)
      | neq                  -> Lneq (set_ending ann)
      | sc_or                -> Lsc_or (set_ending ann)
      | sc_and               -> Lsc_and (set_ending ann)
      | incr                 -> Stack.push DivMode s; Lincr (set_ending ann)
      | decr                 -> Stack.push DivMode s; Ldecr (set_ending ann)
      | plus                 -> Lplus (set_ending ann)
      | minus                -> Lminus (set_ending ann)
      | star                 -> Lstar (set_ending ann)
      | bit_and              -> Lbit_and (set_ending ann)
      | bit_or               -> Lbit_or (set_ending ann)
      | xor                  -> Lxor (set_ending ann)
      | rem                  -> Lrem (set_ending ann)
      | lshift               -> Llshift (set_ending ann)
      | rsignedshift         -> Lrsignedshift (set_ending ann)
      | runsignedshift       -> Lrunsignedshift (set_ending ann)
      | plusassign           -> Lplusassign (set_ending ann)
      | minusassign          -> Lminusassign (set_ending ann)
      | starassign           -> Lstarassign (set_ending ann)
      | slashassign          -> Lslashassign (set_ending ann)
      | andassign            -> Landassign (set_ending ann)
      | orassign             -> Lorassign (set_ending ann)
      | xorassign            -> Lxorassign (set_ending ann)
      | remassign            -> Lremassign (set_ending ann)
      | lshiftassign         -> Llshiftassign (set_ending ann)
      | rsignedshiftassign   -> Lrsignedshiftassign (set_ending ann)
      | runsignedshiftassign -> Lrunsignedshiftassign (set_ending ann)
          
      (* Literals *)
      | bl_true                 -> Stack.push DivMode s; Ltrue (set_ending ann)
      | bl_false                -> Stack.push DivMode s; Lfalse (set_ending ann)
      | nl_null                 -> Stack.push DivMode s; Lnull (set_ending ann)
      | decimal_integer_literal -> Stack.push DivMode s; 
	      Lint ((set_ending ann), (int_of_string (Ulexing.utf8_lexeme lexbuf)))
      | hex_integer_literal     -> Stack.push DivMode s; 
	      Lint ((set_ending ann), (int_of_string (Ulexing.utf8_lexeme lexbuf)))
      | octal_integer_literal   -> Stack.push DivMode s; 
	      Lint ((set_ending ann), (int_of_string (Ulexing.utf8_lexeme lexbuf)))
      | floating_point_literal  -> Stack.push DivMode s; 
	      Lfloat ((set_ending ann), (float_of_string 
                                        (Ulexing.utf8_lexeme lexbuf)))
      | string_literal          -> Stack.push DivMode s; 
	      let 
	          s = (Ulexing.utf8_lexeme lexbuf)
	      in
            Lstring ((set_ending ann), (String.sub s 1 ((String.length s) - 2)))
      | identifier              -> 	      
	      (* Look up which token we lexed: *)
	      (let token = get_identifier 
            (set_ending ann) 
            (Ulexing.utf8_lexeme lexbuf) 
            in
	         match token with
	             (* If it was a real identifier then push DivMode. *)
	             Lident (ln, _) -> Stack.push DivMode s; token
	           | _ -> token
	      )
      | _                       -> 
	      raise (Unknown_lexeme (Ulexing.utf8_lexeme lexbuf))

(* Es werden im Div Mode natuerlich die /, =/ nicht als Start eines *)
(* regularen Ausdrucks gelexet. *)
(* Da nun aber in mainlexer der Stack schon gepoped wurde, bleibt mit *)
(* dem Stack nix zu tun, außer wir lesen ne {, }. *)
    and java_div = lexer
      | eof -> Leof (set_ending ann)

	  (* Ignorables *)
      | whitespace            -> Stack.push DivMode s; 
          Lwhitespace (set_ending ann)
      | line_terminator       -> Stack.push DivMode s;
          Lline_terminator (set_ending ann)
        
      | traditional_comment   -> 
          Lcomment ((set_ending ann), (Ulexing.utf8_lexeme lexbuf))
      | documentation_comment_init_begin ->
          LInitBegin (set_ending ann)
      | documentation_comment_init_end ->
          LInitEnd (set_ending ann)
      | documentation_comment -> 
          LDcomment ((set_ending ann), (Ulexing.utf8_lexeme lexbuf))
      | contract_comment -> 
          LCcomment ((set_ending ann), (Ulexing.utf8_lexeme lexbuf))
      | end_of_line_comment   -> 
          Lcomment ((set_ending ann), (Ulexing.utf8_lexeme lexbuf))
            
	  (* Division, bzw. kleiner *)
      | lt                    -> Lless (set_ending ann)
      | slash                 -> Lslash (set_ending ann)
          
	  (* Keywords *)
      | kw_this       -> KWthis (set_ending ann)
          
	  (* Brackets and Stuff *)
      | lparen    -> Llparen (set_ending ann)
      | rparen    -> Stack.push DivMode s; Lrparen (set_ending ann)
      | lbrace    -> Stack.push DivMode s; Stack.push RegEx s; 
          Llbrace (set_ending ann)
      | rbrace    -> stack_pop s; Lrbrace (set_ending ann)
      | lbracket  -> Llbracket (set_ending ann)
      | rbracket  -> Stack.push DivMode s; Lrbracket (set_ending ann)
      | semicolon -> Lsemicolon (set_ending ann)
      | comma     -> Lcomma (set_ending ann)
      | dot       -> Ldot (set_ending ann)
          
	  (* Punctuator Extension for E4X *)
      | ddot      -> Lddot (set_ending ann)
      | at        -> Lat (set_ending ann)
      | dcolon    -> Ldcolon (set_ending ann)
          
	  (* Assignments and operators*)
      | assign               -> Lassign (set_ending ann)
      | gt                   -> Lgreater (set_ending ann)
      | bang                 -> Lbang (set_ending ann)
      | tilde                -> Ltilde (set_ending ann)
      | hook                 -> Lhook (set_ending ann)
      | colon                -> Lcolon (set_ending ann)
      | eq                   -> Leq (set_ending ann)
      | le                   -> Lle (set_ending ann)
      | ge                   -> Lge (set_ending ann)
      | ne                   -> Lne (set_ending ann)
      | eqq                  -> Leqq (set_ending ann)
      | neq                  -> Lneq (set_ending ann)
      | sc_or                -> Lsc_or (set_ending ann)
      | sc_and               -> Lsc_and (set_ending ann)
      | incr                 -> 
	(* after the incr, we still are in div mode *)
	Stack.push DivMode s; Lincr (set_ending ann)
      | decr                 -> 
	(* after the decr, we still are in div mode *)
	Stack.push DivMode s; Ldecr (set_ending ann)
      | plus                 -> Lplus (set_ending ann)
      | minus                -> Lminus (set_ending ann)
      | star                 -> Lstar (set_ending ann)
      | bit_and              -> Lbit_and (set_ending ann)
      | bit_or               -> Lbit_or (set_ending ann)
      | xor                  -> Lxor (set_ending ann)
      | rem                  -> Lrem (set_ending ann)
      | lshift               -> Llshift (set_ending ann)
      | rsignedshift         -> Lrsignedshift (set_ending ann)
      | runsignedshift       -> Lrunsignedshift (set_ending ann)
      | plusassign           -> Lplusassign (set_ending ann)
      | minusassign          -> Lminusassign (set_ending ann)
      | starassign           -> Lstarassign (set_ending ann)
      | slashassign          -> Lslashassign (set_ending ann)
      | andassign            -> Landassign (set_ending ann)
      | orassign             -> Lorassign (set_ending ann)
      | xorassign            -> Lxorassign (set_ending ann)
      | remassign            -> Lremassign (set_ending ann)
      | lshiftassign         -> Llshiftassign (set_ending ann)
      | rsignedshiftassign   -> Lrsignedshiftassign (set_ending ann)
      | runsignedshiftassign -> Lrunsignedshiftassign (set_ending ann)
          
      (* Literals *)
      | bl_true                 -> Ltrue (set_ending ann)
      | bl_false                -> Lfalse (set_ending ann)
      | nl_null                 -> Lnull (set_ending ann)
      | decimal_integer_literal -> 
	      Lint ((set_ending ann), (int_of_string (Ulexing.utf8_lexeme lexbuf)))
      | hex_integer_literal     -> 
	      Lint ((set_ending ann), (int_of_string (Ulexing.utf8_lexeme lexbuf)))
      | octal_integer_literal   -> 
	      Lint ((set_ending ann), (int_of_string (Ulexing.utf8_lexeme lexbuf)))
      | floating_point_literal  -> 
	      Lfloat ((set_ending ann), 
                 (float_of_string (Ulexing.utf8_lexeme lexbuf)))
      | string_literal          ->
	      let 
	          s = (Ulexing.utf8_lexeme lexbuf)
	      in
            Lstring ((set_ending ann), (String.sub s 1 ((String.length s) - 2)))
      | identifier              -> 
          get_identifier (set_ending ann) (Ulexing.utf8_lexeme lexbuf)
      | _                       -> 
	      raise (Unknown_lexeme (Ulexing.utf8_lexeme lexbuf))
            
            
      in  
        match Stack.top s with
            XMLTag  -> 
		if (Etc.get_print_tokens ()) then begin
 	          print_string("Tag:"); 
		  print_stack s;  
		end;              	
		xml_tag_lexer lexbuf
          | XMLData ->   
		if (Etc.get_print_tokens ()) then begin
 	          print_string("Data:"); 
		  print_stack s;  
		end;              	
              xml_data_lexer lexbuf
          | RegEx -> 
		if (Etc.get_print_tokens ()) then begin
 	          print_string("Reg:"); 
		  print_stack s;  
		end;              	
              java_regex lexbuf
          | DivMode -> 
		if (Etc.get_print_tokens ()) then begin
 	          print_string("Div:"); 
		  print_stack s;  
		end;
              stack_pop s; java_div lexbuf
    in 
      
(* zum debuggen alle tokens rausschreiben ... *) 
   
   (fun lexbuf ln -> 
	let x = ml lexbuf ln in 
  	  if (Etc.get_print_tokens ()) then
  	    print_endline (PrettyToken.string_of_token x) ; 
	  x)

