open AST
open Annotation
open ProglangUtils
open ExtList
open Contract 
open BaseContract
open Analyse
open ASTUtil
open String_of

type bc = BaseContract.t
type a = Analyse.t 
type d = Depend.t
type tc = (bc,a,d,DependDown.t) Contract.t
type c = (bc,a,d,DependDown.t) Contract.contract 
type exp = tc AST.expression


type 'a env = {
  tests: bool;
  asserts: bool;
  js_namespace: string;
  js_test_namespace: string;
  js_contract_namespace: string;
  variable_prefix: string;
  effects_env: 'a;
}

module type TRANS = sig
  type t
  val transform : t 
    -> bool option 
    -> 'c source_element list 
    -> 'c source_element list
  val before_wrapper : t -> 'c identifier list -> 'c expression -> 'c expression
  val after_wrapper : t -> 'c identifier list -> 'c expression -> 'c expression
end
module type S = sig
  type t
  val transform : t env 
    -> (BaseContract.t, Analyse.t,Depend.t,unit) Contract.t program 
    -> unit program
end

let so_i = so_identifier 
  (Contract.string_of 
     BaseContract.string_of 
     Analyse.string_of 
     Depend.string_of)

let so_e = so_expression 
  (Contract.string_of 
     BaseContract.string_of 
     Analyse.string_of 
     Depend.string_of) 

let fopt f = function 
          | None -> None
          | Some a -> Some (f a)

module Make(T: TRANS) : S with type t = T.t = struct
  type t = T.t
  
  type 'c prefix_infos = {
    ptest: 'c AST.expression;
    pcontract: 'c AST.expression;
    ptmp: string;
  }
  type infos = {
    labels: exp;
    strings: exp;
    numbers: exp;
  }


  (* generate code for contracts *)
  let generate_contract : tc prefix_infos -> infos -> Testlib.varname -> c -> exp =
	fun prefix info fname c ->
    let rec generate_contractl : c list -> exp list =
      fun cl ->
	List.map generate_contract cl
            
    and generate_contract : c -> exp =
    function
      | CUnion cl ->
	let el = generate_contractl cl in
	  (do_mcalle_el
		prefix.pcontract "Union" 
		el)
      | BObjectPL (pl,r,al,_) ->
          let el = generate_contractl (List.map snd pl) in
          let ple =
            new_array
              ((List.map2
                  (fun (name,c) e -> 
                     new_object 
                       ["name",c_to_e (s_to_c name);
                        "contract",e
                       ]
                  )
                  pl
                  el
               ) @ 
                 (if r 
                  then [(new_object ["random",c_to_e (b_to_c true)])] 
                  else []))
              
          in
            do_mcalle_el prefix.pcontract "EObject" [ple]
      | BArray c ->
          let e = generate_contract c in
            do_mcalle_el prefix.pcontract "Array" [e]
      | CBase (bc,al,depl) -> generate_basecontract al bc
      | CFunction (th,cl,c,dd,effects) -> 
          let effects_compl = TCssEffJS.js_of_t fname effects in
          let el = generate_contractl cl in
          let e = generate_contract c in
          let theo = 
            match th with
              | None -> None
              | Some o -> let the = generate_contract o in
                  Some the
          in
          if (DependDown.is_depend dd) then begin
            let int_of_exp i = float_to_exp (float_of_int i) in
            let oe = List.map int_of_exp (DependDown.get_order dd) in
            let iill = DependDown.get_depend dd in
            let de =
              List.map
                (fun iil ->
                   new_array
                     (List.map
                        (fun d ->
                           let s = Depend.get_scope d in
                           let p = Depend.get_param d in
                             new_array [int_of_exp s;int_of_exp p])
                        iil))
                iill
            in
              (do_mcalle_el prefix.pcontract "DFunction" 
                [new_array el;e;
                 new_array oe;
                 new_array de
                ])
          end else begin
            match theo with
              | None -> 
                    (do_mcalle_el 
                       prefix.pcontract "Function" 
                       [new_array el;   (* Parameter *)
                        e;              (* return *)
                        effects_compl;  (* effekte *)
                        Testlib.var_name_to_string_exp fname                (* fname *)
                       ]
                    )
              | Some the -> 
                    (do_mcalle_el 
                       prefix.pcontract "Method" 
                       [the;            (* this object*)  
                        (new_array el); (* Parameter *)
                        e;              (* return *)
                        effects_compl;   (* effekte *)
                        Testlib.var_name_to_string_exp fname                (* fname *)
                       ]
                    )
          end
            

    and generate_basecontract : a list -> bc -> exp 
    = fun al bc -> match bc with 
      | BLength ->
          read_prop_e prefix.pcontract "Length"
      | BNatural ->
          read_prop_e prefix.pcontract "Natural"
      | BId ->
          read_prop_e prefix.pcontract "Id"
      | BTop -> 
          read_prop_e prefix.pcontract "Top"
      | BVoid | BUndf -> 
          read_prop_e prefix.pcontract "Undefined"
      | BNull -> 
          read_prop_e prefix.pcontract "Null"
      | BJavaScriptVar jsv ->
          if (List.length al > 0) then begin
            let params = 
              if (List.mem Numbers al) 
              then [info.numbers] 
              else []
            in
            let params =
              if (List.mem Strings al) 
              then info.strings :: params 
              else params
            in
            let params =
              if (List.mem Labels al)
              then info.labels :: params
              else params
            in
              do_fcall (s_to_i jsv) params
          end else begin
            i_to_e (s_to_i jsv)
          end
      | BJSCContract cc ->
          do_mcalle_el prefix.pcontract "load" [s_to_e cc]
      | BSBool b -> 
          read_prop_e prefix.pcontract (if b then "True" else "False")
      | BBool -> read_prop_e prefix.pcontract "Boolean"
      | BInteger ->
          if (List.mem Numbers al) then begin
            do_mcalle_el prefix.pcontract "AInteger" [info.numbers]
          end else begin
            read_prop_e prefix.pcontract "Integer"
          end
      | BSInteger i ->
          do_mcalle_el 
            prefix.pcontract 
            "SingletonContract"
            [int_to_exp i; s_to_e (string_of_int i)]
      | BIInterval (left,right) ->
          do_mcalle_el prefix.pcontract "IIntervall" 
            [int_to_exp left;int_to_exp right]
      | BFInterval (f1,f2) -> 
          do_mcalle_el prefix.pcontract "NIntervall" 
            [float_to_exp f1; float_to_exp f2]
      | BSFloat f ->
          do_mcalle_el 
            prefix.pcontract 
            "SingletonContract"
            [float_to_exp f; s_to_e (string_of_float f)]
      | BFloat ->
          if (List.mem Numbers al) then begin
            do_mcalle_el prefix.pcontract "ANumber" [info.numbers]
          end else begin
            read_prop_e prefix.pcontract "Number"
          end
      | BString ->
          if (List.mem Strings al) then begin
            do_mcalle_el prefix.pcontract "AString" [info.strings]
          end else begin
            read_prop_e prefix.pcontract "String"
          end
      | BSString s -> 
          do_mcalle_el prefix.pcontract "Singleton" [c_to_e (s_to_c s)]
      | BObject ->
          if (List.mem Labels al) then begin
            do_mcalle_el prefix.pcontract "PObject" [info.labels]
          end else begin
            read_prop_e prefix.pcontract "Object"
          end
    in      
      generate_contract c

  let generate_tc : tc prefix_infos -> infos -> Testlib.varname -> tc -> (exp * c * GenInfo.t) list =
    fun prefix infos fname tc ->
      List.map
        (fun (c,gI) -> 
	  (generate_contract prefix infos fname c, c, gI))
	(Contract.get_clgI tc)
	
  let generate_named_tc : tc prefix_infos -> infos -> Testlib.varname 
	-> tc -> (exp * c * GenInfo.t * Testlib.varname) list =
    fun prefix infos fname tc ->
      let ecgIl = generate_tc prefix infos fname tc in  
	List.map 
	  (fun (e,c,gI) -> 
	    let cn = Testlib.gen_lib_var_name () in
	    let enamed = Testlib.set_var prefix.ptest cn e in 
	      enamed,c,gI,cn)
	  ecgIl

(*  let generate_tests : (bool -> tc prefix_infos -> infos -> exp -> tc -> exp) =
	fun genTests prefix infos v tc ->

    let add_test fname function_exp contract_exp count_exp =
      do_mcalle_el prefix.ptest "add" 
        [c_to_e (s_to_c module_name);
         function_exp;
         contract_exp;
         c_to_e (n_to_c (float_of_int count_exp))]
    in
    let cl = Contract.get_cl tc in

    let ecl = List.map 
	(fun c -> generate_contract prefix infos -> string -> c, c)
	cl
    in *)
(*    let gen_for_on_c res (e,gen) gI =
      let at = 
        if (genTests && (GenInfo.getTests gI))
        then (* [add_test e (GenInfo.getTestNumber gI)] *) []
        else []
      in
      let ngn,setV = register e in
        ((ngn,gI),(gen_run_anonym_fun (gen @ at @ [setV]))) :: res
    in
      List.fold_left2 gen_for_on_c [] esel (List.map snd cl) *)
        
  let enableAsserts env fnametest = function
    | [] -> (fun e -> e, false)
    | cis -> (fun e -> 
	let cl = 
      	  new_array
	    (List.map 
		Testlib.var_name_to_string_exp
		cis)
	in
	  do_mcalle_el
	    (read_prop (s_to_i env.js_namespace) env.js_test_namespace)
	    "enableAsserts"
	    [e; cl; Testlib.var_name_to_string_exp fnametest ], true)

  type fun_info = {
    contract: tc;
    params: tc AST.identifier list;
    recursive_name: tc AST.identifier option;
    body: tc AST.source_element list;
  }
  (* transforms the body of a function expression or function statement, returns an
   * expression representing the function as a function expression. *)
  let transform_body : T.t env -> fun_info -> (exp -> exp * bool) -> exp = 
    fun env finfo gen_asserts ->
    (* - make function expression for toString override with original function body
        --> org_fcode
     * - transform body          --> T.transform
     * - add wrapper             --> T.before_wrapper
     * - add asserts             --> enableAsserts
     * - add wrapper             --> T.afert_wrapper
     * - overrideToString        --> use fcode and org_fcode, call overrideToStringOfFunction
     *)
	let org_fcode : exp =  	
	  Function_expression (null_annotation,
		Some finfo.contract,
		finfo.recursive_name,
		finfo.params,
		None,
		finfo.body)
	in
	let fcode =
	  let fbody =  
      	    T.transform 
              env.effects_env
              (Contract.get_trans finfo.contract)
              finfo.body
    	  in
	    Function_expression (null_annotation,
		Some finfo.contract,
		finfo.recursive_name,
		finfo.params,
		None,
		fbody)
	in
	let fcode = T.before_wrapper env.effects_env finfo.params fcode in
	let fcode, asserts = gen_asserts fcode in
    	let fcode = T.after_wrapper env.effects_env finfo.params fcode in
      	  do_mcalle_el
            (read_prop (s_to_i env.js_namespace) env.js_test_namespace)
            "overrideToStringOfFunction" 
            [fcode; 
             org_fcode;
             c_to_e (b_to_c asserts)
            ]

  let create_code : (T.t env -> infos -> Testlib.varname -> fun_info -> exp) = 
    (* TODO:
     * - transform function body --> transform_body
     * - generate contract code  --> generate_tc
     * - generate test code      --> add_to_test_suite 
     *)
    fun env info fnametest finfo ->

	(* the prefixes needed by generate_tc *)
	let prefix = { ptest= read_prop (s_to_i env.js_namespace) env.js_test_namespace;  
		       pcontract = read_prop (s_to_i env.js_namespace) env.js_contract_namespace;
	       	       ptmp = env.variable_prefix;
	     	     } 
	in

	(* the expressions for the contracts together with generate Infos and the contracts itself. *)
	(* It also creates the code, that registers the contracts in the test suite namespace *)
    	let e_c_gI_name_list = generate_named_tc prefix info fnametest finfo.contract in
	let assert_contract_names =
	  if (env.asserts) then
	    List.map
	      (fun (_,_,_,name) -> name)
	        (List.filter
	          (fun (_,_,gI,_) -> GenInfo.getAsserts gI)
	          e_c_gI_name_list)
	  else 
	    []
	in
	
	(* the new expression that represents the transformed function. To decide if the enableAssert
	 * part is needed, we need the list of contract names, for which assersts should be generatd. 
	 * If this is empty, no asserts are generated. If it contains at least one element, the contract
	 * names are passert to enableAssert, and the overrideToStringOfFunction method gets a true as
	 * last parameter.
	 *)	
	let fcode = transform_body env finfo 
	  (enableAsserts env fnametest assert_contract_names)
	in
	(* register function under its name in test suite *)
	let fcode = 
	  Testlib.set_var
	    prefix.ptest 
	    fnametest
	    fcode
	in
	(* to add the contracts, for which test cases should be generated, to the library, we 
	 * split the list of contracts into two parts. The first contains all contracts, for which
	 * test cases should be generated. The second part just creates the contracts and registers them
	 * under their name in the library. This is done by passing for parameters to 
	 * addContracts(module, value, ccdlist), even if the method just ignores the 4th parameter. *)
	let e_to_test_list, e_no_test_list = 
	  let tmp1, tmp2 = 
	    (List.partition
	      (fun (_,_,gI,_) -> GenInfo.getTests gI)
	      e_c_gI_name_list)
          in
	    List.map 
	      (fun (e,_,gI,_) -> new_object
		  ["contract",e;
		   "count", int_to_exp (GenInfo.getTestNumber gI)]) 
	      tmp1, 
	    List.map (fun (e,_,_,_) -> e) tmp2
	in

	(* Adds the contract,value pairs to the library. *)
	do_mcalle_el
            (read_prop (s_to_i env.js_namespace) env.js_test_namespace)
	    "addContracts"
	    [Testlib.var_name_to_string_exp fnametest;
	     fcode;
	     new_array e_to_test_list;
	     new_array e_no_test_list]

  let create_infos labels strings numbers =
    let to_array f l = new_array (List.map (fun x -> c_to_e (f x)) l) in
    let numbers_exp = to_array n_to_c numbers in
    let strings_exp = to_array s_to_c strings in
    let labels_exp = to_array s_to_c labels in
      { numbers= numbers_exp; strings= strings_exp; labels= labels_exp }    

  (* creates a name from an expression. Used to build the default 
   * function of get_test_name. *)
  
  let rec pathname = function
    | Variable (an,i) -> Some (so_i i)
    | Object_access (an,e,i) -> fopt (fun s -> s ^ "_" ^ so_i i) (pathname e)
    | Array_access (an,e1,e2) ->
      begin
	match pathname e1,pathname e2 with
          | None, _ | _, None -> None
          | Some s1, Some s2 -> Some (s1 ^ "_" ^ s2)
      end
    | e -> None

  (* creates the name, under which the function is stored inside the test library scope 
   * First the function name itself is considerd. If this does not exists, 
   * the contract is consulted for a name. If both does not have a name, the
   * function default is called. Usually it first tries to generate a new name from 
   * the left hand side of an assignment, if the function is a right hand side of an 
   * assignment, or it completely generates a new unique name. *)
  let get_test_name fn tc default =
    let s = 
      match fn with
	| None -> begin
	  match Contract.get_name tc with
            | None -> ""
            | Some s -> s
	end
	| Some i -> i	
    in
    if String.length s < 1 then
      default ()
    else
      s
      
  let generate_tests env program = 
    (* gt ga ge gcsseff trans_prefix js_ns tmp_prefix program = *)
    let add_number,add_string,add_label,
      new_scope,close_scope, 
      get_numbers,get_strings,get_labels
        = 
      let labels = ref [] in
      let strings = ref [] in
      let numbers = ref [] in
      let rec add_f e = function
        | [] -> []
        | h :: t ->
            (List.add e h) :: add_f e t
      in
      let add e ll = ll := add_f e !ll in
      let add_number e = add e numbers in
      let add_string s = add s strings in
      let add_label l = add l labels in
      let print_numbers _ = () in
      let new_scope () = 
        labels := [] :: !labels; 
        strings := [] :: !strings;
        numbers := [] :: !numbers;
        print_numbers "new_scope: ";
      in
      let close_scope () =
        labels := List.tl !labels;
        strings := List.tl !strings;
        numbers := List.tl !numbers;
        print_numbers "close_scope: ";
      in
      let get ll =
        List.fold_right
          List.union
          ll
          []
      in
      let get_numbers () =
        print_numbers "get_numbers: ";
        get !numbers 
      in
      let get_strings () = get !strings in
      let get_labels () = get !labels in
        add_number,add_string,add_label,
      new_scope,close_scope,
      get_numbers,get_strings,get_labels
    in
    let ba_constant = function
      | Number (an,n) -> 
          add_number n;
          Number (an,n)
      | String (an,s) ->
          add_string s;
          String (an,s)
      | c -> c
    in
    let transform_se = function
      | Function_declaration (a,c,n,pl,_,sel) as forg ->
        let fname = ASTUtil.i_to_s n in
        let info = create_infos (get_labels ()) (get_strings ()) (get_numbers ()) in
	let ftestname = (Testlib.gen_fun_var_name fname) in
	let finfo = {
	  contract= c;
		params= pl;
		recursive_name= Some n;
		body=sel; }
	in
	let mod_fd = create_code env info ftestname finfo in
	let _ = close_scope () in
	[AST.VarDecl 
            (s_to_i fname,
             mod_fd)]
      | se -> [se]
    in
    let lhs_ref = ref [] in
    let transform_e = function
      | Object_access (_,_,i) as e -> 
          begin
            match i with
              | Identifier (_,s) -> add_label s
              | _ -> ()
          end;
          e
      | Function_expression (a,Some c,no,pl,lvo,sel) as e ->
	let nos = match no with
	  | None -> None
	  | Some n -> Some (ASTUtil.i_to_s n)
	in
	
        let fname = get_test_name 
	  nos 
	  c 
	  (fun () ->
	    match List.find
	      (function | None -> false | Some s -> true)
	      !lhs_ref
	    with 
	      | None -> ""
	      | Some s -> s)
	in
	let _ = print_endline fname in
        let info = create_infos (get_labels ()) (get_strings ()) (get_numbers ()) in
	let ftestname = (Testlib.gen_fun_var_name fname) in
	let finfo = {
	  contract= c;
	  params= pl;
	  recursive_name=no;
	  body=sel; }
	in
	create_code env info ftestname finfo
      | Assign (_,lhs,Regular_assign _,rhs) as e ->
	lhs_ref := List.tl !lhs_ref;
	(* print_endline "remove from stack"; *)
	e
      | e -> e
    in            
      AST.visit
        ~ba_c:(fun x -> x)
        ~ba_constant:ba_constant
        ~a_source_element:transform_se
        ~a_expression:transform_e
        ~b_source_element:
        (function 
           | Function_declaration _ as se -> new_scope ();
               [se]
           | se -> [se])
	~b_expression:
	(function
	  | Function_expression _ as e -> new_scope ();
	    e
	  | Assign (_,lhs,Regular_assign _,rhs) as e ->
	    let so = pathname lhs in
	    (* (match so with
	      | Some s -> (* print_endline ("lhs set " ^ s) *)
	      | _ -> ()); *)
	    lhs_ref := so :: !lhs_ref;
	    e
	  | e -> e)
	program




  (* transforms a contract with no informaiton about the dependentcies
     into contract that stores the dd information. *)
  let ucToddC tc =
    let id = fun x -> x in
    let gl = ContractCycle.check tc in
      match gl with
        | None -> 
            Contract.transform
              ~ba_bcontract:id
              ~ba_analyse:id
              ~ba_depend_up:id
              ~ba_depend_down: DependDown.create
              tc
        | Some gl ->           
            let get_order,next =
              let orders : c list list ref = 
                ref (List.rev 
                       (List.map 
                          (List.map 
                             (fun c -> 
                                Contract.transform_c
                                  ~ba_bcontract:id
                                  ~ba_analyse:id
                                  ~ba_depend_up:id
                                  ~ba_depend_down:(DependDown.create)
                                  c)
                          )
                          (ContractCycle.get_order gl)))
              in
              let ao = ref None in
              let next : unit -> unit = fun () -> 
                match !orders with
                  | o :: ol -> orders := ol; ao := Some o
                  | _ -> failwith "This should never happen"
              in
              let get_order : unit -> c list = fun () ->
                match !ao with
                  | None -> failwith "This should never happen"
                  | Some o -> o
              in
                get_order,next
            in
            let compute_order = function
              | CFunction (th,cl,r,dd,eff) -> 
                  (* let c_to_s = 
                     Contract.so_contract
                     BaseContract.string_of
                     Analyse.string_of
                     Depend.string_of
                     in *)
                let o = get_order () in
                  (* let _ = print_endline
                     (String_of.string_of_list c_to_s o)
                     in *)
                let fo = Utils.first o in
                let cli = List.make_index_assoc cl in
                let ord (pos1,c1) (pos2,c2) =
                  (* print_endline (c_to_s c1);
                     print_endline (c_to_s c2); *)
                  let g =
                    match fo c1 c2 with
                      | None -> pos2 - pos1
                      | Some b -> if b then -1 else 1
                  in
                    (* print_int g; *)
                    g
                in
                let clis = List.sort ord cli in
                let is = List.map fst clis in
                  (* print_endline 
                     (String_of.string_of_list 
                     string_of_int
                     is); *)
                  DependDown.set_order dd is;
                  CFunction (th,cl,r,dd,eff)
            | c -> c
          in
          let new_scope,get_scope,add_dul = 
            let dull = ref [[]] in
            let new_scope () =
              dull := [] :: !dull
            in
            let get_scope () =
              let r = List.hd !dull in
                dull := List.tl !dull;
                r
            in
            let add_dul a =
              let s = List.hd !dull in
              let t = List.tl !dull in
                dull := (a :: s) :: t
            in
              new_scope,get_scope,add_dul
          in
          let dependInfo = function
            | CBase (_,_,dul) as c -> 
                (* print_endline (string_of_list Depend.string_of dul); *)
                add_dul dul; c
            | CFunction (None,pl,r,dd,_) as c ->
                DependDown.set_paramnr dd ((List.length pl) + 1);
                DependDown.register_dinfo dd (get_scope ());
                let dul = DependDown.get_dul dd in
                let dul' = List.map Depend.raise_up dul in
                add_dul dul';
                c
            | c -> c
          in
          let b_c = function 
            | CFunction _ as c ->  new_scope (); c
            | c -> c
          in
          let a_c c =
            let c = dependInfo c in
              compute_order c
          in
            (* (print_endline
               ((Contract.string_of
                   BaseContract.string_of
                   Analyse.string_of
                   Depend.string_of)
                  tc)); *)
            Contract.transform
              ~b_tcontract:(fun c -> next (); c)
              ~b_contract:(b_c)
              ~a_contract:(a_c)
              ~ba_bcontract:id
              ~ba_analyse:id
              ~ba_depend_up:id
              ~ba_depend_down:DependDown.create
              tc
              


  (* We make two visits here, one in transform_priv to
     generate the JavaScript Code for the contracts,
     and an other one to remove the contracts. 
     TODO: This should be done with one visit
  *)
  let transform env program =
    (* add depend down informaion *)
    (* print_endline 
       (AST.string_of_ast
       (Contract.string_of
       BaseContract.string_of
       Analyse.string_of
       Depend.string_of)
       program);    *)
    let p = 
      AST.visit
        ~ba_c:ucToddC
        program
    in
      (* compile contracts *)
      AST.visit
        ~ba_c:(fun _ -> ())
        (generate_tests env p)
end
