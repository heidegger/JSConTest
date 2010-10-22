open AST
open Trans

type t

val transform : t 
  -> bool option 
  -> 'c identifier list 
  -> 'c source_element list 
  -> 'c source_element list


val create_t :
  js_namespace:string ->
  variable_prefix:string ->
  propAcc:string ->
  propAss:string -> 
  mCall:string -> 
  unop:string ->
  box_var : string ->
  box_param: string -> 
  box_this: string -> 
  unbox: string -> t
