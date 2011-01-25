open ProglangUtils
open ExtUtils

let print_version () =
  print_endline ("0.4.3 -- " ^ Date.date);
  exit 0


let get_test_count,set_test_count =
  let count = ref 1000 in
    
  let set_test_count i = count := i in
  let get_test_count () = !count in
    get_test_count,set_test_count


let random_string p () =
  let _ = Random.self_init () in
  let is = 
    List.map
      Random.bits
      (Utils.replicate 100 ())
  in
  let s = String.concat 
    ""
    (List.map string_of_int is)
  in
    p^Digest.to_hex (Digest.string s)

let create_string_ref_getter_setter init =
  let r = ref (init ()) in
  let set s = r := s in
  let get () = !r in
    get,set
  
let get_prefix,set_prefix =
  create_string_ref_getter_setter (random_string "g")

let get_local_scope_prefix,set_local_scope_prefix =
  create_string_ref_getter_setter (random_string "lc")


let get_javascript_namespace, set_javascript_namespace =
  create_string_ref_getter_setter (fun () -> "JSConTest")
let get_javascript_contract_namespace, set_javascript_contract_namespace =
  create_string_ref_getter_setter (fun () -> "contracts")
let get_javascript_test_namespace, set_javascript_test_namespace =
  create_string_ref_getter_setter (fun () -> "tests")
let get_javascript_trans_namespace, set_javascript_trans_namespace =
  create_string_ref_getter_setter (fun () -> "trans")
let get_javascript_effect_namespace, set_javascript_effect_namespace =
  create_string_ref_getter_setter (fun () -> "effects")

    
let m_b_o default =
  let bo = ref default in
  let gbo () = !bo in
  let sbo b = bo := b in
    sbo,gbo

let set_generate_tests,get_generate_tests =
  m_b_o true

let set_generate_asserts,get_generate_asserts =
  m_b_o true

let set_css_effect_observation, get_css_effect_observation=
  m_b_o false

let set_effect_observation, get_effect_observation=
  m_b_o false


let set_effect_state,get_effect_state =
  m_b_o Effect.Default
