(** The JavaScript AST *)

open Annotation

type constant = 
  | Number of annotation * float
  | String of annotation * string
  | True of annotation 
  | False of annotation 
  | Undefined of annotation 
  | Null of annotation 
type assignment_operator =
    Regular_assign  of annotation         (* = *)
  | Star_assign of annotation             (* *= *)
  | Slash_assign of annotation            (* /= *)
  | Rem_assign  of annotation             (* %= *)
  | Plus_assign  of annotation            (* += *)
  | Minus_assign  of annotation           (* -= *)
  | Lshift_assign  of annotation          (* <<= *)
  | Rsignedshift_assign of annotation     (* >>= *)
  | Runsignedshift_assign of annotation   (* >>>= *)
  | And_assign  of annotation             (* &= *)
  | Xor_assign  of annotation             (* ^= *)
  | Or_assign  of annotation              (* |= *)
type unary_operator =
    Incr_postfix  of annotation        (* ++ *)
  | Decr_postfix of annotation         (* -- *)
  | Incr_prefix of annotation          (* ++ *)
  | Decr_prefix of annotation          (* -- *)
  | Delete of annotation               (* delete *)
type sideeffect_free_unary_operator = 
    Void of annotation                 (* Void *)
  | Typeof of annotation               (* Typeof *)
  | Positive of annotation             (* + *)
  | Negative of annotation             (* - *)
  | Tilde of annotation                (* ~ *)
  | Bang of annotation                 (* ! *)
type binary_operator = 
    Greater of annotation           (* > *)
  | Less of annotation              (* < *)
  | Eq  of annotation               (* == *)
  | Le of annotation                (* <= *)
  | Ge of annotation                (* >= *)
  | Ne of annotation                (* != *)
  | Eqq of annotation               (* === *)
  | Neq of annotation               (* !== *)
  | Sc_or of annotation             (* || *)
  | Sc_and of annotation            (* && *)
  | Plus of annotation              (* + *)
  | Minus of annotation             (* - *)
  | Star of annotation              (* * *)
  | Slash of annotation             (* / *)
  | Bit_and of annotation           (* & *)
  | Bit_or of annotation            (* | *)
  | Xor of annotation               (* ^ *)
  | Rem  of annotation              (* % *)
  | Lshift of annotation            (* << *)
  | Rsignedshift  of annotation     (* >> *)
  | Runsignedshift  of annotation   (* >>> *)
  | Instanceof  of annotation       (* instanceof *)
  | In  of annotation               (* in *)
type 'c identifier = 
    Identifier of annotation * string
  | AttributeIdentifier of annotation * 'c identifier
  | AttributeIdentifierExp of annotation * 'c expression
  | QualifiedIdentifier of annotation * 'c identifier * 'c identifier
  | QualifiedIdentifierExp of annotation * 'c identifier * 'c expression
  | Wildcard of annotation (* * *)
and 'c property_name = 
    DynamicName of annotation * 'c identifier
  | StaticName of annotation * constant
and 'c for_bracket =
  | Regular of annotation * 'c expression option 
      * 'c expression option * 'c expression option
  | Regular_var of annotation *
      ('c identifier * 'c expression option) list * 'c expression option * 
	  'c expression option
  | With_in of annotation * 'c expression * 'c expression
  | With_in_and_var of annotation * ('c identifier * 'c expression option) 
      * 'c expression 
and 'c expression = 
    Constant of annotation * constant
  | This of annotation 
  | Variable of annotation * 'c identifier
  | Sequence of annotation * 'c expression list
  | Array_construction of annotation * ('c expression option) list
  | Array_access of annotation * 'c expression * 'c expression
  | Object_construction of annotation * ('c property_name * 'c expression) list
  | Object_access of annotation * 'c expression * 'c identifier
  | Function_expression of annotation * 
      'c identifier option * 'c identifier list * 'c identifier list option * 'c source_element list
  | Assign of annotation * 'c expression * assignment_operator * 'c expression
  | Unop_without_sideeffect of annotation * 'c expression 
      * sideeffect_free_unary_operator
  | Unop of annotation * 'c expression * unary_operator
  | Binop of annotation * 'c expression * binary_operator * 'c expression
  | Conditional of annotation * 'c expression * 'c expression * 'c expression 
  | Function_call of annotation * 'c expression * 'c expression list
  | Method_call of annotation * 'c expression * 'c identifier * 'c expression list
  | New_expression of annotation * 'c expression * 'c expression list
  | RegExp of annotation * (string * string)
  | Property_construction of annotation * 'c identifier
  | Property_access of annotation * 'c expression * 'c identifier
  | Descendant_access of annotation * 'c expression * 'c identifier
  | Filter_access of annotation * 'c expression * 'c expression
  | XMLInitialiser of annotation * 'c xml_expression 
  | XMLListInitialiser of annotation * 'c xml_expression
and 'c xml_expression =
  | XMLElement of annotation * 'c xml_expression list 
      * 'c xml_expression option * 'c xml_expression list
  | XMLElementEmpty of annotation * 'c xml_expression list
  | XMLText of annotation * string
  | XMLComment of annotation * string
  | XMLCDATA of annotation * string
  | XMLPI of annotation * string
  | XMLWhitespace of annotation
  | XMLTagChars of annotation * string
  | XMLExpression of annotation * 'c expression
  | XMLAssignExpression of annotation * 'c expression
  | XMLAssignAttr of annotation * string
  | XMLElementContent of annotation * 'c xml_expression * 'c xml_expression option
and 'c statement = 
    Skip of annotation  
  | Block of annotation * 'c statement list
  | Variable_declaration of annotation * ('c identifier * 'c expression option) list
  | Expression of annotation * 'c expression
  | If of annotation * 'c expression * 'c statement * 'c statement option
  | Do of annotation * 'c statement * 'c expression
  | While of annotation * 'c expression * 'c statement 
  | For of annotation * 'c for_bracket * 'c statement
  | Continue of annotation * 'c identifier option
  | Break of annotation * 'c identifier option
  | Return of annotation * 'c expression option
  | With of annotation * 'c expression * 'c statement
  | Labelled_statement of annotation * 'c identifier * 'c statement
  | Switch of annotation *
      'c expression *
      (* regular case-cases *)
	('c expression * 'c statement list option) list *
	(* default-case and content optional *)
      'c statement list option option *
	(* additional case-cases after default *)
      ('c expression * 'c statement list option) list
  | Throw of annotation * 'c expression
	(* try catch do finally *)
  | Try_catch_finally of annotation * 
      'c statement * ('c identifier * 'c statement) option * 'c statement option
  | For_each of annotation * 'c for_bracket * 'c statement
  | DefaultXMLNamespace of annotation * 'c expression
and 'c source_element = 
    Statement of annotation * 'c statement
  | Function_declaration of annotation * 'c * 'c identifier *
      'c identifier list * 'c identifier list option * 'c source_element list
  | VarDecl of 'c identifier * 'c expression
and 'c program = Program of annotation * 'c source_element list


val so_constant : constant -> string 
val so_assign_op : assignment_operator -> string 
val so_unary_op : unary_operator -> string 
val so_sefree_unary_op : sideeffect_free_unary_operator -> string 
val so_binary_op : binary_operator -> string 

val so_identifier : ('c -> string) -> 'c identifier -> string 
val so_property_name : ('c -> string) -> 'c property_name -> string 
val so_for_loop_def : ('c -> string) -> int -> 'c for_bracket -> string 
val so_expression : ('c -> string) -> int -> 'c expression -> string 
val so_xml_expression : ('c -> string) -> int -> 'c xml_expression -> string 
val so_statement : ('c -> string) -> int -> 'c statement -> string 
val so_source_element : ('c -> string) -> int -> 'c source_element -> string 
val so_program : ('c -> string) -> int -> 'c program -> string 
val string_of_ast : ('c -> string) -> 'c program -> string 
val string_of_statement : ('c -> string) -> 'c statement -> string 
val string_of_expression : ('c -> string) -> 'c expression -> string 

val visit :
  ?b_program:('c program -> 'c program) ->
  ?a_program:('d program -> 'd program) ->
  ?b_source_element:('c source_element -> 'c source_element list) ->
  ?a_source_element:('d source_element -> 'd source_element list) ->
  ?b_statement:('c statement -> 'c statement) ->
  ?a_statement:('d statement -> 'd statement) ->
  ?b_expression:('c expression -> 'c expression) ->
  ?a_expression:('d expression -> 'd expression) ->
  ?b_xml_expression:('c xml_expression -> 'c xml_expression) ->
  ?a_xml_expression:('d xml_expression -> 'd xml_expression) ->
  ?b_identifier:('c identifier -> 'c identifier) ->
  ?a_identifier:('d identifier -> 'd identifier) ->
  ?b_property_name:('c property_name -> 'c property_name) ->
  ?a_property_name:('d property_name -> 'd property_name) ->
  ba_c:('c -> 'd) ->
  ?ba_constant:(constant -> constant) ->
  ?ba_assign_operator:(assignment_operator -> assignment_operator) ->
  ?ba_unary_operator:(unary_operator -> unary_operator) ->
  ?ba_sideeffect_free_unary_operator:(sideeffect_free_unary_operator ->
                                        sideeffect_free_unary_operator) ->
  ?ba_binary_operator:(binary_operator -> binary_operator) ->
  ?ba_regex:(string * string -> string * string) ->
  'c program -> 'd program

type iterfun = unit -> unit

val visit_with_fun :
  ?b_program:('c program -> 'c program * iterfun list) ->
  ?a_program:('d program -> 'd program) ->
  ?b_source_element:('c source_element -> 'c source_element list * iterfun list) ->
  ?a_source_element:('d source_element -> 'd source_element list) ->
  ?b_statement:('c statement -> 'c statement * iterfun list) ->
  ?a_statement:('d statement -> 'd statement) ->
  ?b_expression:('c expression -> 'c expression * iterfun list) ->
  ?a_expression:('d expression -> 'd expression) ->
  ?b_xml_expression:('c xml_expression -> 'c xml_expression * iterfun list) ->
  ?a_xml_expression:('d xml_expression -> 'd xml_expression) ->
  ?b_identifier:('c identifier -> 'c identifier) ->
  ?a_identifier:('d identifier -> 'd identifier) ->
  ?b_property_name:('c property_name -> 'c property_name) ->
  ?a_property_name:('d property_name -> 'd property_name) ->
  ba_c:('c -> 'd) ->
  ?ba_constant:(constant -> constant) ->
  ?ba_assign_operator:(assignment_operator -> assignment_operator) ->
  ?ba_unary_operator:(unary_operator -> unary_operator) ->
  ?ba_sideeffect_free_unary_operator:(sideeffect_free_unary_operator ->
                                        sideeffect_free_unary_operator) ->
  ?ba_binary_operator:(binary_operator -> binary_operator) ->
  ?ba_regex:(string * string -> string * string) ->
  'c program -> 'd program

val with_lv : 'a program -> 'a program  
                                           
(* val find_local_vars : program -> program *)
