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


type 'a env = {
  tests: bool;
  asserts: bool;
  js_test_namespace: string;
  variable_prefix: string;
  effects_env: 'a;
}

module type TRANS = sig
  type t
  val transform : t 
    -> bool option 
    -> 'c identifier list 
    -> 'c source_element list 
    -> 'c source_element list
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


module Make(T: TRANS) : S with type t = T.t = struct
  type t = T.t
  
  let introduce_asserts test_prefix 
      (cis : (Testlib.varname * GenInfo.t) list)
      fbody fname_own fname_org = 
    if (List.length cis < 1) then fbody else begin
      let rvar = Testlib.gen_lib_var_name () in
      let cl = 
        new_array
          (List.map 
             Testlib.get_var_name
             (List.map fst 
                (List.filter 
                   (fun (cs,gI) -> GenInfo.getAsserts gI) 
                   cis)))
      in
      let fbodyp = sel_to_p fbody in
        
      let wrap_return_flag = ref 0 in
      let wrap_returns = function
        | Return (n,Some e) as eorg -> 
            if (!wrap_return_flag == 0) then
              Return (n,
                      Some
                        (do_mcalle_el
                           (Testlib.get_var 
                              test_prefix
                              rvar)
                           "assertReturn"
                           [e]))
            else eorg
        | s -> s
      in
      let (Program (_,fbody)) = 
        AST.visit
          ~b_source_element:
          (function 
             | Function_declaration _ as se -> 
                 wrap_return_flag := !wrap_return_flag + 1;
                 [se]
             | se -> [se])
          ~a_source_element:
          (function 
             | Function_declaration _ as se -> 
                 wrap_return_flag := !wrap_return_flag - 1;
                 [se]
             | se -> [se])
          ~b_expression:
          (function 
             | Function_expression _ as e ->
                 wrap_return_flag := !wrap_return_flag + 1;
                 e
             | e -> e
          )
          ~a_expression:
          (function 
             | Function_expression _ as e ->
                 wrap_return_flag := !wrap_return_flag - 1;
                 e
             | e -> e
          )
          ~b_statement:wrap_returns
          ~ba_c:(fun c -> c)
          fbodyp
      in
        (Testlib.set_var 
           test_prefix
           rvar
           (do_mcall_el
              test_prefix 
              "assertParams"
              [cl;
               i_to_e (s_to_i "arguments");
               i_to_e fname_own; 
               (* TODO: trans library needs to get informed in a different way *)
(*               c_to_e (b_to_c css_eff); *)
               s_to_e (i_to_s fname_org)
              ]))
        :: fbody
    end

  (* generate code for contracts *)
  let generate_top_contract 
      test_prefix tmp_prefix 
      labels_exp strings_exp numbers_exp
      fname_org
      gen_tests tc =
    (* creates code to add Contract and value to the test suite. *)
    (* print_endline "generate top contract"; *)
    let add_test e testNumber =
      let exp = 
        do_mcall_el test_prefix "add" 
          [c_to_e (s_to_c (so_i fname_org));
           i_to_e fname_org;
           e;
           c_to_e (n_to_c (float_of_int testNumber))]
      in
        g_se_s (g_s_e exp)
    in
      (* register the contract in the global namespace *)
    let register e =
      let new_global_name = Testlib.gen_lib_var_name () in
      let register_contract =
        Testlib.set_var test_prefix new_global_name e
      in
        new_global_name,register_contract
    in
    let rec generate_contractl : c list -> 
      (tc expression * tc source_element list) list =
      fun cl ->
        let rl = 
          List.fold_left 
            (fun isel c -> 
               let ic,selc = generate_contract c in
                 (ic,selc) :: isel)
            []
            cl
        in
          List.rev rl
            
    and generate_contract : c -> tc expression * tc source_element list 
    = function
      | BObjectPL (pl,r,al,_) ->
          let el,sel1 = List.split (generate_contractl (List.map snd pl)) in
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
            do_mcall_el test_prefix "EObject" [ple],List.flatten sel1
      | BArray c ->
          let e,sel = generate_contract c in
            do_mcall_el test_prefix "Array" [e],sel
      | CBase (bc,al,depl) -> generate_basecontract al bc
      | CFunction (cl,c,dd,effects) -> 
          let effects_compl = TCssEffJS.js_of_t (ASTUtil.i_to_s fname_org) effects in
          let el,sel1 = List.split (generate_contractl cl) in
          let sel1 = List.flatten sel1 in
          let e,sel2 = generate_contract c in
          let i,sel3 = 
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
                new_var 
                  tmp_prefix 
                  (do_mcall_el test_prefix "DFunction" 
                     [new_array el;e;
                      new_array oe;
                      new_array de
                     ])
            end else begin
              new_var tmp_prefix 
                (do_mcall_el 
                   test_prefix "Function" 
                   [(new_array el); (* Parameter *)
                    e;              (* return *)
                    effects_compl]  (* effekte *)
                )
            end
          in
            i_to_e i, sel1 @ sel2 @ sel3

    and generate_basecontract : a list -> bc -> 
    tc expression * tc source_element list 
    = fun al bc -> match bc with 
      | BId ->
          read_prop test_prefix "Id",[]
      | BTop -> 
          read_prop test_prefix "Top",[]
      | BVoid | BUndf -> 
          read_prop test_prefix "Undefined",[]
      | BJavaScriptVar jsv ->
          if (List.length al > 0) then begin
            let params = 
              if (List.mem Numbers al) 
              then [numbers_exp] 
              else []
            in
            let params =
              if (List.mem Strings al) 
              then strings_exp :: params 
              else params
            in
            let params =
              if (List.mem Labels al)
              then labels_exp :: params
              else params
            in
              do_fcall (s_to_i jsv) params,[]
          end else begin
            i_to_e (s_to_i jsv),[]
          end
      | BSBool b -> 
          read_prop test_prefix (if b then "True" else "False"),[]
      | BBool -> read_prop test_prefix "Boolean",[]
      | BInteger ->
          if (List.mem Numbers al) then begin
            do_mcall_el test_prefix "AInteger" [numbers_exp],[]
          end else begin
            read_prop test_prefix "Integer",[]
          end
      | BSInteger i ->
          (do_mcall_el 
             test_prefix 
             "SingletonContract"
             [int_to_exp i; s_to_e (string_of_int i)],
           [])
      | BIInterval (left,right) ->
          do_mcall_el test_prefix "IIntervall" 
            [int_to_exp left;int_to_exp right], []

      | BFInterval (f1,f2) -> 
          do_mcall_el test_prefix "NIntervall" 
            [float_to_exp f1; float_to_exp f2],[]
      | BSFloat f ->
          (do_mcall_el 
             test_prefix 
             "SingletonContract"
             [float_to_exp f; s_to_e (string_of_float f)],
           [])
      | BFloat ->
          if (List.mem Numbers al) then begin
            do_mcall_el test_prefix "ANumber" [numbers_exp],[]
          end else begin
            read_prop test_prefix "Number",[]
          end
            
      | BString ->
          if (List.mem Strings al) then begin
            do_mcall_el test_prefix "AString" [strings_exp],[]
          end else begin
            read_prop test_prefix "String",[]
          end
      | BSString s -> 
          do_mcall_el test_prefix "Singlton" 
            [c_to_e (s_to_c s)], []
      | BObject ->
          if (List.mem Labels al) then begin
            do_mcall_el test_prefix "PObject" [labels_exp],[]
          end else begin
            read_prop test_prefix "Object",[]
          end
    in
      
    let gen_for_on_c res (e,gen) (c,gI) =
      let at = 
        if (gen_tests && (GenInfo.getTests gI))
        then [add_test e (GenInfo.getTestNumber gI)]
        else []
      in
      let ngn,setV = register e in
        ((ngn,gI),(gen_run_anonym_fun (gen @ at @ [setV]))) :: res
    in
    let cl = Contract.get_clgI tc in
    let esel = generate_contractl (List.map fst cl) in
      List.fold_left2 gen_for_on_c [] esel cl
        


  let gen_and_introduce env 
      (* tests asserts effects css_effects *)
      labels strings numbers 
      (* trans_prefix test_prefix tmp_prefix *)
      a c fname_org pl fbody fcode =
    let fname_own = 
      match extend_i fname_org "_own" with
        | Some s -> s
        | None -> failwith "This should never happen"
    in
    let to_array f l = new_array (List.map (fun x -> c_to_e (f x)) l) in
    let numbers_exp = to_array n_to_c numbers in
    let strings_exp = to_array s_to_c strings in
    let labels_exp = to_array s_to_c labels in
      (* create test code *)
      (* print_endline (
         (Contract.string_of 
         BaseContract.string_of 
         Analyse.string_of 
         Depend.string_of)
         c); *)
    let contracts = generate_top_contract
      (s_to_i env.js_test_namespace) env.variable_prefix
      labels_exp strings_exp numbers_exp
      fname_org env.tests c 
    in
    let cis = List.map (fun ((i,gi),_) -> (i,gi)) contracts in
    let test_code = (List.map snd contracts) in
      (* print_endline (string_of_int (List.length test_code)); *)
      (* transform the function body *)
    let fbody = 
      T.transform 
        env.effects_env
        (Contract.get_trans c)
        pl
        fbody
    in
      (* introduce aserts *)
    let fbody = 
      if env.asserts 
      then begin
        (* print_endline "intro asserts"; *)
        introduce_asserts 
          (s_to_i env.js_test_namespace)
          cis fbody fname_own fname_org
      end
      else begin
        (* print_endline "no intro of asserts";  *)
        fbody
      end
    in
    let toString =
      [gen_run_anonym_fun 
         [fcode;
          (g_se_s 
             (g_s_e 
                (do_mcall_el
                   (s_to_i env.js_test_namespace)
                   "overrideToStringOfFunction" 
                   [i_to_e fname_own;i_to_e fname_org]
                )))]]
    in
    let funcode = [Function_declaration (a,c,fname_own,pl,None,fbody)] in
      [AST.VarDecl 
         (fname_org,
          (g_e_sel (funcode @ toString @ [g_return (i_to_e fname_own)])))
      ] @ test_code          


      
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
        (*     let print_numbers str = 
               let s = String_of.string_of_list 
               (fun l -> 
               String_of.string_of_list
               string_of_float
               l)
               !numbers      
               in 
               print_string str;
               print_endline s
               in *)
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
    let transform_se gt ga js_ns = function
      | Function_declaration (a,c,n,pl,_,sel) as forg ->
          let mod_fd =
            gen_and_introduce 
              env            
              (get_labels ())
              (get_strings ())
              (get_numbers ())
              a
              c
              n
              pl
              sel
              forg
          in
            close_scope ();
            mod_fd
      | se -> [se]
    in
    let transform_e = function
      | Object_access (_,_,i) as e -> 
          begin
            match i with
              | Identifier (_,s) -> add_label s
              | _ -> ()
          end;
          e
      | e -> e
    in            
      AST.visit
        ~ba_c:(fun x -> x)
        ~ba_constant:ba_constant
        ~a_source_element:(transform_se 
                             env.tests 
                             env.asserts 
                             env.js_test_namespace)
        ~a_expression:transform_e
        ~b_source_element:
        (function 
           | Function_declaration _ as se -> new_scope ();
               [se]
           | se -> [se])
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
              | CFunction (cl,r,dd,eff) -> 
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
                  CFunction (cl,r,dd,eff)
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
            | CFunction (pl,r,dd,_) as c ->
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
