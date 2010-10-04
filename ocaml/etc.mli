(** JavaScript Environment Informations.

    Module that stores information about the 
    JavaScript Environment.
    The {i Test Namespace} is the name of the object,
    that the JavaScript Test Libary exports. 

    @author: Phillip Heidegger
*)

(** Function to get the test namespace, Default: 'PROGLANG.tests' *)
val get_javascript_test_namespace : unit -> string

(** Function to set the test namespace. *)
val set_javascript_test_namespace : string -> unit


(** Function to get the transaction namespace, Default: 'PROGLANG.trans' *)
val get_javascript_trans_namespace : unit -> string

(** Function to set the transaction namespace. *)
val set_javascript_trans_namespace : string -> unit

(** Function to get the effect namespace, Default: 'PROGLANG.effect' *)
val get_javascript_effect_namespace : unit -> string

(** Function to set the effect namespace. *)
val set_javascript_effect_namespace : string -> unit


(** The number determens how many tests should
    be generated for each contract. *)
val set_test_count : int -> unit

(** The number determens how many tests should
    be generated for each contract. *)
val get_test_count : unit -> int

(** The prefix for the global scope in the Test
    libary, that is used for generated global
    variables, e.g. each contract is stored 
    inside of this scope to allow asserts.

    By default the compiler generates 3000 random
    bits and computes an md5 hash for them. The
    result is represended as a hex value, prefixed
    by an "g". This result is then used as a prefix. Please 
    not that this results in generation of a random prefix 
    each time a file is compiled. If you like to 
    have a deterministic prefix, e.g. if you
    would like to access the contract in the global
    scope in our own code, please make use of
    command line options to set the prefix to a 
    fixed value.
*)
val set_prefix : string -> unit


(** The prefix for the global scope in the Test
    libary, that is used for generated global
    variables, e.g. each contract is stored 
    inside of this scope to allow asserts 
*)
val get_prefix : unit -> string


(** Use this function to configure, if test cases should
    be created by the compiler. 
*)
val set_generate_tests : bool -> unit


(** Returns if the compiler should genereate test cases. *)
val get_generate_tests : unit -> bool

(** Use this function to configure, if function code should
    be enrished with asserts, to ensure that contracts
    are fulfilled. 
*)
val set_generate_asserts : bool -> unit 

(** Retuns if the compiler should introduce asserts *)
val get_generate_asserts : unit -> bool


(** Use this function to configure, if the code under
    test should be rewritten, such that assignments to
    properties and method calls are rewritten in a manner,
    that each effect is logged. It will be reverted later
    after the test case is finised. 
*)
val set_effect_state : Effect.t -> unit

(** Retuns if the compiler should use transactions. *)
val get_effect_state  : unit -> Effect.t

(** Configures if the code under test should be
    rewritten, such that all write operations are
    valid with respect to the effects attached to
    function contracts.
*)
val set_css_effect_observation : bool -> unit

(** Returns if the code under test should be rewritten,
    such that all write operations are valid with
    respect to the effects attached to function
    contracts. 
*)
val get_css_effect_observation : unit -> bool


(** Configures if the code under test should be
    rewritten, such that all write operations are
    valid with respect to the effects attached to
    function contracts.
*)
val set_effect_observation : bool -> unit

(** Returns if the code under test should be rewritten,
    such that all write operations are valid with
    respect to the effects attached to function
    contracts. 
*)
val get_effect_observation : unit -> bool


(** The local_scope_prefix is used to implement lets
    in contracts. Compare set_prefix.
    
    Instead of "g" the hash is prefixed by "lc" to
    avoid conflicts between the two scopes. 
*)
val set_local_scope_prefix : string -> unit


(** The prefix for the global scope in the Test
    libary, that is used for generated global
    variables, e.g. each contract is stored 
    inside of this scope to allow asserts 
*)
val get_local_scope_prefix : unit -> string


(** Prints the version of the program and exits *)
val print_version : unit -> unit
