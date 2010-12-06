(** Module that represents the Base Contracts.
    This means, Contracts that do not contain
    other contracts 

    @author: Phillip Heidegger
*)

(** a base contracts *)
type t =
  | BUndf
  | BVoid
  | BNull
  | BTop
  | BSBool of bool
  | BBool
  | BString
  | BSString of string
  | BInteger
  | BSInteger of int
  | BIInterval of int * int
  | BFloat
  | BSFloat of float
  | BFInterval of float * float
  | BJavaScriptVar of string
  | BJSCContract of string
  | BObject
  | BId
  | BLength
  | BNatural  

(** Creates a string representation for a base contract *)
val string_of : t -> string
