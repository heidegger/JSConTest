open JSParseInterface
open TStrC
open ProglangUtils
open ExtString
open TCJS

let test () = 
  Test.run_tests None

module TCJS_csseff = TCJS.Make(Transactify)
module TCJS_effects = TCJS.Make(Effects)
module TCJS_noeffects = TCJS.Make(
  struct 
    type t = unit
    let transform () _ _ _ e = e
    let after_wrapper _ _ x = x
    let before_wrapper _ _ x = x
  end)

let string_of_program p =
  AST.string_of_ast 
    (Contract.string_of 
       BaseContract.string_of 
       Analyse.string_of
       Depend.string_of)
    p

let check_args arg f =
  if (Etc.get_effect_observation () &&
        (Etc.get_css_effect_observation () ||
           (Etc.get_effect_state () != Effect.Default)))
  then begin
    print_endline (
      "You are not allowed to combine effects with "
      ^" css effect or transactions. Pass --help for a documentation.")
  end else begin
    f ()
  end
  

let read_file_and_parse progsref ifn =
  let _ = print_endline ("Parse "^ifn) in
  let ic = open_in ifn in
  let prog = JSParseInterface.parse_program ic (Regular Ulexing.Utf8) in
  let _ = print_endline "success" in
    progsref := AST.string_of_ast (fun x -> x) prog;
    prog
      
let parse_c progsref prog =
  (* print_endline !progsref; *)
  let prog = AST.with_lv prog in
  let _ = print_endline "Parse Contracts" in
  let nprog = TStrC.parse prog in
  let _ = print_endline "success" in
    progsref := (!progsref)^(string_of_program nprog);
    prog,nprog

let create_transform_env effect_env =
  { tests = Etc.get_generate_tests ();
    asserts = Etc.get_generate_asserts ();
    js_namespace = Etc.get_javascript_namespace ();
    js_test_namespace = Etc.get_javascript_test_namespace ();
    js_contract_namespace = Etc.get_javascript_contract_namespace ();
    variable_prefix = Etc.get_prefix ();
    effects_env = effect_env;
  }      
      
let gen_js_of_c_css_effects nprog =
  let _ = 
    print_endline ("Transform Contracts (use transaction/css effect system)")
  in
  let effect_env = 
    Transactify.create_t 
      (Etc.get_javascript_trans_namespace ())
      (Etc.get_prefix ())
      "pushUndo"
      "propAcc"
      "propAss"
      "mCall"
      "newObj"
      (Etc.get_css_effect_observation ())
  in
  let nprog = TCJS_csseff.transform (create_transform_env effect_env) nprog in
  let _ = print_endline "success" in
    nprog

let gen_js_of_c_effects nprog =
  let _ = print_endline "Transform Contracts (use effect system)" in
  let effect_env =
    Effects.create_t 
      ((Etc.get_javascript_namespace()) ^ "." ^ (Etc.get_javascript_effect_namespace ()))
      (Etc.get_prefix ())
      "propAcc"
      "propAss"
      "mCall"
      "fCall"
      "unOp"
      "unbox"
  in
  let nprog = TCJS_effects.transform (create_transform_env effect_env) nprog in
  let _ = print_endline "success" in
    nprog

let gen_js_no_effects nprog =
  let _ = print_endline "Transform Contracts and do not use any effect system" in
  let nprog = TCJS_noeffects.transform (create_transform_env ()) nprog in
  let _ = print_endline "success" in
    nprog

let gen_js_of_c nprog = 
  if (Etc.get_effect_observation ()) then begin
    gen_js_of_c_effects nprog
  end else begin
    if (Etc.get_css_effect_observation () ) then begin
      gen_js_of_c_css_effects nprog
    end else begin
      gen_js_no_effects nprog
    end
  end

let write_output ofn genprog =
  print_endline ("Write output to: " ^ ofn);
  let oc = open_out ofn in
    output_string oc 
      (String.strip 
         (AST.string_of_ast (fun () -> "") genprog))
    

let normal_run arg =
  let with_error_handler () =
    let progsref = ref "" in
      try
        let prog = read_file_and_parse progsref arg.Args.input_filename in
        let prog,nprog = parse_c progsref prog in
        let genprog = gen_js_of_c nprog in
          write_output arg.Args.output_filename genprog
      with e -> begin
        print_endline "Error!";
        if (String.length !progsref > 0) then
          print_endline !progsref;
        raise e
      end
  in
    check_args arg with_error_handler 


let _ =
  let a = Args.parse () in
    match a with
      | Args.Test _ -> let _ = test () in ()
      | Args.Normal arg -> 
          normal_run arg; ()
;;
