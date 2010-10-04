(** @author: Phillip Heidegger *)

(** stores informations for the DependDown modul *)
type t

(** Creates an empty DependDown information. *)
val create : unit -> t

(** checks if there is a need to pass dependency and order
    information to the contract.

    If this function returns [true], [DFunction] is used in
    the compliled code. Otherwise, [Function] is used.
*)
val is_depend : t -> bool

(** sets the order of the parameters *)
val set_order : t -> int list -> unit

(** sets the number of parameters (including result) *)
val set_paramnr : t -> int -> unit

(** get the list of dependencys, from which the function itself
    depends. *)
val get_dul : t -> Depend.t list

(** sets the dependency information for a function *)
val register_dinfo : t -> Depend.t list list -> unit

(** returns the order for a function *)
val get_order : t -> int list

(** returns the dependency informations for a function *)
val get_depend : t -> Depend.t list list
