(** Module that transforms CssEffects into JavaScript *)

(** Complies an Css effect into a JavaScript expression *)
val js_of_t : string -> Csseff.t -> 'a AST.expression
