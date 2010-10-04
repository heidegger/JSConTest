type t =
    { scope: int;
      parameter: int;
    }



let create s p = { scope = s; parameter = p }
let string_of { scope = s; parameter = p } =
  (String.make s '$') ^ (string_of_int p)

let get_scope { scope = s } = s
let get_param { parameter = p } = p
let raise_up t = {t with scope = t.scope - 1 }
