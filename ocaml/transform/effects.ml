open AST
open Jsinter
open Trans
open ASTUtil
open Annotation

type t = {
  js_namespace: string;
  variable_prefix: string;
  propAcc: string;
  propAss: string;
  mCall: string;
  unop: string;
  box_var: string;
  box_param : string;
  box_this: string;
  unbox: string;
}

let create_t ~js_namespace ~variable_prefix 
    ~propAcc ~propAss ~mCall ~unop ~box_var ~box_param ~box_this ~unbox
    =
  { js_namespace = js_namespace;
    variable_prefix = variable_prefix;
    propAcc = propAcc;
    propAss = propAss;
    mCall = mCall;
    unop = unop;
    box_var = box_var;
    box_param = box_param;
    unbox = unbox;
    box_this = box_this
  }

let transform env effects pl sel =
  let prefix = i_to_e (s_to_i env.js_namespace) in

  let t_o f = function
    | None -> None
    | Some o -> Some (f o)
  in
  let rec t_e = function
    | (Constant _ 
      | This _
      | Variable _
      | RegExp _
      ) as e -> e
    | Sequence (a,el) -> Sequence (a,List.map t_e el)
    | Array_construction (a,eol) -> 
        Array_construction (a,List.map (t_o ub_e) eol)
    | Object_construction (a,pnel) ->
        Object_construction (a,List.map (fun (p,e) -> t_pn p, ub_e e) pnel)
    | Array_access (a,e1,e2) ->
        do_mcalle_el prefix (env.propAcc) [t_e e1; t_e e2]
    | Object_access (a,e,i) ->
        do_mcalle_el prefix (env.propAcc) 
          [t_e e; s_to_e (i_to_s i)]

    | Function_expression (a,fno,pl,ilo,body) ->
        (* TODO: have to transform body of function ?? *)
        Function_expression (a,t_o t_i fno,List.map t_i pl,
                             t_o (List.map t_i) ilo,
                             List.map t_se body)
    | Assign (a,lhs,aop,rhs) ->
        begin
          match lhs with
            | Object_access (a1,le,li) ->
                do_mcalle_el 
                  prefix 
                  (env.propAss)
                  [t_e le; s_to_e (i_to_s li); t_e rhs]
            | _ -> Assign (a,t_e lhs,aop,t_e rhs)
        end
    | Unop_without_sideeffect (a,e,uop) ->
        (* TODO *)
        Unop_without_sideeffect (a,t_e e,uop)
    | Unop (a,e,Delete a1) ->
        (* TODO: transform delete operator into method call of
           library *)
        
        
        Unop (a,t_e e,Delete a1)
    | Unop (a,e,uop) -> 
        begin
          (* TODO: Does not work always, correct the transformation *)
          let do_op op =
            let vn = (gen_var_name env.variable_prefix ()) in
              g_e_sel
                [init_var vn (t_e e);
                 g_se_s 
                   (g_s_e 
                      (t_e 
                         (Assign (null_annotation, 
                                  e, 
                                  Regular_assign null_annotation, 
                                  Binop(null_annotation, 
                                        e, 
                                        op, 
                                        int_to_exp 1)))));
                   g_return (i_to_e (s_to_i vn))
                ]
          in
            match e with
              | Constant _ | This _ -> Unop (a,e,uop)
              | Variable (an,v) -> Unop (a,e,uop)
              | Sequence (an, el) -> failwith "Sequence as lhs of an Unop is not valid."
              | Array_construction _ | Object_construction _ -> Unop (a,e,uop)
              | Array_access (an,e1,e2) ->
                  (* check_read_write e1 e2 *)
                  failwith "Array access inside of Unop not supported right now"
              | Object_access (an,e1,i) ->
                  do_mcalle_el 
                    prefix 
                    (env.unop) 
                    [ s_to_e (so_unary_op uop); t_e e1; s_to_e (i_to_s (t_i i))] 
              | Function_expression _ ->
                  failwith "Function call as lhs for an Unop is not valid."
              | Binop _ -> failwith "Binop as lhs for an Unop is not valid."
              | _ -> failwith "This unop is not supported right now."

(*             match uop with *)
(*               | Incr_postfix _ -> do_op (Plus null_annotation) *)
(*               | Decr_postfix _ -> do_op (Minus null_annotation) *)
(*               | Incr_prefix _  *)
(*               | Decr_prefix _ ->  *)
(*                   failwith "++e and --e is not supported right now" *)
(*               | Delete _ -> failwith "delete e is not supported right now" *)
        end
    | Binop (a,e1,bop,e2) ->
        let e1 = t_e e1 in
        let e2 = t_e e2 in
          begin
            match bop with
              | Ge _ | Le _ | Less _ | Greater _ (* TODO: check if this is correct *)
              | Eq _ | Ne _ | Eqq _ | Neq _ 
              | Plus _ | Minus _ | Star _ | Slash _ 
              | Bit_and _ | Bit_or _ | Xor _ | Rem _
              | Lshift _ | Rsignedshift _ | Runsignedshift _
              | Instanceof _ | In _ 
                  -> Binop (a,ub_e e1, bop, ub_e e2)
              | Sc_or _ | Sc_and _ -> Binop (a,e1,bop,e2)
          end
    | Conditional (a,e1,e2,e3) ->
       Conditional (a,t_e e1, t_e e2, t_e e3) 
    | Function_call (a,e,el) ->
        let el = List.map t_e el in
          begin
            match e with 
              | Object_access (_,e1,i) -> 
                  do_mcalle_el 
                    prefix 
                    (env.mCall) 
                    [t_e e1; s_to_e (i_to_s (t_i i)); new_array el] 
              | Array_access (_,e1,e2) ->                
                  do_mcalle_el 
                    prefix
                    (env.mCall) 
                    [t_e e1; t_e e2; new_array el]
              | e -> 
                  Function_call (a,t_e e, List.map t_e el)
          end
    | Method_call (_,e1,i,el) ->
        let e1 = t_e e1 in
        let i = t_i i in
        let el = List.map t_e el in
          do_mcalle_el 
            (s_to_e env.js_namespace) 
            (env.mCall) 
            [e1; i_to_e i; new_array el] 
    | New_expression (a,e,el) ->
        New_expression (a,t_e e, List.map t_e el) 
    | Property_construction (a,i) -> Property_construction (a,t_i i)
    | Property_access (a,e,i) -> Property_access (a,t_e e, t_i i)
    | Descendant_access (a,e,i) -> Property_access (a,t_e e, t_i i)
    | Filter_access (a,e1,e2) -> Filter_access(a,t_e e1, t_e e2) 
    | XMLInitialiser (a,xmle) -> XMLInitialiser (a,t_xmle xmle)
    | XMLListInitialiser (a,xmle) -> XMLListInitialiser (a,t_xmle xmle)

  and do_box bf e =
    match e with
      | Constant _ -> e
      | Unop_without_sideeffect (_,e,_) ->
          begin
            match e with 
              | Constant _ -> e
              | _ -> bf e
          end
      | _ -> bf e

  and wb_e i e = 
    (* TODO: depending on the structure of e, do the method call *)
    do_box 
      (fun e -> 
         match e with
           | Object_access _ | Array_access _ -> e 
           | _ -> 
               do_mcalle_el 
                 (i_to_e (s_to_i env.js_namespace)) 
                 (env.box_var) 
                 [s_to_e (i_to_s i); e]) 
      e
  and wbp_e index e =
    (* TODO: depending on the structure of e, do the method call *)
    do_box 
      (function 
         | Object_access _ -> e 
         | _ -> 
             do_mcalle_el 
               (i_to_e (s_to_i env.js_namespace)) 
               (env.box_param)
               [c_to_e (n_to_c (float_of_int (index + 1))); e]) 
      e

  and ub_e e =
    (* TODO: depending of the structure of e, do the method call *)
    do_box (fun e -> 
              do_mcalle_el
                (i_to_e (s_to_i env.js_namespace))
                env.unbox
                [e]) e

  and t_xmle = function
    | XMLElement (a,xmlel,xmleo,xmlel2) ->
        XMLElement (a,List.map t_xmle xmlel,t_o t_xmle xmleo,
                    List.map t_xmle xmlel2)
    | XMLElementEmpty (a, xmlel) ->
        XMLElementEmpty (a,List.map t_xmle xmlel)
    | ( XMLText _ |  XMLPI _ | XMLCDATA _
      | XMLComment _ | XMLWhitespace _ | XMLTagChars _  
      | XMLAssignAttr _ )as xmle -> 
        xmle

    | XMLExpression (a, e) -> XMLExpression (a,t_e e)
    | XMLAssignExpression (a, e) ->
        XMLAssignExpression (a, t_e e)
    | XMLElementContent (a,xmle,xmleo) ->
        XMLElementContent (a,t_xmle xmle,t_o t_xmle xmleo)


  and t_s = function
    | Skip a -> Skip a
    | Block (a,sl) -> Block (a,List.map t_s sl) 
    | Variable_declaration (a,ieol) ->
        (* TODO *)
        Variable_declaration 
          (a,List.map 
             (fun (i,eo) -> 
                (t_i i, 
                 t_o
                   (fun e -> wb_e i (t_e e))
                   eo))
             ieol
          )
    | Expression (a,e) -> Expression (a,t_e e)
    | If (a,e,s,so) -> If (a,t_e e, t_s s, t_o t_s so)
    | Do (a,s,e) -> Do (a,t_s s, t_e e)
    | While (a,e,s) -> While (a,t_e e, t_s s)
    | For (a,fb,s) -> For (a,t_fb fb, t_s s)
    | Continue (a,io) -> Continue (a,t_o t_i io)
    | Break (a,io) -> Break (a,t_o t_i io)
    | Return (a,eo) -> Return (a,t_o (function e -> ub_e (t_e e)) eo)
    | With (a,e,s) -> failwith "With statement not supported"
    | Labelled_statement (a,i,s) -> Labelled_statement (a,t_i i, t_s s)
    | Switch (a,e,regcases,sloo,regcases2) ->
        let t_regcases rc = 
          List.map 
            (fun (e,slo) -> t_e e, t_o (fun sl -> List.map t_s sl) slo) 
            rc 
        in
          Switch (a,t_e e,t_regcases regcases, 
                  t_o (t_o (fun sl -> List.map t_s sl)) sloo,
                  t_regcases regcases2)
    | Throw (a,e) -> Throw (a,t_e e)
    | Try_catch_finally (a,s,iso,so) ->
        Try_catch_finally (a,t_s s, 
                           t_o (fun (i,s) -> t_i i, t_s s) iso, t_o t_s so)
    | For_each (a,fb,s) ->
        For_each (a,t_fb fb, t_s s)
    | DefaultXMLNamespace (a,e) ->
        DefaultXMLNamespace (a,t_e e)

  and t_se = function
    | Statement (a,s) ->
        Statement (a,t_s s)
    | Function_declaration (a,c,i,il,ilo,sel) -> 
        print_endline "transform effect in function";
        Function_declaration 
          (a,c,t_i i, [],
           t_o (fun il -> List.map t_i il) ilo,
           List.map t_se sel)
    | VarDecl (i,e) -> VarDecl (t_i i, t_e e)
  and t_i = function
    | (Identifier _ | Wildcard _ ) as i -> i
    | AttributeIdentifier (a,i) -> AttributeIdentifier (a,t_i i)
    | AttributeIdentifierExp (a,e) -> AttributeIdentifierExp (a,t_e e)
    | QualifiedIdentifier (a,i1,i2) -> QualifiedIdentifier (a,t_i i1,t_i i2)
    | QualifiedIdentifierExp (a,i,e) -> QualifiedIdentifierExp (a,t_i i,t_e e) 
  and t_pn = function
    | DynamicName (a,i) -> DynamicName(a,t_i i)
    | StaticName _ as pn -> pn 
  and t_fb = function
    | Regular (a,eo1,eo2,eo3) ->
        Regular (a,t_o t_e eo1, t_o t_e eo2, t_o t_e eo3)
    | Regular_var (a,ieol,eo1,eo2) ->
        Regular_var (a, 
                     List.map (fun (i,eo) -> (t_i i, t_o t_e eo)) ieol,
                     t_o t_e eo1,
                     t_o t_e eo2)
    | With_in_and_var (a, (i,eo), e) ->
        With_in_and_var (a, (t_i i, t_o t_e eo), t_e e)
    | With_in (a, e1, e2) ->
        With_in (a,t_e e1, t_e e2)

  in

  let t_body = List.map t_se sel in 
  let t_body = 
    (g_se_s 
       (g_s_e 
          (do_mcalle_el
             (i_to_e (s_to_i env.js_namespace))
             env.box_this
             [This (null_annotation)])))
    :: t_body
  in
    match pl with
      | [] -> 
          t_body
      | _ -> 
          begin
            let il = List.map t_i pl in
            let _,ieol = 
              List.fold_left
                (fun (index,ieol) i ->
                   let index' = index + 1 in
                   let e = Array_access 
                     (null_annotation, i_to_e (s_to_i "arguments"),
                      c_to_e (n_to_c (float_of_int index)))
                   in
                   let boxede = wbp_e index e in
                     (index + 1, (i, Some boxede) :: ieol))
                (0,[])
                il
            in
            let vdecl = 
              Statement (null_annotation, 
                         Variable_declaration (null_annotation, ieol))
            in
              vdecl :: t_body
          end

module TestEffects = struct
  open ProglangUtils
  open Test    
  open ASTUtil    

  let init () =
    let env = { 
      js_namespace = "PROGLANG.effects";
      propAss = "doPropAss";
      mCall = "mCall";
      propAcc = "doPropRead";
      variable_prefix = "tmp";
      box_var = "box";
      box_param = "box_param";
      unbox = "unbox";
      unop = "doUnop";
      box_this = "boxthis"
    } 
    in
    let na = null_annotation in
    let t1 () =
      let p = [] in
      let p' = transform env (Some true) [] p in
        assert_equal 
          ~msg:"Progtam should not have changed"
          ~printer:(fun sel -> 
                      AST.string_of_ast (fun x -> x) (Program (na,sel)))
          p
          p'
    in
    let t2 () =
      let e_read = read_prop (s_to_i "x") "a" in
      let p = [g_se_s (g_s_e e_read)] in
      let p' = transform env (Some true) [] p in
      let first_read = 
        do_mcalle_el 
          (i_to_e (s_to_i "PROGLANG.effects"))
          (env.propAcc) [i_to_e (s_to_i "x"); s_to_e "a"]
      in
      let p_exp = [g_se_s (g_s_e first_read)] in
        assert_equal 
          ~msg:"Program should have changed the property read into the message call"
          ~printer:(fun sel -> 
                      AST.string_of_ast (fun x -> x) (Program (na,sel)))
          p_exp
          p';
        
        let e_read2 = Object_access (na,e_read,s_to_i "b") in
        let p2 = [g_se_s (g_s_e e_read2)] in
        let p2' = transform env (Some true) [] p2 in
        let second_read =
          do_mcalle_el
            (i_to_e (s_to_i "PROGLANG.effects"))
            (env.propAcc) [first_read; s_to_e "b"]
        in
        let p_exp2 = [g_se_s (g_s_e second_read)] in
          assert_equal 
            ~msg:"Program should have changed the property read into the message call"
          ~printer:(fun sel -> 
                      AST.string_of_ast (fun x -> x) (Program (na,sel)))
            p_exp2
            p2'

    in


      ["simple transformation test",t1;
       "simple expression",t2]

  let _ = 
    install_tests
      "Effect Transformation (transform/effects.ml)"
      init

end
