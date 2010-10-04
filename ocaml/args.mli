(** Module to interact with command line parameters. 
    @author: Phillip Heidegger
*)

(** inforations passed by parameters, if program runs
    in normal mode 
*)
type normal = {
  input_filename: string;
  output_filename: string;
}

(** If program runs in test mode, this information is
    passed from the command line
*)
type test = unit

(** type to distingish between normal mode and test mode *)
type arg = 
    Normal of normal
  | Test of test

(** parse the command line arguments *)
val parse : unit -> arg
