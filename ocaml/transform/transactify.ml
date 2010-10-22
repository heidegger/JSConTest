open Annotation
open AST
open ASTUtil
open TCJS

(* How to deal with assignments:
   | Assign of annotation * 'c expression * assignment_operator * 'c expression
*)
(* e1.i aop e2           ----> txn.doPropAssignment(e,i,e,LAMBDA_FOR_OPERATOR) 
   (Object access):
   
   e1[e2] aop e3       ----> txn.doPropAssignment(e1,e2,e3,LAMDA_FOR_OPERATOR)
   
   example: obj[x] += f(3);     ----> txn.doPropAssignment(obj,x,f(3),function(x,y) { return x + y; }); 
           
  
   uop (obj[x])         ----->   
   (* x++ is transformed to 
   (function() {
     setVar (function(){
               var oldval = x;
               return function(){x = oldval};
            }) ();
     return x++;
     }();
  *)


   (e.i) uop           -----> analog
*)


(* One example for hand transformed code can be found in:
   /svn/progrep/projects/JavaScript/code/transactions/trunk/test.js
*)
(* How to deal with methods:
     | Method_call of annotation * 'c expression * 'c identifier * 'c expression list
*)
(* o.i(e1,...,en) --> *)
(* txn.doMethodCall(m,i,[e1,..,en]) *)

type t = {
  js_namespace: string;
  variable_prefix: string;
  pushUndo: string;
  propAcc: string;
  propAss: string;
  mCall: string;
  newObj: string;
  trackReads: bool;
}

let create_t ~js_namespace ~variable_prefix
    ~pushUndo ~propAcc ~propAss ~mCall ~newObj
    ~trackReads =
  { js_namespace = js_namespace;
    variable_prefix = variable_prefix;
    pushUndo = pushUndo;
    propAcc = propAcc;
    propAss = propAss;
    mCall = mCall;
    newObj = newObj;
    trackReads = trackReads;
  }
  


let transform t effects _ _ sel =
  let txn = s_to_vare t.js_namespace in
  let assop_binop = function

    | Regular_assign _    -> None      (* = *)
    | Star_assign _       -> Some (Star null_annotation)      (* *= *)
    | Slash_assign _      -> Some (Slash null_annotation)      (* /= *)
    | Rem_assign  _       -> Some (Rem null_annotation)      (* %= *)
    | Plus_assign  _      -> Some (Plus null_annotation)      (* += *)
    | Minus_assign  _     -> Some (Minus null_annotation)      (* -= *)
    | Lshift_assign  _    -> Some (Lshift null_annotation)      (* <<= *)
    | Rsignedshift_assign _    -> Some (Rsignedshift null_annotation)  (* >>= *)
    | Runsignedshift_assign _  -> Some (Runsignedshift null_annotation)  (* >>>= *)
    | And_assign  _            -> Some (Bit_and null_annotation) (* &= *)
    | Xor_assign  _            -> Some (Xor null_annotation) (* ^= *)
    | Or_assign  _             -> Some (Bit_or null_annotation) (* |= *) 

  in 
  let assop_lambda op = 
    let x = gen_new_var t.variable_prefix in
    let y = gen_new_var t.variable_prefix in
      match assop_binop op with
        | Some bop ->
            let sel = [g_se_s 
                         (g_s_e
                            (Binop (null_annotation, 
                                    i_to_e x, 
                                    bop, 
                                    i_to_e y)))] in 
              g_fun_xs_sel [x;y] sel
        | None -> undef_e
  in 
  let resetlambda lhs orig =
    let tmp,stmt = new_var t.variable_prefix lhs in
    let revert = 
      stmt @
        [g_return 
           (g_fun_xs_sel [] 
              [g_se_s (g_s_e (Assign 
                                (null_annotation,lhs,
                                 Regular_assign null_annotation,
                                 i_to_e tmp)))])]
    in
      g_e_sel  
        [g_se_s ( g_s_e (do_mcalle_el 
                           txn 
                           (t.pushUndo) 
                           [g_e_sel revert]));
         g_return orig]
  in
  let push,pop,top,fold_left = 
    let env = ref [ASTUtil.s_to_i "window"] in
    let push s = env := s :: !env in
    let top () = match !env with
      | [] -> failwith "no value on the stack"
      | h :: _ -> h
    in
    let pop () = match !env with
      | [] -> failwith "no value on the stack"
      | h :: t -> env := t; h
    in
    let fold_left f a =
      List.fold_left
        f 
        a
        (!env)
    in
      push,pop,top,fold_left
  in
  let transform_e = function
    (* | Variable (ann,i) as e ->
        fold_left
          (fun e with_e -> 
             do_mcalle_el 
               txn
               (env.simWith)
               [Variable (null_annotation, with_e); s_to_e (i_to_s i);e]
          )
          e *)
    | Assign (_,lhs,op,rhs) as ass ->
        ( match lhs with
            | Method_call (_,prefix,mname,
                           [e1; Constant (_,String (_,s))]) ->
                let i = s_to_i s in
                  if ((prefix = txn) 
                      && (mname = (s_to_i t.propAcc))) 
                  then begin
                    do_mcalle_el 
                      txn 
                      (t.propAss) 
                      [e1; s_to_e s; rhs; assop_lambda op] 
                  end 
                  else ass
            | Object_access (_,e1,i) -> 
                do_mcalle_el 
                  txn 
                  (t.propAss) 
                  [e1; s_to_e (i_to_s i); rhs; assop_lambda op] 
            | Array_access (_,e1,e2) -> 
                do_mcalle_el 
                  txn 
                  (t.propAss) 
                  [e1; e2; rhs; assop_lambda op] 
            | Variable (_,i) -> resetlambda (i_to_e i) ass
            | e -> ass
        )
  
    | Function_call (_,e,el) as fcall ->  
        (match e with
           | Object_access (_,e1,i) -> 
               do_mcalle_el 
                 txn 
                 (t.mCall) 
                 [e1; s_to_e (i_to_s i); new_array el] 
           | Array_access (_,e1,e2) ->                
               do_mcalle_el 
                 txn 
                 (t.mCall) 
                 [e1; e2; new_array el]
           | e -> fcall    
        ) 
    | Method_call (_,e1,i,el) as mcall ->  
        do_mcalle_el 
          (s_to_e t.js_namespace) 
          (t.mCall) 
          [e1; i_to_e i; new_array el] 

    | Unop (_,e,op) as unop -> resetlambda e unop

    | Object_access(_,e,i) as eorg -> 
        if (t.trackReads) then
          do_mcalle_el txn (t.propAcc) [e; s_to_e (i_to_s i)]
        else eorg
    | Array_access(_,e1,e2) as eorg -> 
        if (t.trackReads) then
          do_mcalle_el txn (t.propAcc) [e1; e2]
        else eorg
    | Object_construction (a,pnel) as eorg -> 
        if (t.trackReads) then
          eorg
            (* TODO
          Object_construction 
            (a,pnel @ 
               [StaticName (null_annotation,s_to_c "__context__"),
                do_mcalle_el 
               ]) *)
        else
          eorg
    | New_expression (_,e,el) as eorg ->
        if (t.trackReads) then
          do_mcalle_el 
            txn (t.newObj) [e;ASTUtil.new_array el]
        else
          eorg
    | e -> e

  in
  let a_s = function 
    | With (ann,Variable (_,i),s) -> 
        print_endline "pop";
        pop (); s
    | With (ann,e,s) as sorg ->
        pop (); sorg
    | s -> s
  in
  let b_s = function
    | With (ann,e,s) as sorg -> 
        begin
          print_endline (string_of_expression (fun _ -> "") e);
          match e with
            | Variable (_,i) -> 
                print_endline "push";
                push i; sorg
            | e -> 
                failwith "With statement with expressions not supported right now"
                  (* TODO: transform e with the old scope, but 
                     transform s with the new one, where e is
                     part of the env 
                  *)
        end
    | s -> s
  in
    match 
      AST.visit 
        ~ba_c:(fun c -> c) 
        ~a_expression:transform_e  
        ~a_statement: a_s
        ~b_statement: b_s
        (Program (null_annotation,sel)) 
    with
      | Program (_,sel) -> sel


module Test = struct
  open ProglangUtils
  open Test    


  
  let init () =
    let env = { 
      propAss = "doPropAssignment";
      propAcc = "doPropAccess";
      newObj = "newObj";
      mCall = "doMethodCall";
      pushUndo = "pushUndo";
      js_namespace = "";
      variable_prefix = "c_";
      trackReads = false;
    }
    in
    let test1 () =
      let p1 = [Statement (null_annotation, Skip null_annotation)] in
      let p2 = [Statement (null_annotation, 
                           Expression 
                             (null_annotation, 
                              This null_annotation))]
      in
        assert_equal
          ~msg:"Program should not have changed"
          p1
          (transform env (Some true) 1 [] p1);
        assert_equal
          ~msg:"Program should not have changed"
          p2
          (transform env (Some true) 1 [] p2)
             
        
    in ["",test1]
         
  let _ = 
    install_tests
      "Transactify"
      init
      
end
