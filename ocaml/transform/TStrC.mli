(** Transforms and compile contracts. 
    @author: Phillip Heidegger
    
*)

open AST

(** [parse p] transforms [p]
    such that the result do not contain contracts in
    string represantion. 
*)
val parse : string program -> 
  (BaseContract.t, Analyse.t,Depend.t,unit) Contract.t program
