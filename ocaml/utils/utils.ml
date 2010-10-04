open ProglangUtils
open ExtList

let first nl v1 v2 =
  match List.index v1 nl,List.index v2 nl with
    | Some i1, Some i2 -> Some (i1 < i2)
    | _ -> None
          


