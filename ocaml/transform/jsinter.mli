(** javascript interface of the transaction library *)

type t = {
  propAss : string;
  mCall : string; 
  newObj : string; 
  pushUndo : string;
  propAcc : string;
  js_namespace : string;
}
