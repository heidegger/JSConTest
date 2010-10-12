open Arg
open ProglangUtils
open ExtString

type normal = {
  input_filename: string;
  output_filename: string;
}

type test = unit

type arg = 
    Normal of normal
  | Test of test

let set_test_mode,read_test_mode =
  let t = ref false in
    (fun () -> t := true),
    (fun () -> !t)
let modify_for_output fn =
  let sl = List.rev (String.nsplit fn ".") in
  let r = 
    match sl with
      | [] -> []
      | ext :: filenamel ->
          ext :: "test" :: filenamel
  in
    String.concat "." (List.rev r)



let set_input_file_name,read_input_file_name,
  set_output_file_name,read_output_file_name,
  set_file_name =
  
  let ifn = ref false in
  let ofn = ref false in

  let set_ifn,read_ifn =
    let fn = ref "test.js" in
      (fun s -> ifn := true; fn := s),
      (fun () -> !fn)
  in
  let set_ofn,read_ofn =
    let fn = ref None in
      (fun s -> ofn := true; fn := Some s),
      (fun () -> 
         match !fn with
           | None -> modify_for_output (read_ifn ())
           | Some s -> s)
  in
  let set_fn =
    fun s ->
      if (not !ifn) then 
        set_ifn s
      else begin
        if (not !ofn) then
          set_ofn s
        else
          raise (Arg.Bad "Parameters without options are allowed for input and output file.")  
      end
  in
    set_ifn,read_ifn,set_ofn,read_ofn,set_fn

            
let collect () =
  if (read_test_mode ()) then begin
    Test ()
  end else begin
    Normal 
      { input_filename = read_input_file_name ();
        output_filename = read_output_file_name ();
      }
  end

let wrap_words width wl =
  let ll,lines = 
    List.fold_left 
      (fun (str,lines) word -> 
         let str_with_word = str ^ " " ^ word in
           if ((String.length str_with_word) > width) 
           then word, str :: lines
           else str_with_word, lines
      )
      ("",[])
      wl
  in
    List.rev (ll :: lines)

let format_spec width spec =
  let max_width = 
    List.fold_left 
      (fun max_key_length (key,f,des) -> max (String.length key) max_key_length)
      0
      spec
  in
  let key_width = max_width + 4 in
  let des_width = width - key_width in
  let spaces = String.make key_width ' ' in
  let nl = "\n" ^ spaces in
    List.map 
      (fun (key,f,des) -> 
         let wl = Str.split (Str.regexp "[ \t]+") des in
         let lines = wrap_words des_width wl in
         let new_des = String.concat nl lines in
           (key,f,new_des))
      spec

  

let spec =
  [("--input-file",
    String (set_input_file_name),
    " absolute or realtive path to the input file. "
    ^"If no file is given, \"test.js\" is used as default.");
   ("-if",String (set_input_file_name)," shortcut for --input-file");
   ("--output-file",
    String (set_output_file_name),
    (" absolute or realtive path to the output file. "^
       "If no file is given and the inputfile is \"x.js\", "^
       "\"x.test.js\" is used as default."));
   ("-of",
    String (set_output_file_name),
    " shortcut for --output-file");
   ("-t",Unit (set_test_mode)," shortcut for --test");
   ("--test",Unit (set_test_mode),
    " run all unit tests and exits (compiles nothing)");
   ("--js-namespace",String (Etc.set_javascript_namespace),
    " sets the namespace that is used to interact "^
      "with the library (DEFAULT: JSConTest)");
   ("--jsn",String (Etc.set_javascript_namespace),
    " shortcut for --js-namespace");

   ("--test-js-namespace",String (Etc.set_javascript_test_namespace),
    " sets the namespace to interact "^
      "with the test part of the library (DEFAULT: tests)");
   ("-tjsn",String (Etc.set_javascript_test_namespace),
    " shortcut for --test-js-namespace");
   ("-h", Unit (fun () -> raise (Bad ""))," Display this list of options");
   ("--generate-tests",Unit (fun () -> Etc.set_generate_tests true),
    " the compiler generate code, that generates the "^
      "tests for contracts. (default)");
   ("--no-generate-tests",Unit (fun () -> Etc.set_generate_tests false),
    " the compiler does not generate code, that generates "^
      "the tests for contracts.");
   ("--generate-asserts",Unit (fun () -> Etc.set_generate_asserts true),
    " the compiler generate code with asserts. (default)");
   ("--no-generate-asserts",Unit (fun () -> Etc.set_generate_asserts false),
    " the compiler does not generate asserts.");
   ("--test-number",Int (Etc.set_test_count),
    " sets the number of tests for all contracts without "^
      "special annotations.");
   ("-tn",Int (Etc.set_test_count),
    " Shortcut for --test-number");
   ("--version",Unit (fun () -> Etc.print_version ()),
    " prints the version of the compiler and exists");
   ("-v",Unit (fun () -> Etc.print_version ()),
    " shortcut for --version");
   ("--trans-js-namespace",String (Etc.set_javascript_trans_namespace),
    " sets the namespace used to interact with the "^
      "transaction library (DEFAULT: trans)");
   ("--trans-no-transformation",Unit 
      (fun () -> Etc.set_effect_state Effect.NoTrans),
    " the compiler does modify the code under test to "^
      "use transactions.");
   ("--trans-all",Unit (fun () -> Etc.set_effect_state Effect.All),
    " the compiler modify the code under test, such that "^
      "side effects are reverted.");
   ("--trans-only-effect",Unit 
      (fun () -> Etc.set_effect_state Effect.OnlyEffect),
    " the compiler modifies functions with annotation "^
      "~effect.");
   ("--trans-default",Unit (fun () -> Etc.set_effect_state Effect.Default),
    " the compiler modifies functions aside from the one "^
      "annotated with ~noEffect. (Default)");   
   ("--trans-css-effects", Unit (fun () -> Etc.set_css_effect_observation true),
    " the compiler rewrites the code under test, such that css effects will "
      ^"be tracked.");
   ("-ce", Unit (fun () -> Etc.set_css_effect_observation true),
    " shortcut for --css-effects");
   ("-effects", Unit (fun () -> Etc.set_effect_observation true),
    " the compiler rewrites the code under test, such that effects will "
    ^ "be tracked. This feature can not be combined with transactions and "
    ^ "css effects.");
   ("-e", Unit (fun () -> Etc.set_effect_observation true),
    " shortcut for --effects");
   ("--effect-js-namespace",String (Etc.set_javascript_effect_namespace),
    " sets the namespace used to interact with the "^
      "transaction library (DEFAULT: effect)");
  ]
let get_spec () = 
  Arg.align spec
  
let parse () =
(*   let env = Unix.environment () in *)
(*   let _ =  *)
(*     Array.map *)
(*       print_endline *)
(*       env *)
(*   in *)
  let width = 
    try 
      min 100 (max 40 (int_of_string (Unix.getenv "COLUMNS")))
    with _ -> 80
  in
  let _ = 
    Arg.parse 
      (Arg.align (format_spec width spec))
      set_file_name
      ("command line: "^Sys.executable_name
       ^" [options] [input_filename] [output_filename] \n"
       ^"          or  "^Sys.executable_name^" [-t|--tests]\n"
       ^"where Options are:")
  in
    collect ()



module Test = struct
  module SSet = Set.Make(String)
  open Test

  let init () =

    let check_list es saal =
      let _ = List.fold_left
        (fun es (k,_,_) -> 
           begin 
             if (SSet.mem k es) 
             then assert_failure ("command line switches must be unique. "
                                  ^ "This does not hold for: " ^ k)
             else ()
           end;
           SSet.add k es
        )
        es
        saal
      in
        ()
    in

    let t1 () =
      let _ = check_list SSet.empty spec in
        ()
    in

    let t2 () =
      assert_raises
        (Failure ("OUnit: command line switches must be unique. " 
                  ^"This does not hold for: -b"))
        (fun () -> 
           (check_list SSet.empty
              ["-a",(),();
               "-b",(),();
               "-b",(),();
              ]))

    in
      
    let t3 () =
      assert_raises
        (Failure ("OUnit: command line switches must be unique. " 
                  ^"This does not hold for: -a"))
        (fun () -> 
           (check_list SSet.empty
              ["-a",(),();
               "-b",(),();
               "-a",(),();
              ]))


    in
      ["command line switches unique",t1;  
       "command line switches unique",t2;  
       "command line switches unique",t3]  
      
  let _ = 
    install_tests
      "argument parser"
      init

end
