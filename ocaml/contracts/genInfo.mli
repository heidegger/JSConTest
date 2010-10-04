(** Module that abstract over the information that is 
    attached to each contract. 

    @author: Phillip Heidegger *)

(** gen info stores some informations about a contract,
    e.g. if asserts should be generated or the 
    number of tests that should be generated to 
    check the contract. 
*)
type t 

(** create an info with default values *)
val create : unit -> t

(** generation of asserts is turned off *)
val noAsserts : t -> unit

(** generation of tests is turned off *)
val noTests : t -> unit

(** set number of tests *)
val setTestNumber : t -> int -> unit

(** set, if there exists effects for a contract *)
val setEffects : t -> bool -> unit

(** return if asserts are turned off/on *)
val getAsserts : t -> bool

(** returns if tests are turned off/on *)
val getTests : t -> bool

(** returns the number of tests *)
val getTestNumber : t -> int

(** returns if there exists effects for the contract *)
val getEffects : t -> bool

(** a string representation for the generation info *)
val string_of : t -> string
