open Graph
open Contract
open BaseContract
open Analyse
open Depend
open ProglangUtils
open ExtList

module Vertex = struct
  type t = (BaseContract.t, Analyse.t, Depend.t, unit) Contract.contract
  let equal a b = if (Pervasives.compare a b == 0) then true else false
  let hash = Hashtbl.hash
  let compare = Pervasives.compare
end

module G = Imperative.Digraph.Concrete(Vertex)
module T = Traverse.Dfs(G)
module Top = Topological.Make(G)
type t = G.t list
type v = G.V.t

module P = Gml.Print(G)
  (struct 
     let node n = 
       let s  =
         Contract.so_contract 
           BaseContract.string_of
           Analyse.string_of
           Depend.string_of
           n
       in
         [("node",Gml.String s)]
     let edge _ = [("edge",Gml.String "")]
   end)
  
let create contract =
  let gl = ref [] in
  let g = ref (G.create ~size:0 ()) in
  let scope = ref [] in
  let get_param s n =
    match s with
      | CFunction (_,pl,_,_,_) -> 
          List.nth pl (n-1)
      | _ -> failwith "Parameter does not exists"
  in
  let get_scope s = List.nth !scope s in
  let add_scope s =
    scope := s :: !scope;
    s
  in 
  let remove_scope a =
    scope := List.tl !scope;
    a
  in  
  let before_contract c = 
    G.add_vertex !g c;
    add_scope c 
  in
  let after_contract c = 
    remove_scope c 
  in
  let depend_up du =
    let self = get_scope 0 in
    let scope = get_scope (Depend.get_scope du) in
    let dep = get_param scope (Depend.get_param du) in
      G.add_edge !g dep self;
      du
  in
  let before_t t =
    g := G.create ~size:10 ();
    t
  in
  let after_t t =
    gl := !g :: !gl;
    t
  in
    try
      let _ = 
        visit
          ~b_tcontract:before_t
          ~a_tcontract:after_t
          ~b_contract:before_contract
          ~a_contract:after_contract
          ~ba_depend_up:depend_up
          contract
      in
        Some !gl
    with _ -> None


let check_graph g = not (T.has_cycle g)
let check tc =
  match create tc with
    | None -> None
    | Some gl -> 
        if (List.for_all (fun g -> check_graph g) gl) 
        then Some gl
        else None
          
let visit_in_order gl f a =
  List.map 
    (fun g -> Top.fold f g a)
    gl

let get_order gl = 
  let nll =
    visit_in_order gl (fun node nl -> node :: nl) [] 
  in
    List.map
      List.rev
      nll

module Test = struct

  open Etc
  open AST
  open Annotation
  open ProglangUtils
  open ExtList
  open Contract
  open BaseContract
  open Test    

  let init () =
    let parse s =
      (ContractParse.contractl_top ContractLexer.token 
           (Ulexing.from_utf8_string s))
    in
(*    let b_to_c b = CBase (b,[],[]) in *)
(*     let ci = b_to_c BInteger in *)
(*     let csb b = b_to_c (BSBool b) in *)
(*     let cb = b_to_c BBool in *)
(*     let cs = b_to_c BString in *)
(*   let b_to_c_dep b depl = CBase (b,[],depl) in *)

(*     let tc_fun pl r = Contract.create_t [CFunction (pl,r,())] in *)
(*     let tc_cl cl = Contract.create_t cl in *)

(*    let so_t = Contract.string_of 
      BaseContract.string_of 
      Analyse.string_of 
      Depend.string_of
    in *)

(*    let b = Buffer.create 80 in *)
(*    let fb = Format.formatter_of_buffer b in *)
(*    let to_string g =
            let _ = Buffer.clear b in
            let _ = P.print fb g in
            Buffer.contents b
      in *)
    let assert_int m i1 i2 =
      assert_equal
        ~msg:m
        ~printer:string_of_int
        i1
        i2
    in
      

    let t1 () =
(*      let s = "/*c (int,int($1)) -> bool($2) | true -> false($1) */" in *)
      let c1 = CBase (BSBool true,[],[]) in
      let c2 = CBase (BSBool false,[],[Depend.create 1 1]) in
      let c3 = CFunction (None,[c1],c2,(),Csseff.create ()) in
      let c4 = CBase (BInteger,[],[]) in
      let c5 = CBase (BInteger,[],[Depend.create 1 1]) in
      let c6 = CBase (BBool, [], [Depend.create 1 2]) in
      let c7 = CFunction (None,[c4; c5],c6,(),Csseff.create ()) in
      let tc = create_tgI_fn [c3,GenInfo.create ();c7,GenInfo.create ()] None "" in
        match create tc with
          | None -> assert_failure 
              "An error happends during creating of the graph for the contraints"
          | Some gl -> 
              assert_int "Number of graphs should be 2" 2 (List.length gl);
              let fg = List.nth gl 0 in
(*                 assert_equal *)
(*                   ~printer:(fun x -> x) *)
(*                   "" *)
(*                   (to_string fg); *)
                assert_int "#vertex should be 4" 4 (G.nb_vertex fg);
                assert_int "#edges should be 2" 2 (G.nb_edges fg);
                assert_bool "int" (G.mem_vertex fg c4);
                assert_bool "int($1)" (G.mem_vertex fg c5);
                assert_bool "bool($2)" (G.mem_vertex fg c6);
                assert_bool "(int,int($1)) -> bool($2)" (G.mem_vertex fg c7);
                assert_bool "int($1) -> int" (G.mem_edge fg c4 c5);
                assert_bool "bool($2) -> int($1)" (G.mem_edge fg c5 c6);
                let sg = List.nth gl 1 in
                  assert_int "#vertex should be 3" 3 (G.nb_vertex sg);
                  assert_int "#edges should be 2" 1 (G.nb_edges sg);
                  assert_bool "true" (G.mem_vertex sg c1);
                  assert_bool "false($1)" (G.mem_vertex sg c2);
                  assert_bool "true -> false($1)" (G.mem_vertex sg c3);
                  assert_bool "false($1) -> true" (G.mem_edge sg c1 c2);
    in
    let t2 () =
      let s = "/*c (int,int($1)) -> bool($2) | true -> false($1) */" in
      let tc = parse s in
        match check tc with
          | Some [g1;g2] -> 
              ()
          | _ -> assert_failure "No cycles should be found in for this contracts"
    in
    let t3 () =
      let s = "/*c (int($2),int($1)) -> bool($2) */" in
      let tc = parse s in
        match check tc with
          | None -> ()
          | _ -> assert_failure "Graph should have cycles, hence None was expected here!";
    in

    let t4 () =
      let s = "/*c (int($2),int) -> bool */" in
      let tc = parse s in
        match check tc with
          | Some [g] ->
              begin
                match get_order [g] with
                  | [vl] ->
                      assert_equal
                        ~printer:(fun s -> s)
                        "[bool;int;{{(int($2), int)} -> bool};int($2)]"
                        (String_of.string_of_list
                           (fun v ->   
                              (Contract.so_contract 
                                 BaseContract.string_of 
                                 Analyse.string_of
                                 Depend.string_of v))
                           vl)
                  | _ -> failwith "This should never happen"
              end
          | _ -> assert_failure "Graph was not computed correctly"
    in
    let t5 () =
      let s = "/*c (int($2),int,int($1)) -> bool */" in
      let tc = parse s in
        match check tc with
          | Some [g] ->
              begin
                match get_order [g] with
                  | [vl] ->
                      assert_equal
                        ~printer:(fun s -> s)
                        "[bool;int;{{(int($2), int, int($1))} -> bool};int($2);int($1)]"
                        (String_of.string_of_list
                           (fun v ->   
                              (Contract.so_contract 
                                 BaseContract.string_of 
                                 Analyse.string_of
                                 Depend.string_of v))
                           vl)
                  | _ -> failwith "This should never happen"
              end

          | _ -> assert_failure "Graph was not computed correctly"
    in

    let t6 () = 
      let s = "/*c { \"lengh\" : int }.() -> int */" in
      let tc = parse s in
        match check tc with
          | Some [g] -> begin
              match get_order [g] with
                | [vl] -> 
                    assert_equal
                      ~printer:(fun s -> s)
                      "[{lengh: int};int;{lengh: int}{{} -> int}]"
                      (String_of.string_of_list
                         (fun v ->   
                            (Contract.so_contract 
                               BaseContract.string_of 
                               Analyse.string_of
                               Depend.string_of v))
                         vl)                    
                |_ -> failwith "This should neve happen"
            end
          | _ -> assert_failure "Graph was not computed correctly"
      ()
    in
    let t7 () = 
      let s = "/*c { \"_length\" : int, \"_head\" : {} }.(int) -> undefined */" in
      let tc = parse s in
        match check tc with
          | Some [g] -> begin
              match get_order [g] with
                | [vl] -> 
                    assert_equal
                      ~printer:(fun s -> s)
                      "[undf;{};{_length: int, _head: {}};{_length: int, _head: {}}{{int} -> undf};int]"
                      (String_of.string_of_list
                         (fun v ->   
                            (Contract.so_contract 
                               BaseContract.string_of 
                               Analyse.string_of
                               Depend.string_of v))
                         vl)                    
                |_ -> failwith "This should never happen"
            end
          | _ -> assert_failure "Graph was not computed correctly"
      ()
    in

      ["Parse Cycle Test", t1;
       "Check Cycle Test 1", t2;
       "Check Cycle Test 2", t3;
       "Check Cycle Test, Order 3", t4;
       "Check Cycle Test, Order 4", t5;      
       "Check Cycle Test, Methods 1", t6;
       "Check Cycle Test, Methods 2", t7
      ]
        
  let _ = 
    install_tests
      "Contract Parser Cycle Test"
      init

end
