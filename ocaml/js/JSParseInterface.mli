open Utf16


exception JSParseError
type encoding = Regular of Ulexing.enc | EUtf16 of byte_order option
val string_of_encoding : encoding -> string


val next_lexeme : LexingOwn.lexbuf -> JSParse.token
val set_location : string -> int -> int -> int -> unit
val parse_program : in_channel -> encoding -> string AST.program

val parse_selts : in_channel -> encoding -> string AST.source_element list
val parse_statems : in_channel -> encoding -> string AST.statement list

(** [std_parse filename] opens the file and parses the contens 
    as a javascript program. *)
val std_parse : string -> string AST.source_element list

