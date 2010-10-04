(** Analyse annotations 
    @author: Phillip Heidegger
*)

(** annotations are of this type *)
type t =
  | Labels
  | Strings
  | Numbers


(** creates a string representation *)
val string_of : t -> string
