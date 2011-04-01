(********************************)
(* Javascript Lexeme Definition *)
(*     to be used with Ulex     *)
(*  --------------------------  *)
(********************************)

open JSParse

let soa _ = "" ;; (* oder AST.soa *)

let string_of_token t =
  match t with 
    Ltrue i           -> (soa i)^"true"
  | Lfalse i          -> (soa i)^"false" 
  | Lint (i, j)       -> (soa i)^string_of_int j
  | Lfloat (i, f)     -> (soa i)^string_of_float f
  | Lchar (i, c)      -> (soa i)^"'" ^ String.make 1 c ^ "'"
  | Lstring (i, s)    -> (soa i)^"\""^s^"\""
  | Lregexp (i, s, f) -> (soa i)^"/"^s^"/"^f
  | Lident (i, s)     -> (soa i)^"IDENT:"^s
  | Lnull i           -> (soa i)^"null"

(* to be ignored *)

  | Lline_terminator i -> (soa i)^"--LINE-TERMINATOR--"
  | Lwhitespace i      -> (soa i)^"--WHITESPACE--"
  | Lcomment (i, c)    -> (soa i)^"--COMMENT--"
  | Leof i             -> (soa i)^"--EOF--"
  
(* Keywords *)

  | KWbreak i      -> (soa i)^"break"
  | KWcase i       -> (soa i)^"case"
  | KWcatch i      -> (soa i)^"catch"
  | KWcontinue i   -> (soa i)^"continue"
  | KWdefault i    -> (soa i)^"default"
  | KWdelete i     -> (soa i)^"delete"
  | KWdo i         -> (soa i)^"do"
  | KWelse i       -> (soa i)^"else"
  | KWfinally i    -> (soa i)^"finally"
  | KWfor i        -> (soa i)^"for"
  | KWfunction i   -> (soa i)^"function"
  | KWif i         -> (soa i)^"if"
  | KWin i         -> (soa i)^"in"
  | KWinstanceof i -> (soa i)^"instanceof"
  | KWnew i        -> (soa i)^"new"
  | KWreturn i     -> (soa i)^"return"
  | KWswitch i     -> (soa i)^"switch"
  | KWthis i       -> (soa i)^"this"
  | KWthrow i      -> (soa i)^"throw"
  | KWtry i        -> (soa i)^"try"
  | KWtypeof i     -> (soa i)^"typeof"
  | KWvar i        -> (soa i)^"var"
  | KWvoid i       -> (soa i)^"void"
  | KWwhile i      -> (soa i)^"while"
  | KWwith i       -> (soa i)^"with"

(* Future reserved words *)
	
  | FRWabstract i     -> (soa i)^"[[abstract]]"
  | FRWboolean i      -> (soa i)^"[[boolean]]"
  | FRWbyte i         -> (soa i)^"[[byte]]"
  | FRWchar i         -> (soa i)^"[[char]]"
  | FRWclass i        -> (soa i)^"[[class]]"
  | FRWconst i        -> (soa i)^"[[const]]"
  | FRWdebugger i     -> (soa i)^"[[debugger]]"
  | FRWenum i         -> (soa i)^"[[enum]]"
  | FRWexport i       -> (soa i)^"[[export]]"
  | FRWextends i      -> (soa i)^"[[extends]]"
  | FRWfinal i        -> (soa i)^"[[final]]"
  | FRWfloat i        -> (soa i)^"[[float]]"
  | FRWgoto i         -> (soa i)^"[[goto]]"
  | FRWimplements i   -> (soa i)^"[[implements]]"
  | FRWint i          -> (soa i)^"[[int]]"
  | FRWinterface i    -> (soa i)^"[[interface]]"
  | FRWlong i         -> (soa i)^"[[long]]"
  | FRWnative i       -> (soa i)^"[[native]]"
  | FRWpackage i      -> (soa i)^"[[package]]"
  | FRWprivate i      -> (soa i)^"[[private]]"
  | FRWprotected i    -> (soa i)^"[[protected]]"
  | FRWshort i        -> (soa i)^"[[short]]"
  | FRWstatic i       -> (soa i)^"[[static]]"
  | FRWsuper i        -> (soa i)^"[[super]]"
  | FRWsynchronized i -> (soa i)^"[[synchronized]]"
  | FRWthrows i       -> (soa i)^"[[throws]]"
  | FRWtransient i    -> (soa i)^"[[transient]]"
  | FRWvolatile i     -> (soa i)^"[[volatile]]"

(* strucutral information (parenthesises, comma, dot, semicolon) *)
	
  | Llparen i    -> (soa i)^"("
  | Lrparen i    -> (soa i)^")"
  | Llbrace i    -> (soa i)^"{"
  | Lrbrace i    -> (soa i)^"}"
  | Llbracket i  -> (soa i)^"["
  | Lrbracket i  -> (soa i)^"]"
  | Lsemicolon i -> (soa i)^";"
  | Lcomma i     -> (soa i)^","
  | Ldot i       -> (soa i)^"."

(* Assignments and operators *)

  | Lassign  i              -> (soa i)^"="
  | Lgreater i              -> (soa i)^">"
  | Lless    i              -> (soa i)^"<"
  | Lbang i                 -> (soa i)^"!"
  | Ltilde i                -> (soa i)^"~"
  | Lhook i                 -> (soa i)^"?"
  | Lcolon i                -> (soa i)^":"
  | Leq i                   -> (soa i)^"=="
  | Lle i                   -> (soa i)^"<="
  | Lge i                   -> (soa i)^">="
  | Lne i                   -> (soa i)^"!="
  | Leqq i                  -> (soa i)^"==="
  | Lneq i                  -> (soa i)^"!=="
  | Lsc_or i                -> (soa i)^"||"
  | Lsc_and i               -> (soa i)^"&&"
  | Lincr i                 -> (soa i)^"++"
  | Ldecr i                 -> (soa i)^"--"
  | Lplus i                 -> (soa i)^"+"
  | Lminus i                -> (soa i)^"-"
  | Lstar i                 -> (soa i)^"*"
  | Lslash i                -> (soa i)^"/"
  | Lbit_and i              -> (soa i)^"&"
  | Lbit_or i               -> (soa i)^"|"
  | Lxor i                  -> (soa i)^"^"
  | Lrem i                  -> (soa i)^"%"
  | Llshift i               -> (soa i)^"<<"
  | Lrsignedshift i         -> (soa i)^">>"
  | Lrunsignedshift i       -> (soa i)^">>>"
  | Lplusassign i           -> (soa i)^"+="
  | Lminusassign i          -> (soa i)^"-="
  | Lstarassign i           -> (soa i)^"*="
  | Lslashassign i          -> (soa i)^"/="
  | Landassign i            -> (soa i)^"&="
  | Lorassign i             -> (soa i)^"|="
  | Lxorassign i            -> (soa i)^"^="
  | Lremassign i            -> (soa i)^"%="
  | Llshiftassign i         -> (soa i)^"<<="
  | Lrsignedshiftassign i   -> (soa i)^">>="
  | Lrunsignedshiftassign i -> (soa i)^">>>="

  | Lddot i   -> (soa i)^".."
  | Lat i     -> (soa i)^"@"
  | Ldcolon i -> (soa i)^"::"

  | CKWeach i                -> (soa i)^"each"
  | CKWxml  i                -> (soa i)^"xml"
  | CKWnamespace i           -> (soa i)^"namespace"
  | CKWdefaultxmlnamespace i -> (soa i)^"default xml namespace"

  | XMLcomment (i, s)    -> (soa i)^"XML:<!-- "^s^" -->"
  | XMLcdata (i, s)      -> (soa i)^"XML:<![CDATA[ "^s^" ]]>"
  | XMLpi (i, s)         -> (soa i)^"XML:<? "^s^" ?>"
  | XMLtag_chars (i, s)  -> (soa i)^"XML:TAG:"^s
  | XMLassign i          -> (soa i)^"XML:="
  | XMLtag_close i       -> (soa i)^"XML:>"
  | XMLempty_tag_close i -> (soa i)^"XML:/>"
  | XMLattr_val (i, s)   -> (soa i)^"XML:\""^s^"\""
  | XMLwhitespace i      -> (soa i)^"XML:WHITESPACE"
  | XMLtext (i, s)       -> (soa i)^"XML:TEXT:"^s
  | XMLotag_open i       -> (soa i)^"XML:<"
  | XMLctag_open i       -> (soa i)^"XML:</"

  | LDcomment (i,s)      -> (soa i)^s
  | LInitEnd _ -> ""
  | LInitBegin _ -> ""
  | LCcomment (i,s) -> (soa i)^s

