type t =
  | Labels
  | Strings
  | Numbers

let string_of = function
  | Labels -> "labels"
  | Strings -> "strings"
  | Numbers -> "numbers"
