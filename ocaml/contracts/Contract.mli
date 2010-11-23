(** Contracts as attached to the AST 
    @author: Phillip Heidegger
*)

(** type of one contract *)
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

(** type of properties of objects *)
and ('b,'a,'dup,'ddown) property_list = (string * ('b,'a,'dup,'ddown) contract) list

(** abstract type for contracts, that are attached to functions *)
type ('b,'a,'dup,'ddown) t

(** creates a contract list from a list of contracts to attach 
    it to a function, and set the list of analyses to [[]].
*)
(* val create_t : ('b,'a,'d,'dd) contract list -> ('b,'a,'d,'dd) t *)

(** creates a contract list from a list of contracts to attach 
    it to a function, and set the list of analyses to [[]].
*)
val create_tgI : (('b,'a,'d,'dd) contract * GenInfo.t) list -> bool option -> ('b,'a,'d,'dd) t

val is_empty : ('b,'a,'d,'dd) t -> bool

(** similar to [create_t], but also sets the list of analyses *)
(* val create_t_al : ('b,'a,'d,'dd) contract list -> 'a list -> ('b,'a,'d,'dd) t *)

(** returns the contracts of an t *)
val get_cl : ('b,'a,'d,'dd) t -> ('b,'a,'d,'dd) contract list

(** returns the contracts of an t together with their assosiated genInfos. *)
val get_clgI : ('b,'a,'d,'dd) t -> (('b,'a,'d,'dd) contract * GenInfo.t) list


(** returns the analyses, that should be done for a t *)
val get_al : ('b,'a,'d,'dd) t -> 'a list

(** returns if the function should be transformed for
    using transactions. 
*)
val get_trans : ('b,'a,'d,'dd) t -> bool option

(** Takes a contraint and transforms it into a new one. 
    You have to specify how to transform base contracts
    into new ones, analyse data into new ones, depend up
    and depend down data into new one. You are allowed
    to change even the type of these for data attached
    to the constraints. 

    You also can provided functions that are called each
    time the corresponding part of the contract is visited.

*)
val transform : 
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

(** This visitor does not allow to change the polymorphic parameters
    of the contract, but do not need to provided any transform
    functions. 

    Hence use this version if you do not need to change the type
    of contracts. Use [transform], if you need to change the type.
*)
val visit : 
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


val transform_c :
  ?b_contract:(('b,'a,'dup,'ddown) contract -> ('b,'a,'dup,'ddown) contract) ->
  ?a_contract:(('b2,'a2,'dup2,'ddown2) contract -> ('b2,'a2,'dup2,'ddown2) contract) ->
  ba_bcontract:('b -> 'b2) ->
  ba_analyse:('a -> 'a2 ) ->
  ba_depend_up:('dup -> 'dup2 ) ->
  ba_depend_down:('ddown -> 'ddown2 ) ->
  ('b,'a,'dup,'ddown) contract -> ('b2,'a2,'dup2,'ddown2) contract



(** 
    This function takes a contract and raises informations
    about what analyses data should be generated for a
    contraint to top level, such that the generation
    method can use it to decide which data is needed. 
*)
val raise_analyse : ('b,'a,'d,'dd) t -> ('b,'a,'d,'dd) t

(** prints out a string representation of contracts attached to a funtion. *)
val string_of : ('b -> string) -> ('a -> string) -> ('d -> string) -> ('b,'a,'d,'ddown) t -> string

(** prints out a string representation of a contract list. *)
val so_contractl : ('b -> string) -> ('a -> string) -> ('d -> string) -> ('b,'a,'d,'ddown) contract list -> string

(** prints out a string representation of a contract. *)
val so_contract : ('b -> string) -> ('a -> string) -> ('d -> string) -> ('b,'a,'d,'ddown) contract -> string
