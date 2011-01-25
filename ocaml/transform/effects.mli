open AST
open Trans

type t

val transform : t 
  -> bool option 
  -> 'c source_element list 
  -> 'c source_element list
val after_wrapper : t -> 'c identifier list -> 'c expression -> 'c expression
val before_wrapper : t -> 'c identifier list -> 'c expression -> 'c expression

val create_t :
  js_namespace:string ->
  variable_prefix:string ->
  propAcc:string ->
  propAss:string -> 
  mCall:string -> 
  fCall:string -> 
  unop:string ->
  unbox: string -> 
  fixObj: string -> 
  newCall: string -> t
