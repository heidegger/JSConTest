type label = int 
type position = {
    filename:string;
    line:int;
    collumn:int;
    absolute:int
  } 
type dimension = {
  starting : position ;
  ending : position 
}
type annotation = {
  label : label ; 
  dimension : dimension option 
}
type t = annotation

(* labels should be unqui, so use internal couter *)
let id = ref 0
let new_id () =
  let old_id = !id in
    incr id;
    old_id


let create_position fn line collumn absolute =
  {filename = fn;
   line = line;
   collumn = collumn;
   absolute = absolute;
  }

let create_dimension start_pos end_pos =
    {starting = start_pos; ending = end_pos}
let create_annotation dimension =
  {label = new_id (); dimension = dimension }



let annotation_label = function
    {label=label} -> label

let annotation_from_line = function
    {dimension = Some {starting=starting}} -> starting
  | _ -> failwith "generated node has no from-line"
      

let annotation_to_line = function
    {dimension = Some {ending=ending}} -> ending
  | _ -> failwith "generated node hast no to-line"



(* needed for parser *)
let different_line a1 a2 = 
  match a1,a2 with
      ({dimension = Some ({starting={filename=fil';line=lin'}})} , 
      {dimension = Some ({ending={filename=fil'';line=lin''}})}) ->
        if fil'=fil'' 
        then begin if lin'=lin'' then false else true end 
        else false
    | _ -> false
(* needed for parser *)
let string_of_starting_line = function
    {dimension = Some ({starting={line=lin}})} -> string_of_int lin
  | _ -> "GENERATED"


let set_ending length = function
    {dimension = Some ({starting = starting} as dim)} as ann ->
      let c = starting.collumn + length in 
      let s = {starting with collumn=c} in 
      let dim = Some {dim with ending = s} in
        {ann with dimension = dim}
  | _ -> failwith "set_ending"


let default_annotation,reset_default_annotation,generated_annotation = 
  let id = ref 0 in
  let reset () = id := 0
  and default a1 a2 =  
    let this_id = !id
    in incr id ; 
       match (a1,a2) with
           {dimension=Some{starting=starting}},
           {dimension=Some{ending=ending}} ->
             {
               label = this_id ;
               dimension = Some { starting=starting ; ending=ending } 
             }
         | _ -> 
             {
               label = this_id ; 
               dimension = None 
             }
  and generated = fun () ->
        let this_id = !id in
          incr id ;
          {
            label = this_id ;
            dimension = None ;
          }
  in default,reset,generated

let null_annotation = 
  {
    label=0 ;
    dimension = Some 
      {
        starting={filename="";line=0;collumn=0;absolute=0} ;
        ending={filename="";line=0;collumn=0;absolute=0} 
      } 
  }


(* for still better readability the so means string_of
   and a means annotation, therefore soa means 
   string_of_annotation *)
let string_of ?(really=false) =
  let sop p =
    let soi i = 
      let a = if i < 10 then "0" else "" in
        a ^ string_of_int i 
    in
      soi p.line ^ "." ^ soi p.collumn 
  in
  let so_dimension = function
      None -> "<GENERATED>"
    | Some {starting=s;ending=e} ->
        (if s.filename = ""
         then "" 
         else s.filename ^ " ") ^ 
          (sop s) ^ " - " ^ (sop e)
  in
    if really 
    then function ann ->
      "[" ^ (so_dimension ann.dimension) ^ "]" 
        
        
    else function _ -> ""
