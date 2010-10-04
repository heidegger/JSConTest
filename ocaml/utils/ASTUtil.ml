open Annotation
open AST


let extend_i i s =
  match i with
    | Identifier (a,i) -> Some (Identifier (a,i ^ s))
    | _ -> None

(* let gen_new_var = *)
(*   let i = ref 0 in *)
(*     fun () -> *)
(*       let r = "c_" ^ (string_of_int !i) in *)
(*         i := !i + 1; *)
(*         Identifier (null_annotation, r) *)

let s_to_i : string -> 'c identifier = fun s -> Identifier (null_annotation, s)
let s_to_c : string -> constant = fun s -> String (null_annotation,s)

let i_to_e : 'a identifier -> 'a expression =
  fun i -> Variable (null_annotation, i) 

let i_to_s : 'a identifier -> string = function
  | Identifier (_,s) -> s

let n_to_c : float -> constant = fun f -> Number (null_annotation,f)
let b_to_c = fun b -> if b then True (null_annotation) else False (null_annotation)

let g_se_s : 'c statement -> 'c source_element = 
  fun s -> Statement (null_annotation,s)
let g_s_e : 'c expression -> 'c statement = 
  fun e -> Expression (null_annotation, e)
let g_fun_xs_sel : 'c identifier list -> 'c source_element list -> 'c expression =
    fun params sel ->  Function_expression (null_annotation,None,params,None,sel)

let g_e_sel : 'c source_element list -> 'c expression =
  fun sel ->
    Function_call (null_annotation,
                   g_fun_xs_sel [] sel,
                   [])


let c_to_e : constant -> 'c expression =
  fun c -> Constant (null_annotation, c)

let s_to_e : string -> 'a expression =
    fun s -> c_to_e (s_to_c s)

let s_to_vare : string -> 'a expression =
    fun s -> i_to_e (s_to_i s)

let float_to_exp : float -> 'c expression =
  fun f -> c_to_e (Number (null_annotation, f))
let int_to_exp : int -> 'c expression =
  fun i -> float_to_exp (float_of_int i)

let gen_run_anonym_fun sel =
  g_se_s (g_s_e (g_e_sel sel))

let set_jsvar : 'c identifier -> 'c expression -> 'c statement =
  fun var expr ->
    Variable_declaration (null_annotation, [var, Some expr])

let new_array : 'c expression list -> 'c expression =
  fun exprl ->
    Array_construction (null_annotation,
                        List.map (fun e -> Some e) exprl)

let read_prop : 'c identifier -> string -> 'c expression=
  fun prefix prop -> 
    Object_access (null_annotation,i_to_e prefix,s_to_i prop)
let do_mcalle_el : 'c expression -> string -> 'c expression list -> 'c expression =
  fun prefix methode parameters ->
    (Method_call (null_annotation, prefix, s_to_i methode, parameters))
let do_mcall_el i m pl = do_mcalle_el (i_to_e i) m pl

let do_mcall : 'c identifier -> string -> 'c identifier list -> 'c expression = 
  fun prefix methode parameters ->
    do_mcall_el prefix methode (List.map i_to_e parameters)

let do_fcall : 'c identifier -> 'c expression list -> 'c expression =
  fun f params ->
    Function_call (null_annotation,i_to_e f,params)
let g_return e =
  g_se_s (Return (null_annotation,Some e))
let sel_to_p sel = Program (null_annotation,sel)
    
let gen_var_name : string -> unit -> string =
  let i = ref (-1) in
    fun prefix () -> 
      i := !i + 1;
      prefix ^ (string_of_int !i)


let new_var : string -> 'c expression -> 'c AST.identifier * 'c source_element list =
  fun prefix rhs ->
    let vn = gen_var_name prefix () in
    let vi = s_to_i vn in
      vi, [g_se_s (Variable_declaration (null_annotation, [vi, Some rhs]))]
let gen_new_var prefix =
  let vn = gen_var_name prefix () in
    s_to_i vn
let init_var vname rhs =
  g_se_s (Variable_declaration (null_annotation,[s_to_i vname,Some rhs]))

let new_object sel =
  Object_construction 
    (null_annotation, 
     (List.map 
        (fun (s,e) -> (DynamicName (null_annotation,(s_to_i s)),e))
        sel))

let undef_e =
  c_to_e (Undefined null_annotation)
