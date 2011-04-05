open ProglangUtils
open ExtList

type ('b,'a,'dup,'ddown) contract =
  | CBase of 'b * 'a list * 'dup list
  | CFunction of 
        ('b,'a,'dup,'ddown) contract option  (* this object *)
      * ('b,'a,'dup,'ddown) contract list  (* parameter list *)
      * ('b,'a,'dup,'ddown) contract     (* result *)
      * 'ddown                           (* information about dependency *)
      * Csseff.t                         (* effects *)
  | BObjectPL of ('b,'a,'dup,'ddown) property_list * bool * 'a list * 'dup list
  | BArray of ('b,'a,'dup,'ddown) contract
  | CUnion of ('b,'a,'dup,'ddown) contract list
and ('b,'a,'dup,'ddown) property_list = (string * ('b,'a,'dup,'ddown) contract) list

type ('b,'a,'dup,'ddown) t = 
    { clist: (('b,'a,'dup,'ddown) contract * GenInfo.t) list;
      alist: 'a list;
      transformation: bool option;
      function_name: string option;
    }

(* let set_effects_if_ness gi = function
  | CFunction (_,_,_,eff) ->
      if (not (Csseff.is_empty eff)) then
        GenInfo.setEffects gi true
  | _ -> ()
*)
  
(* let creategI cl = List.map (fun c -> c,GenInfo.create ()) cl *)

let create_tgI_fno clgI al trans fno = 
  { clist= clgI; alist= al; transformation= trans; function_name= fno; }

let create_tgI_fn clgI trans fn = 
  create_tgI_fno clgI [] trans (Some fn)

(* let create_tgI_al_trans clgI al trans = create_tgI_fno clgI al trans None *)

(* let create_tgI clgI trans = create_tgI_al_trans clgI [] trans *)
(* let create_t cl = create_tgI_al_trans (creategI cl) [] None *)


let get_clgI { clist=clgI } = clgI
let get_cl { clist=clgI } = List.map fst clgI
let get_al { alist=al } = al
let get_trans { transformation = trans } = trans
let get_name { function_name = fn } = fn

let rec so_contractl so_b so_a so_d cl = 
  let s = 
    let s = String.concat ", " (List.map (so_contract so_b so_a so_d) cl) in
      if (List.length cl > 1) then
        "(" ^ s ^ ")"
      else
        s
  in
    "{" ^ s ^ "}"

and so_al so_a = function
  | [] -> ""
  | al -> String.concat "" (List.map so_a al)
and so_dl so_d = function 
  | [] -> ""
  | dl -> "("^(String.concat "," (List.map so_d dl))^")"
and so_contract so_b so_a so_d = function
  | BArray c -> 
      "[" ^ (so_contract so_b so_a so_d c) ^ "]"
  | CBase (bc,al,dl) -> 
      (so_b bc)
      ^(so_al so_a al)
      ^(so_dl so_d dl)
  | BObjectPL (pl,rand,al,dl) -> "{" ^ 
      (String.concat ", " 
         (List.map (fun (p,c) -> p ^ ": " ^ so_contract so_b so_a so_d c) pl))
      ^(if (rand) then ", ... " else "")
      ^ "}"
      ^(so_al so_a al)
      ^(so_dl so_d dl)
  | CFunction (th,cl,c,_,eff) -> 
      
let effs = Csseff.string_of eff in
      let this = match th with
        | None -> ""
        | Some o -> so_contract so_b so_a so_d o
      in
	this ^ "{" ^ so_contractl so_b so_a so_d cl 
	^ " -> " ^ so_contract so_b so_a so_d c 
      	^ (if (String.length effs > 0) then " " ^ effs else "")
      	^ "}"
  | CUnion (cl) ->
     let cl = List.map (so_contract so_b so_a so_d) cl in
     let cls = String.concat " or " cl in
       "(" ^ cls  ^ ")"

let so_contract_gI so_b so_a so_d (c,gI) =
  so_contract so_b so_a so_d c ^ GenInfo.string_of gI

let string_of so_b so_a so_d { clist= cl; alist= al; transformation = trans } =
  "/** " ^ (String.concat 
              "\n|" 
              (List.map (so_contract_gI so_b so_a so_d) cl))
    ^ (match trans with
         | None -> ""
         | Some true -> " ~effects"
         | Some false -> " ~noeffects")
  ^ " */"


let id x = x
let id2 x = x
let transform :
  ?b_t:(('b,'a,'dup,'ddown) t -> ('b,'a,'dup,'ddown) t) ->
  ?a_t:(('b2,'a2,'dup2,'ddown2) t -> ('b2,'a2,'dup2,'ddown2) t) ->
  ?b_tcontract:(('b,'a,'dup,'ddown) contract -> ('b,'a,'dup,'ddown) contract) ->
  ?a_tcontract:(('b2,'a2,'dup2,'ddown2) contract -> ('b2,'a2,'dup2,'ddown2) contract) ->
  ?b_contract:(('b,'a,'dup,'ddown) contract -> ('b,'a,'dup,'ddown) contract) ->
  ?a_contract:(('b2,'a2,'dup2,'ddown2) contract -> ('b2,'a2,'dup2,'ddown2) contract) ->
  ba_bcontract:('b -> 'b2) ->
  ba_analyse:('a -> 'a2 ) ->
  ba_depend_up:('dup -> 'dup2 ) ->
  ba_depend_down:('ddown -> 'ddown2 ) ->
  ('b,'a,'dup,'ddown) t -> ('b2,'a2,'dup2,'ddown2) t
  = fun 
    ?(b_t=id) ?(a_t=id)
    ?(b_tcontract=id) ?(a_tcontract=id)
    ?(b_contract=id) ?(a_contract=id)
    ~ba_bcontract:ba_bcontract
    ~ba_analyse:ba_analyse
    ~ba_depend_up:ba_depend_up
    ~ba_depend_down:ba_depend_down
    t ->
  let rec visit_t : ('b,'a,'dup,'ddown) t -> ('b2,'a2,'dup2,'ddown2) t = fun t ->
    let t =
      match b_t t with
        | { clist= cl_gI; 
	    alist= al; 
	    transformation = trans; 
	    function_name=fn
	  } ->
            let cl,gI = List.split cl_gI in
            let cl = List.map visit_tc cl in
            let al = List.map ba_analyse al in
              { clist = List.combine cl gI; 
		alist = al; 
		transformation = trans; 
		function_name= fn; }
    in
      a_t t

  and visit_tc : ('b,'a,'dup,'ddown) contract -> ('b2,'a2,'dup2,'ddown2) contract = fun c ->
    let c = visit_c (b_tcontract c) in
      a_tcontract c
    
  and visit_c : ('b,'a,'dup,'ddown) contract -> ('b2,'a2,'dup2,'ddown2) contract = fun c ->
    let c = 
      match b_contract c with
        | BArray c ->
            let c = visit_c c in
              BArray c
        | CBase (bc,al,dl) -> 
            let bc = ba_bcontract bc in
            let al = List.map ba_analyse al in
            let dl = List.map ba_depend_up dl in
              CBase (bc,al,dl)
        | CFunction (th,cl,c,ddown,eff) -> 
            let th = match th with 
              | None -> None
              | Some o -> Some (visit_c o) in
            let cl = List.map visit_c cl in
            let c = visit_c c in
            let ddown = ba_depend_down ddown in
              CFunction (th,cl,c,ddown,eff)
        | CUnion (cl) ->
          let cl = List.map visit_c cl in
            CUnion cl
        | BObjectPL (pl,r,al,dl) ->
            let pl = visit_pl pl in
            let al = List.map ba_analyse al in
            let dl = List.map ba_depend_up dl in
              BObjectPL (pl,r,al,dl)
    in
      a_contract c
  and visit_pl : ('b,'a,'dup,'ddown) property_list -> ('b2,'a2,'dup2,'ddown2) property_list = fun pl ->
    List.map
      (fun (p,c) -> (p,visit_c c))
      pl
  in
    visit_t t

let visit :
  ?b_t:(('b,'a,'dup,'ddown) t -> ('b,'a,'dup,'ddown) t) ->
  ?a_t:(('b,'a,'dup,'ddown) t -> ('b,'a,'dup,'ddown) t) ->
  ?b_tcontract:(('b,'a,'dup,'ddown) contract -> ('b,'a,'dup,'ddown) contract) ->
  ?a_tcontract:(('b,'a,'dup,'ddown) contract -> ('b,'a,'dup,'ddown) contract) ->
  ?b_contract:(('b,'a,'dup,'ddown) contract -> ('b,'a,'dup,'ddown) contract) ->
  ?a_contract:(('b,'a,'dup,'ddown) contract -> ('b,'a,'dup,'ddown) contract) ->
  ?ba_bcontract:('b -> 'b) ->
  ?ba_analyse:('a -> 'a) ->
  ?ba_depend_up:('dup -> 'dup) ->
  ?ba_depend_down:('ddown -> 'ddown) ->
  ('b,'a,'dup,'ddown) t -> ('b,'a,'dup,'ddown) t
  = fun 
    ?(b_t=id) ?(a_t=id)
    ?(b_tcontract=id) ?(a_tcontract=id)
    ?(b_contract=id) ?(a_contract=id)
    ?(ba_bcontract=id2)
    ?(ba_analyse=id2)
    ?(ba_depend_up=id2)
    ?(ba_depend_down=id2)
    t ->
      transform 
        ~b_t:b_t ~a_t:a_t 
        ~b_tcontract:b_tcontract ~a_tcontract:a_tcontract
        ~b_contract:b_contract ~a_contract:a_contract
        ~ba_bcontract:ba_bcontract
        ~ba_analyse:ba_analyse
        ~ba_depend_up:ba_depend_up
        ~ba_depend_down:ba_depend_down
        t

let transform_c :
  ?b_contract:(('b,'a,'dup,'ddown) contract -> ('b,'a,'dup,'ddown) contract) ->
  ?a_contract:(('b2,'a2,'dup2,'ddown2) contract -> ('b2,'a2,'dup2,'ddown2) contract) ->
  ba_bcontract:('b -> 'b2) ->
  ba_analyse:('a -> 'a2 ) ->
  ba_depend_up:('dup -> 'dup2 ) ->
  ba_depend_down:('ddown -> 'ddown2 ) ->
  ('b,'a,'dup,'ddown) contract -> ('b2,'a2,'dup2,'ddown2) contract
  = fun 
    ?(b_contract=id) ?(a_contract=id)
    ~ba_bcontract:ba_bc 
    ~ba_analyse:ba_an 
    ~ba_depend_up:ba_du 
    ~ba_depend_down:ba_dd
    c
    ->
      let t = 
        transform
          ~b_contract:b_contract ~a_contract:a_contract
          ~ba_bcontract:ba_bc
          ~ba_analyse:ba_an
          ~ba_depend_up:ba_du
          ~ba_depend_down:ba_dd
          { clist = [c,GenInfo.create ()]; alist = []; 
	    transformation = None; 
	    function_name= None; }
      in
        match t with
          | { clist = [c,_]; alist = []; transformation = None } -> c
          | _ -> failwith "This can not happen"

let raise_analyse : ('b,'a,'dup,'ddown) t -> ('b,'a,'dup,'ddown) t = fun tc ->
  let al = ref [] in
  let b_c = function
    | CBase (_,alc,depl) as c ->
        al := List.union !al alc;
        c
    | c -> c
  in
  let a_tc tc = 
    let cl = get_clgI tc in
    let trans = get_trans tc in
    let fn = get_name tc in
    let tc = create_tgI_fno cl !al trans fn in
      al := [];
      tc
  in
  let tc = visit 
    ~b_contract:b_c
    ~a_t:a_tc
    tc 
  in
    tc

let is_empty = function
  | { clist = [] } -> true
  | _ -> false
