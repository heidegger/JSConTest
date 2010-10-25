(*************************************************)
(*      Abstract Syntax Tree of Javascript       *)
(*        This file defines the types of         *)
(*              a Javascript - AST               *)
(*          ------==============------           *)
(*************************************************)

open Annotation


(*  | rLabels
    | rStrings
    | rNumbers *)

(*     ----------     *)
(*   Basic Elements   *)
(*     ----------     *)
type constant = 
    Number of annotation * float
  | String of annotation * string
  | True of annotation 
  | False of annotation 
  | Undefined of annotation 
  | Null of annotation 

(*         ---------         *)
(* Operators and Assignments *)
(*         ---------         *)

(* Assignment Operators *)
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

(* Unary Operators which cause side effects *)
type unary_operator =
    Incr_postfix  of annotation        (* ++ *)
  | Decr_postfix of annotation         (* -- *)
  | Incr_prefix of annotation          (* ++ *)
  | Decr_prefix of annotation          (* -- *)
  | Delete of annotation               (* delete *)

(* Unary Operators which don't cause side effects *)
type sideeffect_free_unary_operator = 
  | Void of annotation                 (* Void *)
  | Typeof of annotation               (* Typeof *)
  | Positive of annotation             (* + *)
  | Negative of annotation             (* - *)
  | Tilde of annotation                (* ~ *)
  | Bang of annotation                 (* ! *)

(* Binary Operators *)
type binary_operator = 
  | Greater of annotation           (* > *)
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



(* Identifier of variables and functions *)
type 'c identifier = 
    Identifier of annotation * string
  | AttributeIdentifier of annotation * 'c identifier
  | AttributeIdentifierExp of annotation * 'c expression
  | QualifiedIdentifier of annotation * 'c identifier * 'c identifier
  | QualifiedIdentifierExp of annotation * 'c identifier * 'c expression
  | Wildcard of annotation (* * *)

(* Constant values - Javascript uses only floating point numbers,
 * so there's no need for an int.
 * The Ocaml float uses like Javascript the IEEE 754 standard (64-bit) *)
and 'c property_name = 
    DynamicName of annotation * 'c identifier
  | StaticName of annotation * constant

(* Possibilities of the definition part in a for-loop *)
and 'c for_bracket =
  | Regular of annotation * 'c expression option 
      * 'c expression option * 'c expression option
  | Regular_var of annotation *
      ('c identifier * 'c expression option) list * 'c expression option * 
	  'c expression option
  | With_in of annotation * 'c expression * 'c expression
  | With_in_and_var of annotation * ('c identifier * 'c expression option) 
      * 'c expression 
      
(*                 ---------------                  *)
(* Expressions and statements - the real workhorses *)
(*                 ---------------                  *)

(* Expressions *)
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
  (* cond ? e1 : e2  - Syntax *)
  | Conditional of annotation * 'c expression * 'c expression * 'c expression 
  | Function_call of annotation * 'c expression * 'c expression list
  | Method_call of annotation * 'c expression * 'c identifier * 'c expression list
  | New_expression of annotation * 'c expression * 'c expression list
  | RegExp of annotation * (string * string)

(* EAX Extends *)
  | Property_construction of annotation * 'c identifier
  | Property_access of annotation * 'c expression * 'c identifier
  | Descendant_access of annotation * 'c expression * 'c identifier
  | Filter_access of annotation * 'c expression * 'c expression

  | XMLInitialiser of annotation * 'c xml_expression 
  | XMLListInitialiser of annotation * 'c xml_expression

(* XML Things *)
and 'c xml_expression =
    (* the PrimaryExpression will be extended to:              *)
    (*   - XMLInitialiser                                      *)
    (*     - XMLMarkup                                         *) 
    (*       - XMLComment                                      *)
    (*       - XMLCDDATA                                       *)
    (*       - XMLPI                                           *)
    (*     - XMLElement                                        *)
    (*       - < XMLTagContent />                              *)
    (*       - < XMLTagContent > XMLElementContent_opt         *)
    (*                                  </ XMLTagContent >     *)
    (*   - XMLListInitialiser                                  *)
    
    (* there are 5 posibilities for XMLTagContent:             *)
    (*   - XMLTagCharacters XMLTagContent_opt                  *)
    (*   - XMLWhitespace XMLTagContent_opt                     *)
    (*   - { Expression } XMLTagContent_opt                    *)
    (*   - = XMLWhitespace_opt {Expression} XMLTagContent_opt  *)
    (*   - = XMLWhitespace_opt XMLAttributeValue               *)
    (*                                     XMLTagContnent_opt  *)

    (* for XMLElementContent exists 4 choises:                 *)
    (*   - XMLMarkup XMLElementContent_opt                     *)
    (*   - XMLText XMLElementContent_opt                       *)
    (*   - XMLElement XMLElementContent_opt                    *)
    (*   - {Expression} XMLElementContent_opt                  *)

	(* the second part is optional *)
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
(*  | XMLTagContent of xml_expression list *)
  | XMLElementContent of annotation * 'c xml_expression * 'c xml_expression option

(* Statements *)
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

(* EAX Extends *)
  (* for each (VariableDeclarationNoIn in Exp) Statement *)
  | For_each of annotation * 'c for_bracket * 'c statement
  | DefaultXMLNamespace of annotation * 'c expression

(*         --------        *)
(*   Top Level structures  *)
(*         --------        *)
and 'c source_element = 
    Statement of annotation * 'c statement
  | Function_declaration of annotation * 'c * 'c identifier *
      'c identifier list * 'c identifier list option * 'c source_element list
  | VarDecl of 'c identifier * 'c expression
and 'c program = Program of annotation * 'c source_element list

type iterfun = unit -> unit

let id x = x
let id2 x = x
let id3 x = x
let visit_with_fun :
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
  = fun 
    ?(b_program=fun x -> x,[]) ?(a_program=id2)
    ?(b_source_element=(fun x -> [x],[])) 
    ?(a_source_element=(fun x -> [x]))
    ?(b_statement=fun x -> x,[]) ?(a_statement=id2)
    ?(b_expression=fun x -> x,[]) ?(a_expression=id2)
    ?(b_xml_expression=fun x -> x,[]) ?(a_xml_expression=id2)
    ?(b_identifier=id)
    ?(a_identifier=id2)
    ?(b_property_name=id) 
    ?(a_property_name=id2) 
    (* no children, so before and after is one funtion *)
    ~(ba_c)
    ?(ba_constant=id3)
    ?(ba_assign_operator=id3)
    ?(ba_unary_operator=id3)
    ?(ba_sideeffect_free_unary_operator=id3)
    ?(ba_binary_operator=id3)
    ?(ba_regex=id3)
    prog ->
  let rec visit_program : 'c program -> 'd program = fun prog ->
    let prog = 
      match b_program prog with
        | Program (an,sel),fl ->
            let sel = visit_sel sel in
              Program (an,sel)
    in
      a_program prog
  
  and visit_sel sel =
    let sel = 
      List.flatten 
        (List.map 
           (fun se ->
              let sel,fl = b_source_element se in
              let sel = List.map
                (fun se -> 
                   match se with
                     | VarDecl (i,e) ->
                         let i = visit_identifier i in
                         let e = visit_e e in
                           VarDecl (i,e)
                     | Statement (an,s) ->
                         let s = visit_s s in
                           Statement (an,s)
                     | Function_declaration (an,tc,fn,pl,lvo,sel) ->
                         let tc = ba_c tc in
                         let fn = visit_identifier fn in
                         let pl = List.map visit_identifier pl in
                         let lvo = match lvo with 
                             None -> None 
                           | Some lv -> Some (List.map visit_identifier lv) 
                         in
                         let sel = visit_sel sel in
                           Function_declaration (an,tc,fn,pl,lvo,sel)
                )
                sel
              in
              let sell = List.flatten (List.map a_source_element sel) in
                sell
           )
           sel
        )
    in
      sel

  and visit_property_name p =
    let p = b_property_name p in
    let p =
      match p with
        | DynamicName (an,i) ->
            let i = visit_identifier i in
              DynamicName (an,i)
        | StaticName (an,c) as p -> p 
    in
      a_property_name p

  and visit_identifiero = function
    | None -> None
    | Some i -> Some (visit_identifier i)
  and visit_identifier i =
    let i = b_identifier i in
    let i = 
      match i with
        | Identifier (an,s) -> Identifier (an,s)
        | AttributeIdentifier (an,i) ->
            let i = visit_identifier i in
            AttributeIdentifier (an,i)
        | AttributeIdentifierExp (an,e) ->
            let e = visit_e e in
              AttributeIdentifierExp (an,e)
        | QualifiedIdentifierExp (an,i,e) -> 
            let i = visit_identifier i in
            let e = visit_e e in
              QualifiedIdentifierExp (an,i,e)
        | Wildcard an -> Wildcard an
        | QualifiedIdentifier (an,i1,i2) ->
            let i1 = visit_identifier i1 in
            let i2 = visit_identifier i2 in
              QualifiedIdentifier (an,i1,i2)
    in
      a_identifier i

(*   and visit_top_contract tc =  *)
(*     let tc =  *)
(*       match b_top_contract tc with *)
(*         | (CStringRep _) as tc -> tc *)
(*         | CList (cl,al) -> *)
(*             let cl = List.map visit_contract cl in *)
(*               CList (cl,al) *)
(*     in *)
(*       a_top_contract tc *)

(*   and visit_contract c =  *)
(*     let c = *)
(*       match b_contract c with *)
(*         | CBase (bc,al,[]) ->  *)
(*             let bc = ba_base_contract bc in *)
(*               CBase (bc,al,[]) *)
(*         | CFunction (cl,c) -> *)
(*             let cl = List.map visit_contract cl in *)
(*             let c = visit_contract c in *)
(*               CFunction (cl,c) *)
(*     in *)
(*       a_contract c *)

  and visit_for_braket = function
    | Regular (an,eo1,eo2,eo3) ->
        let eo1 = visit_eo eo1 in
        let eo2 = visit_eo eo2 in
        let eo3 = visit_eo eo3 in
          Regular (an,eo1,eo2,eo3)
    | Regular_var (an,ieol,eo2,eo3) ->
        let ieol =
          List.map 
            (fun (i,eo) -> 
             let i = visit_identifier i in
             let eo = visit_eo eo in
               i,eo
            )
            ieol
        in
        let eo2 = visit_eo eo2 in
        let eo3 = visit_eo eo3 in
          Regular_var (an,ieol,eo2,eo3)
    | With_in (an,e1,e2) ->
        let e1 = visit_e e1 in
        let e2 = visit_e e2 in
          With_in (an,e1,e2)
    | With_in_and_var (an,(i,eo),e) ->
        let i = visit_identifier i in
        let eo = visit_eo eo in
        let e = visit_e e in
          With_in_and_var (an,(i,eo),e)

  and visit_eo = function
    | None -> None
    | Some e -> Some (visit_e e)
  and visit_e e = 
    let e = 
      match b_expression e with
        | Constant (an,c),fl -> 
            let c = ba_constant c in
              Constant (an,c)
        | This (an),fl -> This an
        | Variable (an,i),fl ->
            let i = visit_identifier i in
              Variable (an,i)
        | Sequence (an,el),fl ->
            let el = List.map visit_e el in
              Sequence (an,el)
        | Array_construction (an,eol),fl ->
            let eol = List.map visit_eo eol in
              Array_construction (an,eol)
        | Array_access (an,e1,e2),fl ->
            let e1 = visit_e e1 in
            let e2 = visit_e e2 in
              Array_access(an,e1,e2)
        | Object_construction (an,pnel),fl ->
            let pnel = List.map (fun (pn,e) -> visit_property_name pn,visit_e e) pnel in
              Object_construction (an,pnel)
        | Object_access (an,e,i),fl ->
            let e = visit_e e in
            let i = visit_identifier i in
              Object_access (an,e,i)
        | Function_expression (an,io,pl,lvo,sel),fl ->
            let io = visit_identifiero io in
            let pl = List.map visit_identifier pl in
            let lvo = match lvo with
              | None -> None
              | Some lv -> Some (List.map visit_identifier lv) 
            in
            let sel = visit_sel sel in
              Function_expression (an,io,pl,lvo,sel)
        | Assign (an,e1,aop,e2),fl ->
            let e1 = visit_e e1 in
            let aop = ba_assign_operator aop in
            let e2 = visit_e e2 in
              Assign(an,e1,aop,e2)
        | Unop_without_sideeffect (an,e,sfuo),fl ->
            let e = visit_e e in
            let sfuo = ba_sideeffect_free_unary_operator sfuo in
              Unop_without_sideeffect (an,e,sfuo)
        | Unop (an,e,uo),fl ->
            let e = visit_e e in
            let uo = ba_unary_operator uo in
              Unop(an,e,uo)
        | Binop (an,e1,bo,e2),fl ->
            let e1 = visit_e e1 in
            let bo = ba_binary_operator bo in
            let e2 = visit_e e2 in
              Binop (an,e1,bo,e2)
        | Conditional (an,e1,e2,e3),fl ->
            let e1 = visit_e e1 in
            let e2 = visit_e e2 in
            let e3 = visit_e e3 in
              Conditional (an,e1,e2,e3)
        | Function_call (an,e,el),fl ->
            let e = visit_e e in
            let el = List.map visit_e el in
              Function_call (an,e,el)
        | Method_call (an,e,i,el),fl ->
            let e = visit_e e in
            let i = visit_identifier i in
            let el = List.map visit_e el in
              Method_call(an,e,i,el)
        | New_expression (an,e,el),fl ->
            let e = visit_e e in
            let el = List.map visit_e el in
              New_expression (an,e,el)
        | RegExp (an,(s1,s2)),fl ->
            let s1,s2 = ba_regex (s1,s2) in
              RegExp (an,(s1,s2))
        | Property_construction (an,i),fl ->
            let i = visit_identifier i in
            Property_construction (an,i)
        | Property_access (an,e,i),fl ->
            let e = visit_e e in
            let i = visit_identifier i in
              Property_access (an,e,i)
        | Descendant_access (an,e,i),fl ->
            let e = visit_e e in
            let i = visit_identifier i in
              Descendant_access (an,e,i)
        | Filter_access (an,e1,e2),fl ->
            let e1 = visit_e e1 in
            let e2 = visit_e e2 in
              Filter_access (an,e1,e2)
        | XMLInitialiser (an,xml_e),fl ->
            let xml_e = visit_xml_e xml_e in
              XMLInitialiser (an,xml_e)
        | XMLListInitialiser (an,xml_e),fl ->
            let xml_e = visit_xml_e xml_e in
              XMLListInitialiser (an,xml_e)          
    in
      a_expression e

  and visit_xml_eo = function
    | None -> None
    | Some xml_e -> Some (visit_xml_e xml_e)
  and visit_xml_e xml_e =
    let xml_e = 
      match b_xml_expression xml_e with
        | XMLElement (an,xml_el1,xml_eo,xml_el2),fl ->
            let xml_el1 = List.map visit_xml_e xml_el1 in
            let xml_eo = visit_xml_eo xml_eo in
            let xml_el2 = List.map visit_xml_e xml_el2 in
              XMLElement (an,xml_el1,xml_eo,xml_el2)
        | XMLElementEmpty (an,xml_el),fl ->
            let xml_el = List.map visit_xml_e xml_el in
              XMLElementEmpty (an,xml_el)
        | XMLText (an,s),fl -> XMLText (an,s)
        | XMLComment (an,s),fl -> XMLComment (an,s)
        | XMLCDATA (an,s),fl -> XMLCDATA (an,s) 
        | XMLPI (an,s),fl -> XMLPI (an,s)
        | XMLWhitespace an,fl -> XMLWhitespace an
        | XMLTagChars (an,s),fl -> XMLTagChars (an,s)
        | XMLExpression (an,e),fl ->
            let e = visit_e e in
              XMLExpression (an,e)
        | XMLAssignExpression (an,e),fl ->
            let e = visit_e e in
              XMLAssignExpression (an,e)
        | XMLElementContent (an,xml_e,xml_eo),fl ->
            let xml_e = visit_xml_e xml_e in
            let xml_eo = visit_xml_eo xml_eo in
              XMLElementContent (an,xml_e,xml_eo)
        | XMLAssignAttr (a,str),fl -> XMLAssignAttr (a,str)
    in
      a_xml_expression xml_e

  and visit_so = function
    | None -> None
    | Some s -> Some (visit_s s)
  and visit_s s =
    let s = b_statement s in
    let s = 
      match s with
        | Block (an,sl),fl ->
            let sl = List.map visit_s sl in
              Block (an,sl)
        | Variable_declaration (an,iel),fl ->
            let iel = 
              List.map 
                (fun (i,eo) -> 
                   let i = visit_identifier i in
                   let eo = visit_eo eo in 
                     (i,eo))
                iel
            in
              Variable_declaration (an,iel)
        | Expression (an,e),fl ->
            let e = visit_e e in
              Expression (an,e)
        | If (an,e,s,so),fl ->
            let e = visit_e e in
            let s = visit_s s in
            let so = visit_so so in
              If (an,e,s,so)
        | Do (an,s,e),fl ->
            let s = visit_s s in
            let e = visit_e e in
              Do (an,s,e)
        | While (an,e,s),fl ->
            let e = visit_e e in
            let s = visit_s s in
              While (an,e,s)
        | For (an,fb,s),fl ->
            let fb = visit_for_braket fb in
            let s = visit_s s in
              For (an,fb,s)
        | Continue (an,io),fl ->
            let io = visit_identifiero io in
              Continue (an,io) 
        | Break (an,io),fl ->
            let io = visit_identifiero io in
              Break (an,io)
        | Return (an,eo),fl ->
            let eo = visit_eo eo in
              Return (an,eo)
        | With (an,e,s),fl ->
            let e = visit_e e in
            let s = visit_s s in
              With (an,e,s)
        | Labelled_statement (an,i,s),fl ->
            let i = visit_identifier i in
            let s = visit_s s in
              Labelled_statement (an,i,s)

        | Switch (an,e,eslol1,sloo,eslol2),fl -> 
            let e = visit_e e in
            let transform_eslol eslol =
              List.map 
                (fun (e,slo) -> 
                   let e = visit_e e in
                   let slo =
                     match slo with
                       | None -> None
                       | Some sl ->
                           Some (List.map visit_s sl)
                   in
                     (e,slo))
                eslol 
            in               
            let eslol1 = transform_eslol eslol1 in
            let sloo =
              match sloo with
                | None -> None
                | Some None -> Some None
                | Some (Some sl) ->
                    Some (Some (List.map visit_s sl))
            in
            let eslol2 = transform_eslol eslol2 in
              Switch (an,e,eslol1,sloo,eslol2) 
        | Throw (an,e),fl -> 
            let e = visit_e e in 
              Throw(an,e) 
        | Try_catch_finally (an,s,iso,so),fl -> 
            let s = visit_s s in 
            let iso =
              match iso with
                | None -> None
                | Some (i,s) ->
                    let i = visit_identifier i in
                    let s = visit_s s in
                      Some (i,s)
            in
            let so = visit_so so in 
              Try_catch_finally (an,s,iso,so) 
        | For_each (a,fb,s),fl -> 
            let s = visit_s s in 
            let fb = visit_for_braket fb in 
              For_each (a,fb,s) 
        | DefaultXMLNamespace (an,e),fl -> 
            let e = visit_e e in 
              DefaultXMLNamespace (an,e) 
        | Skip an,fl -> Skip an
    in
      a_statement s
  in
    visit_program prog

let visit 
  = fun 
    ?(b_program=fun x -> x) ?(a_program=id2)
    ?(b_source_element=(fun x -> [x])) 
    ?(a_source_element=(fun x -> [x]))
    ?(b_statement=fun x -> x) ?(a_statement=id2)
    ?(b_expression=fun x -> x) ?(a_expression=id2)
    ?(b_xml_expression=fun x -> x) ?(a_xml_expression=id2)
    ?(b_identifier=id)
    ?(a_identifier=id2)
    ?(b_property_name=id) 
    ?(a_property_name=id2) 
    (* no children, so before and after is one funtion *)
    ~(ba_c)
    ?(ba_constant=id3)
    ?(ba_assign_operator=id3)
    ?(ba_unary_operator=id3)
    ?(ba_sideeffect_free_unary_operator=id3)
    ?(ba_binary_operator=id3)
    ?(ba_regex=id3)
    prog ->
      visit_with_fun 
        ~b_program:(fun x -> b_program x, [])
        ~a_program:a_program
        ~b_source_element:(fun x -> b_source_element x, [])
        ~a_source_element:a_source_element
        ~b_statement:(fun x -> b_statement x,[])
        ~a_statement:a_statement
        ~b_expression:(fun x -> b_expression x, [])
        ~a_expression:a_expression
        ~b_xml_expression:(fun x -> b_xml_expression x,[])
        ~a_xml_expression:a_xml_expression
        ~b_identifier:b_identifier
        ~a_identifier:a_identifier
        ~b_property_name:b_property_name
        ~a_property_name:a_property_name
        ~ba_c:ba_c
        ~ba_constant:ba_constant
        ~ba_assign_operator:ba_assign_operator
        ~ba_unary_operator:ba_unary_operator
        ~ba_sideeffect_free_unary_operator:ba_sideeffect_free_unary_operator
        ~ba_binary_operator:ba_binary_operator
        ~ba_regex:ba_regex
        prog

open ProglangUtils
open ExtList
(* let rec fv_sel = function  *)
(*   | se :: sel -> *)
(*       List.union  *)
(*         (fv_se se)  *)
(*         (fv_sel sel) *)
(*   | [] -> [] *)
(* and fv_se = function  *)
(*   | Statement (a,s) -> fv_s s *)
(*   | Function_declaration (_,_,i,il,sel) -> *)
(*       List.fold_left  *)
(*         (fun fv i -> List.remove i fv)  *)
(*         (fv_sel sel)  *)
(*         (i :: il)  *)
(* and fv_s = function  *)
(*   | _ -> [] *)

(* let fv_p = function  *)
(*   | Program (an,sel) ->  *)
(*       fv_sel sel *)

(*                --------------                *)
(*   A pretty printer and unparser respectively *)
(*                --------------                *)

let ind i = (String.make i ' ')
let nl i  = "\n"^(ind i)
let parseOption contFunc option =
  match option with 
    None    -> ""
  | Some op -> contFunc op

(* Leaves I - Identifiers and constants *)
(* let soa = Annotation.string_of *)
let soa ?(really=false) _ = ""

let so_constant co = 
  match co with
    Number (ann,f)     ->  (soa ann)^(string_of_float f)^" " 
  | String (ann,s)     ->  (soa ann)^"\"" ^ s ^ "\""
  | True ann           ->  (soa ann)^"true"
  | False ann          ->  (soa ann)^"false"
  | Undefined ann      ->  (soa ann)^"undefined"
  | Null ann           ->  (soa ann)^"null"
let so_assign_op = function
  | Regular_assign ann        ->  (soa ann)^" = "
  | Star_assign ann           ->  (soa ann)^" *= "
  | Slash_assign  ann         ->  (soa ann)^" /= "
  | Rem_assign ann            ->  (soa ann)^" %= "
  | Plus_assign ann           ->  (soa ann)^" += "
  | Minus_assign ann          ->  (soa ann)^" -= "
  | Lshift_assign ann         -> (soa ann)^ " <<= "
  | Rsignedshift_assign ann   -> (soa ann)^ " >>= "
  | Runsignedshift_assign ann -> (soa ann)^ " >>>= "
  | And_assign ann            ->  (soa ann)^" &= "
  | Xor_assign ann            ->  (soa ann)^" ^= "
  | Or_assign ann             -> (soa ann)^" |= "
let so_unary_op = function
  | Incr_postfix ann       ->  (soa ann)^"++ "
  | Decr_postfix ann       ->  (soa ann)^"-- "
  | Incr_prefix ann        ->  (soa ann)^" ++"
  | Decr_prefix ann        ->  (soa ann)^" --"
  | Delete ann             ->  (soa ann)^"delete "
let so_sefree_unary_op = function
  | Void  ann              ->  (soa ann)^"Void "
  | Typeof ann             ->  (soa ann)^"Typeof "
  | Bang  ann              ->  (soa ann)^" !"
  | Tilde  ann             ->  (soa ann)^" ~"
  | Negative ann           ->  (soa ann)^" -"
  | Positive ann           -> (soa ann)^ " +"
let so_binary_op = function
  | Greater  ann        -> (soa ann)^ " > "
  | Less ann            -> (soa ann)^ " < "
  | Eq ann              -> (soa ann)^ " == "
  | Le  ann             ->  (soa ann)^" <= "
  | Ge ann              ->  (soa ann)^" >= "
  | Ne  ann             -> (soa ann)^ " != "
  | Eqq   ann           -> (soa ann)^ " === "
  | Neq    ann          -> (soa ann)^ " !== "
  | Sc_or   ann         -> (soa ann)^ " || "
  | Sc_and  ann         ->  (soa ann)^" && "
  | Plus    ann         ->  (soa ann)^" + "
  | Minus   ann         ->  (soa ann)^" - "
  | Star      ann       ->  (soa ann)^" * "
  | Slash       ann     -> (soa ann)^ " / "
  | Bit_and   ann       -> (soa ann)^ " & "
  | Bit_or   ann        -> (soa ann)^ " | "
  | Xor    ann          ->  (soa ann)^" ^ "
  | Rem     ann         -> (soa ann)^ " % "
  | Lshift    ann       ->  (soa ann)^" << "
  | Rsignedshift ann    ->  (soa ann)^" >> "
  | Runsignedshift ann  ->  (soa ann)^" >>> "
  | Instanceof  ann     -> (soa ann)^ " instanceof "
  | In  ann             ->  (soa ann)^" in "

let to_string c_to_string = 
  let rec so_identifier = function 
    | Identifier (ann,s) -> (soa ann)^s
    | AttributeIdentifier (ann,i) ->  (soa ann)^"@"^(so_identifier i)
    | AttributeIdentifierExp (ann,e) ->  (soa ann)^"@["^(so_expression 0 e)^"]"
    | QualifiedIdentifier (ann,i1, i2) ->  (soa ann)^(so_identifier i1)^"::"^(so_identifier i2)
    | QualifiedIdentifierExp (ann,i, e) ->  (soa ann)^(so_identifier i)^"::["^(so_expression 0 e)^"]"
    | Wildcard a -> "*" (* * *)
  and so_property_name = function
    | DynamicName (ann,dn) -> (so_identifier dn)
    | StaticName (ann,sn) -> (so_constant sn)
  and so_for_loop_def indent = function
    | Regular (ann,e1, e2, e3)      -> 
        (soa ann)^"("^(parseOption (so_expression indent) e1)^"; "^
          (parseOption (so_expression indent) e2)^"; "^
          (parseOption (so_expression indent) e3)^") "
    | Regular_var (ann,el, e2, e3)  ->
        let print_var_dec (v, dopt) =
	      match dopt with
              None   -> (so_identifier v)
            | Some (d) -> 
	            (so_identifier v)^" = "^
                  (so_expression indent d)
        in 
          (soa ann)^"(var "^
            (String.concat ", " (List.map print_var_dec el))^
            "; "^
            (parseOption (so_expression indent) e2)^
            "; "^
            (parseOption (so_expression indent) e3)^
            ") "
    | With_in (ann,e1, e2)          -> 
        (soa ann)^"("^
          (so_expression indent e1)^
          " in "^
          (so_expression indent e2)^
          ") "
    | With_in_and_var (ann,(i, eo), e2) ->
        let var_dec = 
	      match eo with 
              None   ->
	            so_identifier i
	        | Some e -> 
	            (so_identifier i)^
	              " = "^
	              (so_expression indent e)
        in
          (soa ann)^"(var "^
            var_dec^
            " in "^
            (so_expression indent e2)^
            ") "
  and so_expression indent = function 
    | Constant (ann,c)                      ->  (soa ann)^so_constant c
    | This ann                              ->  (soa ann)^"this"
    | Variable (ann,i)                      ->  (soa ann)^(so_identifier i)
    | Sequence (ann,el)                     -> 
        (soa ann)^String.concat ", " (List.map (so_expression indent) el)
    | Array_construction (ann,es)           -> 
        let mapper = function 
          |  None    -> ""
          | Some ex -> so_expression indent ex 
        in 
          (soa ann)^"["^
            (String.concat ", " (List.map mapper es))^
            "]"
    | Array_access (ann,n, i)             ->
        (soa ann)^(so_expression indent n)^
          "["^
          (so_expression indent i)^
          "]"
    | Object_construction (ann,cl)          ->
        let pairing (n, e) =
	      (so_property_name n)^
	        " : "^
	        (so_expression indent e) 
        in
          (soa ann)^"{"^
            (String.concat ", " (List.map pairing cl))^
            "}"
    | Object_access (ann,e, i)            ->
        (soa ann)^(so_expression indent e)^
          "."^
          (so_identifier i)
    | Function_expression (ann,io, il, lvo, sel) ->
        let name =
	      match io with 
              None    -> ""
            | Some id -> so_identifier id
        in
          (soa ann)
          ^"(function "^name^" ("
          ^(String.concat ", " (List.map so_identifier il))^")"
          (* ^(match lvo with
              | None -> ""
              | Some lv -> "/* with lv:"
                 ^(String.concat ", " (List.map so_identifier lv)) ^ "*/"
           )*)
          ^" {"^
            (nl indent)^(so_source_elementl (indent+2) sel)
          ^(nl (indent-2))^"})"
    | Assign (ann,e1, ao, e2)             ->
        (soa ann)^(so_expression indent e1)^
          (so_assign_op ao)^
          (so_expression indent e2)
    | Unop_without_sideeffect (ann,e, uo) ->
        (soa ann)^(so_sefree_unary_op uo)^(so_expression indent e)
    | Unop (ann, e, uo)                    ->
        let r =
	      match uo with 
              Incr_postfix ann | Decr_postfix ann ->
	            (soa ann)^(so_expression indent e)^
                  (so_unary_op uo)
            | _                           ->
	            (so_unary_op uo)^
	              (so_expression indent e)
        in  (soa ann)^r
    | Binop (ann,e1, bo, e2)              ->
        (soa ann)^"("^(so_expression indent e1)^
          (so_binary_op bo)^
          (so_expression indent e2)^")"
    | Conditional (ann,e1, e2, e3)        ->
        (soa ann)^(so_expression indent e1)^
          "? "^
          (so_expression indent e2)^
          " : "^
          (so_expression indent e3)
    | Function_call (ann,e, el)           ->
        (soa ann)^(so_expression indent e)^
          "("^
          (String.concat ", " (List.map (so_expression indent) el))^
          ")"
    | Method_call (ann,e, i, el)          ->
        (soa ann)^(so_expression indent e)^
          "."^
          (so_identifier i)^
          "("^
          (String.concat ", " (List.map (so_expression indent) el))^
          ")"
    | New_expression (ann,e, el)           ->
        (soa ann)^"new "^
          (so_expression indent e)^
          "("^
          (String.concat ", " (List.map (so_expression indent) el))^
          ")"
    | RegExp (ann,(s1, s2)) ->
        (soa ann)^"/"^
          s1^
          "/"^
          s2

    (* E4X Pretty Printing *)
    | Property_construction (ann,i) ->
        (so_identifier i)
    | Property_access (ann,e, i) ->
        (soa ann)^(so_expression indent e)^"."^(so_identifier i)
    | Descendant_access (ann,e,i) -> 
        (soa ann)^(so_expression indent e)^".."^(so_identifier i)
    | Filter_access (ann,e1,e2) ->
        (soa ann)^(so_expression indent e1)^".("^(so_expression indent e2)^")"

    | XMLInitialiser (ann,e) -> so_xml_expression indent e
    | XMLListInitialiser (ann,e) ->  (soa ann)^"<>"^(so_xml_expression indent e)^"</>"


  and so_xml_expression indent = function
	  (* der zweite Teil ist eigendlich optional *)
    | XMLElement (_,l1, e2, l3) -> 
        
        "<"^( 
	      (String.concat "" (List.map (so_xml_expression indent) l1))
	      ^">"^
	        (
              (* check for content in tag: *)
	          match e2 with
		          None -> ""
	            | Some e2 -> (so_xml_expression indent e2)
	        )
	      ^"</"^
	        (String.concat "" (List.map (so_xml_expression indent) l3))
	    )^">"
    | XMLElementEmpty (_,l) ->
        "<"^(String.concat "" (List.map (so_xml_expression indent) l))^"/>"
    | XMLWhitespace _ -> " "
    | XMLText (_,s) -> s
    | XMLComment (_,s) -> "<!-- "^s^" -->"
    | XMLCDATA (_,s) -> "<![CDATA[ "^s^" ]]>" 
    | XMLPI (_,s) -> "<? "^s^" ?>"
    | XMLTagChars (_,s) -> s
    | XMLExpression (_,e) -> "{"^(so_expression indent e)^"}"
    | XMLAssignExpression (_,e) -> "={"^(so_expression indent e)^"}"
    | XMLAssignAttr (_,s) ->  "=\""^s^"\""
        (*   | XMLTagContent l ->  *)
        (*       String.concat ", " (List.map (so_xml_expression indent) l) *)
    | XMLElementContent (_,e1, e2) -> ((so_xml_expression indent e1)^
                                         match e2 with
	                                         None    -> ""
                                           | Some e2 -> (so_xml_expression indent e2)
				                      )
  and so_statement indent = function
    | Skip  ann                     -> ";"
    | Block (ann,sl)                ->
        let sl = 
          List.filter
            (function Skip _ -> false | _ -> true)
            sl 
        in
          (soa ann)^"{"^
            (nl (indent+2))^
            (String.concat (nl (indent+2))
               (List.map (so_statement (indent+2)) sl))^
            (nl indent)^"}"
    | Variable_declaration (ann,dl)    ->
        let varDef (name, expop) =
	      match expop with
              None    -> (so_identifier name)
            | Some ex ->
	            (so_identifier name)^
	              " = "^
                  (so_expression indent ex)
        in 
          (soa ann)^"var "^
            (String.concat ("," ^ nl (indent+2)) (List.map varDef dl))^
            ";"
    | Expression (ann,e)               ->
        (soa ann)^(so_expression indent e)^";"
    | If (ann,c, t, e)               ->
        let elsecase =
	      match e with 
              None    -> ""
            | Some ec ->
	            ((nl indent)^
	               "else "^
	               (so_statement indent ec))
        in
          (soa ann)^"if ("^(so_expression indent c)^") "^
            (so_statement indent t)^
            elsecase^";"
    | Do (ann,s, e)                  ->
        (soa ann)^"do "^
          (so_statement indent s)^
          (nl indent)^
          "while ("^
          (so_expression indent e)^
          ");"
    | While (ann,e, s)               ->
        (soa ann)^"while ("^
          (so_expression indent e)^
          ") "^
          (so_statement indent s)
    | For (ann,fb, s)                ->
        (soa ann)^"for "^
          (so_for_loop_def indent fb)^
          " "^
          (so_statement indent s)^";"
    | Continue (ann,io)                ->
        (soa ann)^"continue "^
          (parseOption so_identifier io)^
          ";"
    | Break (ann,io)                   ->
        (soa ann)^ "break "^
          (parseOption so_identifier io)^
          ";" 
    | Return (ann,eo)                  ->
        (soa ann)^"return "^
          (parseOption (so_expression indent) eo)^
          ";"
    | With (ann,e, s)                ->
        (soa ann)^"With ("^
          (so_expression indent e)^
          ") "^
          (so_statement indent s)
    | Labelled_statement (ann,i ,s)  ->
        (soa ann)^(so_identifier i)^
          " : "^
          (so_statement indent s)
    | Switch (ann,e, e1sl, so, e2sl) ->
        let oneCase (e, so) =
	      match so with
              None    ->
	            "case "^
	              (so_expression indent e)^
	              " :"
            | Some sl ->
	            "case "^
	              (so_expression indent e)^
                  " : "^
	              (String.concat "; " (List.map (so_statement indent) sl))
        and default =
	      match so with
              None    -> ""
            | Some so ->
	            match so with 
                    None    -> "default :"
                  | Some sl ->
		              "default : "^
		                (String.concat "; " (List. map (so_statement indent) sl))
        in
          (soa ann)^"switch ("^(so_expression indent e)^")"^
            (String.concat (nl indent) (List.map oneCase e1sl))^
            default^
            (nl indent)^
            (String.concat (nl indent) (List.map oneCase e2sl))
    | Throw (ann,e)                    ->
        (soa ann)^"throw "^
          (so_expression indent e)
    | Try_catch_finally (ann,s, iso, so) -> 
        let catch =
          match iso with 
              None    -> ""
            | Some (i, s)  ->
	            "catch ("^
	              (so_identifier i)^
	              ") "^
	              (so_statement indent s)^
	              (nl indent)
        and finally =
          match so with
              None    -> ""
            | Some s ->
	            "finally "^
	              (so_statement indent s)
        in
          (soa ann)^ "try "^(so_statement indent s)^catch^finally

    (* EAX Extends *)
    (* for each (VariableDeclarationNoIn in Exp) Statement *)
    | For_each (ann,e1, s) ->  
        (soa ann)^"for each "^(so_for_loop_def indent e1)^so_statement indent s
    | DefaultXMLNamespace (ann,e ) ->  
        (soa ann)^"default xml namespace = "^so_expression indent e
  and so_source_element : int -> 'a source_element -> string = fun indent -> function
    | Statement (ann,s) -> (soa ann)^so_statement indent s
    | Function_declaration (ann,contract,name, il, lvo, sel) ->
        let sa = (soa ~really:true ann)  in
        let sc = (c_to_string contract) in
        let sf = "function " ^ (so_identifier name) 
          ^" (" ^ (String.concat ", " (List.map so_identifier il))^") " 
          (* ^ (match lvo with
               | None -> ""
               | Some lv -> "/* with lv: " 
                   ^ (String.concat "," (List.map so_identifier lv)) ^ "*/"
            ) *)
          ^" {" 
          ^(nl (indent+2)) 
          ^(so_source_elementl (indent+2) sel)
          ^(nl indent)^"};"
        in
          String.concat 
            (nl indent) 
            (List.filter (fun s -> String.length s > 0) [sa;sc;sf])

    | VarDecl (i,e) -> "var " ^ (so_identifier i) ^ " = " ^ (so_expression (indent+2) e) ^ ";"
  and so_source_elementl : int -> 'a source_element list -> string = fun indent sel ->
    let sel =
      List.filter
        (function Statement (_,Skip _) -> false | _ -> true)
        sel
    in
    let sel1,sel2 = 
      List.partition  
        (function VarDecl _ -> true | _ -> false)
        sel
    in
      String.concat
        (nl indent)
        (List.map (so_source_element (indent+2)) (sel1 @ sel2))
  and so_program indent = function
    | Program (ann,sel) ->
        let fskip = function 
          | Statement (ann,s) -> 
              begin
                match s with
                  | Skip _ -> false 
                  | _ -> true 
              end
          | _ -> true
        in
          (soa ~really:true ann)^"\n"
          ^(so_source_elementl (indent+2) (List.filter fskip sel))
  in
    (so_identifier, so_property_name, so_for_loop_def, 
     so_expression, so_xml_expression, so_statement,
     so_source_element, so_program)

(* This function calls the soa with an indent of 0 space characters *)

let so_identifier c_to_s = let (i,_,_,_,_,_,_,_) = to_string c_to_s in i
let so_property_name c_to_s = let (_,pn,_,_,_,_,_,_) = to_string c_to_s in pn
let so_for_loop_def c_to_s = let (_,_,fld,_,_,_,_,_) = to_string c_to_s in fld
let so_expression c_to_s = let (_,_,_,e,_,_,_,_) = to_string c_to_s in e
let so_xml_expression c_to_s = let (_,_,_,_,xml_e,_,_,_) = to_string c_to_s in xml_e
let so_statement c_to_s = let (_,_,_,_,_,s,_,_) = to_string c_to_s in s
let so_source_element c_to_s = let (_,_,_,_,_,_,se,_) = to_string c_to_s in se
let so_program c_to_s = let (_,_,_,_,_,_,_,p) = to_string c_to_s in p


let string_of_ast c_to_s ast = so_program c_to_s 0 ast
let string_of_statement c_to_s s = so_statement c_to_s 0 s
let string_of_expression c_to_s e = so_expression c_to_s 0 e



let with_lv p =
  let new_env,pop,push =
    let lv = ref [[]] in
    let new_env () =
      lv :=  [] :: !lv
    in
    let push il =
      lv := (List.hd !lv @ il) :: List.tl !lv
    in
    let pop () =
      let r = List.hd !lv in
        lv := List.tl !lv;
        r
    in
      new_env,pop,push
  in
    visit_with_fun 
      ~b_expression:
      (function 
         | (Function_expression _ as e) -> 
             new_env ();
             e,[]
         | e -> e,[]
      )
      ~a_expression:
      (function
         | Function_expression (an,fn,pl,_,sel) -> 
             let lv = pop () in
               Function_expression (an,fn,pl,Some lv,sel)
         | e -> e
      )
      ~a_statement:
      (function
         | Variable_declaration (an,iel) as s ->
             let il = List.map fst iel in
               push il;
               s
         | s -> s)
      ~b_source_element:
      (function
         | (Function_declaration _ as fd) ->
             new_env ();
             [fd],[]
         | se -> [se],[])
      ~a_source_element:
      (function
         | (Function_declaration (an,c,fn,pl,_,sel) as fd) ->
             let lv = pop () in
               [Function_declaration (an,c,fn,pl,Some lv,sel)]
         | s -> [s])
      ~ba_c:(fun x -> x)
      p
