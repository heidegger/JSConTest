open ProglangUtils

module Key = struct
  type t = int
  let compare = compare
end

module Image = struct
  type t = int
  let compare = compare
end

module H = OwnMap.Make(Key)(Image)

