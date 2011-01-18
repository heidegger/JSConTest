type effect =
  | Parameter of int
  | Var of string
  | This 
  | RegExVar of string

  | Prop of effect * string
  | Star of effect
  | Question of effect
  | NoProp of effect
  | RegExProp of effect * string

type t = El of effect list | All
type ('a,'b) either =
    Left of 'a
  | Right of 'b

let create () = El []
let create_all () = All
let create_effect_list el = El el
let create_none () = El []

(* let rec rem_var = function
    | Parameter i as e -> e
    | Var s -> 
        if (String.compare s "this") then begin
          Var s
        else begin 
          Prop (Parameter 0, s)
        end
    | Prop (e,s) -> Prop (rem_var e, s)
    | Star e -> Star (rem_var e)
    | Question e -> Question (rem_var e)
  in
    El (List.map rem_var el) *)

let get_effects = function
  | El el -> el
  | All -> failwith "get_effects of All"

let map f fall = function
  | El t -> Left (List.map f t)
  | All -> Right (fall ())

let rec string_of_effect = function
  | Parameter i -> "$" ^ string_of_int i
  | Var s -> s
  | This -> "this"
  | RegExVar s -> s
  | Prop (e,s) -> 
      let se = string_of_effect e in
        se ^ "." ^ s
  | Star e -> (string_of_effect e) ^ ".*"
  | Question e -> (string_of_effect e) ^ ".?"
  | NoProp e -> (string_of_effect e) ^ ".@"
  | RegExProp (e,s) ->
      (string_of_effect e) ^ "." ^ s

let is_empty = function
  | El t -> List.length t < 1
  | All -> false


let string_of = function
  | El t ->
      String.concat "," (List.map string_of_effect t)
  | All -> "*"
module Test = struct
  open ProglangUtils
  open Test

  let init () =
    let t1 () = 
      let t = El [Parameter 1] in
      let ts = string_of t in
        assert_equal 
          ~printer:(fun x -> x)
          "$1"
          ts
    in
    let t2 () = 
      let t = El [Var "test"] in
      let ts = string_of t in
        assert_equal 
          ~printer:(fun x -> x)
          "test"
          ts
    in

    let t3 () =
      let t = El [Prop (Prop (Parameter 5,"acd"),"_fd")] in
      let ts = string_of t in
        assert_equal 
          ~printer:(fun x -> x)
          "$5.acd._fd"
          ts
    in

    let t4 () =
      let t = El [Prop (Prop (Parameter 2,"a"),"b")] in
      let ts = string_of t in
        assert_equal 
          ~printer:(fun x -> x)
          "$2.a.b"
          ts
    in
    let t5 () =
      let t = El [Star (Prop (Parameter 2,"b"))] in
      let ts = string_of t in
        assert_equal
          ~printer:(fun x -> x)
          "$2.b.*"
          ts
    in
    let t5a () =
      let t = El [Star (Parameter 2)] in
      let ts = string_of t in
        assert_equal
          ~printer:(fun x -> x)
          "$2.*"
          ts
    in
    let t6 () =
      let t = El [Prop (Star (Prop (Parameter 2,"b")),"c")] in
      let ts = string_of t in
        assert_equal
          ~printer:(fun x -> x)
          "$2.b.*.c"
          ts
    in
    let t7 () =
      let t = El [Question (Prop (Parameter 2,"b"))] in
      let ts = string_of t in
        assert_equal
          ~printer:(fun x -> x)
          "$2.b.?"
          ts
    in
    let t7a () =
      let t = El [Question (Parameter 2)] in
      let ts = string_of t in
        assert_equal
          ~printer:(fun x -> x)
          "$2.?"
          ts
    in
    let t8 () =
      let t = El [Prop (Question (Prop (Parameter 2,"b")),"c")] in
      let ts = string_of t in
        assert_equal
          ~printer:(fun x -> x)
          "$2.b.?.c"
          ts
    in
    let t9 () =
      let t = El [NoProp (Parameter 2)] in
      let ts = string_of t in
        assert_equal
          ~printer:(fun x -> x)
          "$2.@"
          ts
    in

    let t10 () =
      let t = El [Var "blub"] in
      let ts = string_of t in
        assert_equal
          ~printer:(fun x -> x)
          "blub"
          ts
    in

    let t11 () =
      let t = El [This] in
      let ts = string_of t in
        assert_equal
          ~printer:(fun x -> x)
          "this"
          ts
    in
    ["to string of $1: ",t1;
     "to string of test: ", t2;
     "to string of $5.acd._fd: ",t3;    
     "to string of $2.a.b: ",t4;
     "to string of $2.b.*",t5; 
     "to string of $2.*",t5a; 
     "to string of $2.b.*.c",t6;
     "to string of $2.b.?",t7; 
     "to string of $2.?",t7a; 
     "to string of $2.b.?.c",t8;
     "to string of $2.@",t9;
     "to string of blub",t10;
     "to string of this",t11
    ]

  let _ = 
    install_tests
      "Css effect tests"
      init


end
