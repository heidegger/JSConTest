(** Annotations of JavaScript AST. *)

(** Stores labels of elements of the AST. Should be unique. *)
type label

(** Stores the position of a character in the source file *)
type position     

type dimension 

(** The type of all elements annotation. It stores the
    label and the dimensions of the element in the source code. *)
type annotation
type t = annotation


(* sets filename, linenumber, collumn and absolut position *)
val create_position : string -> int -> int -> int -> position
val create_dimension : position -> position -> dimension
val create_annotation : dimension option -> t


val annotation_label : t -> label
val annotation_from_line : t -> position
val annotation_to_line : t -> position

(** creates a annotation with a unique label and the
    start position of the first argument (an annotation) 
    and end position of the second argument (another annotation) *)
val default_annotation : annotation -> annotation -> annotation
val null_annotation : annotation
val reset_default_annotation : unit -> unit
val string_of : ?really:bool -> annotation -> string



(* helper functions for parser *)
val different_line : annotation -> annotation -> bool
val string_of_starting_line : annotation -> string


(* helper for lexer *)
val set_ending : int -> annotation -> annotation
