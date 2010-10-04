(** author: Phillip Heidegger *)

module Key : sig type t = int val compare : 'a -> 'a -> int end
module Image : sig type t = int val compare : 'a -> 'a -> int end
module H :
  sig
    type key = Key.t
    type img = Image.t
    type t = ProglangUtils.OwnMap.Make(Key)(Image).t
    val empty : t
    val is_empty : t -> bool
    val add : key -> img -> t -> t
    val find : key -> t -> img
    val remove : key -> t -> t
    val mem : key -> t -> bool
    val iter : (key -> img -> unit) -> t -> unit
    val map : (img -> img) -> t -> t
    val mapi : (key -> img -> img) -> t -> t
    val fold : (key -> img -> 'a -> 'a) -> t -> 'a -> 'a
    val compare : t -> t -> int
    val equal : t -> t -> bool
    val add' : key -> img option -> t -> t
    val find' : key -> t -> img option
    val add_list : (key * img) list -> t -> t
    val to_list : t -> (key * img) list
    val from_list : (key * img) list -> t
    val map_to_list : (key -> img -> 'a) -> t -> 'a list
    val mapi_and_map_to_list : (key -> img -> img * 'a) -> t -> t * 'a list
    val domain : t -> key list
    val fold_two :
      (key -> img option -> img option -> 'a -> 'a) -> 'a -> t -> t -> 'a
    val restrict : key list -> t -> t
  end
