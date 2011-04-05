open JSParseInterface
open TStrC
open ProglangUtils
open ExtString
open TCJS
open Helper
module H = Helper.Make(struct let print_endline = print_endline end)
open H

let test () = 
  Test.run_tests None

let normal_run arg =
  let with_error_handler () =
    let progsref = ref "" in
      try
        let prog = read_file_and_parse progsref arg.Args.input_filename in
	(* let _ = print_endline "Parse Contracts" in *)
	let prog,nprog = parse_c prog in
	(* let _ = print_endline "success" in *)
        progsref := (!progsref)^(string_of_program nprog);
	let genprog = gen_js_of_c nprog in
        write_output arg.Args.output_filename genprog
      with e -> begin
        print_endline "Error!";
        if (String.length !progsref > 0) then
          print_endline !progsref;
	print_endline (Printexc.to_string e);
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
