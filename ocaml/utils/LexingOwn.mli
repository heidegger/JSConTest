
type position = int
type lexbuf = Ulexing.lexbuf
val dummy_pos : int
val get_start_pos : lexbuf -> int
val get_current_pos : lexbuf -> int
val get_position_cnum : 'a -> 'a
val get_current_location : lexbuf -> int * int
val lexeme_length : lexbuf -> int
val utf8_lexeme : lexbuf -> string
val from_channel : in_channel -> lexbuf
val flush_input : 'a -> unit
