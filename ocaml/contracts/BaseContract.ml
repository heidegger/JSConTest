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
  | BObject
  | BId
  | BLength
  | BNatural  

let string_of = function
  | BUndf -> "undf"
  | BVoid -> "void"
  | BNull -> "null"
  | BTop -> "T"
  | BJavaScriptVar v -> "js:"^v
  | BSBool b -> if b then "true" else "false"
  | BBool -> "bool"
  | BString -> "string"
  | BSString s -> "\"" ^ s ^ "\""
  | BInteger -> "int"
  | BSInteger i -> string_of_int i
  | BIInterval (left,right) ->
      "[" ^ (string_of_int left) ^ ";" ^ (string_of_int right) ^ "]"
  | BFloat -> "float"
  | BSFloat f -> string_of_float f
  | BFInterval (left,right) ->
      "[" ^ (string_of_float left) ^ ";" ^ (string_of_float right) ^ "]"
  | BObject -> "object"
  | BId -> "id"
  | BLength -> "length"
  | BNatural -> "natural"
