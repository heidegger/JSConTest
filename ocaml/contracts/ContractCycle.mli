(** Module to detect cyclic dependencys in contracts and
    to allow passing an order to the library, in wich
    the values should be generated to allow passing
    dependencies.

    @author: Phillip Heidegger
*)
    

(** graph, that is created for cycle dection *)
type t

(** type of a node in the graph *)
type v = (BaseContract.t, Analyse.t, Depend.t, unit) Contract.contract

(** Creates the graph and returns Some t if the contract is
    cycle free. Otherwise None is returned 
*)
val check : (BaseContract.t, Analyse.t, Depend.t, unit) Contract.t -> t option


(*
(** Takes a graph which is created by [check] and 
    a visitor function and traferses the graph 
    is topological order.
*)
val visit_in_order : t -> (v -> 'a -> 'a) -> 'a -> 'a list
*)

(** Returns for each t the list of orders, in which
    the contracts should be generated
*)
val get_order : t -> v list list
