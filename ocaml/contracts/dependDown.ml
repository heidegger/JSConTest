open ProglangUtils
open ExtList
open String_of

type t = 
    {
      mutable paramnr: int;
      mutable order: int list option;
      mutable depend: Depend.t list list;
    }

let create : unit -> t = 
  fun () -> { order = None; paramnr = 0; depend = [] }

let set_order t o = 
  t.order <- Some o

let set_paramnr t i = 
  t.paramnr <- i

let register_dinfo t dll =
  (* print_endline (string_of_list (string_of_list Depend.string_of) dll); *)
  if (List.length dll == t.paramnr) 
  then t.depend <- dll
  else failwith "Wrong number of dependencies"

let get_dul t = 
  List.fold_left
    (fun dul pl -> List.fold_left (fun dul p -> List.add p dul) dul pl)
    []
    t.depend


let is_depend t =
  (* print_endline (string_of_list (string_of_list Depend.string_of) t.depend); *)
  (not (List.for_all (fun l -> List.length l == 0) t.depend))
    
let get_depend t = List.rev t.depend
let get_order t = match t.order with
  | None -> failwith "No Order"
  | Some o -> o
