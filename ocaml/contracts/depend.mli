(** Stores dependencies between values 
    @author: Phillip Heidegger
*)

(** a dependency *)
type t

(** [create scope parameter] 
    creates a new value of type t that
    represents a dependency from a contract value
    that you get, when you go [scope] arrows
    up, and choose the parameter with number
    [parameter]. 
    Hence [create 1 1] is equal to $1, and
    [create 2 3] to $$3.
*)
val create : int -> int -> t

(** returns the string of a scope *)
val string_of : t -> string

(** returns the number of $ in the dependency *)
val get_scope : t -> int

(** returns the paramter number *)
val get_param : t -> int

val raise_up : t -> t
