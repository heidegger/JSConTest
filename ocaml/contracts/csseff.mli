type effect =
  | Parameter of int
  | Var of string
  | This
  | RegExVar of string

  | Prop of effect * string
  | Star of effect
  | Question of effect
  | NoProp of effect
  | RegExProp of effect * string  

  | StarProp of effect * string
  | StarRegExProp of effect * string

  | Js of string   
  | RegEx of string
 
type t 
type ('a,'b) either =
    Left of 'a
  | Right of 'b

val create : unit -> t
val create_all : unit -> t
val create_none : unit -> t
val create_effect_list : effect list -> t
val create_effect_list_neg : effect list -> effect list -> t
val get_effects : t -> effect list
val map : (effect -> 'a) -> (effect -> 'b) -> (unit -> 'c) -> t -> ('a list * 'b list,'c) either
val is_empty : t -> bool

val string_of : t -> string
