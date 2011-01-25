(** Module that rewrites the AST to insert calls for directing write
    access to global vars, object fields, and calls to functions.
    @author Annette Bieniusa
*)

open AST
open TCJS

type t

(** This method transforms method calls and assignments in
    the code under test. This allows to track side effects 
    and to revert them after the test case is finished. 
    
    [do_transactify env isFree prog] transforms the program
    [prog]. 

    [env] passes information about the javascript library.
    [txn] is the name of the global identifier of the library.
    [propAss] is the name of the property (of the library) that 
    is used to assign properties of objects.
    [mCall] is the name of the property (of the library) that 
    is used to do method calls.

    [isFree] is a function which is used to distingish between
    local and global variables. 
*)
val transform : t 
  -> bool option
  -> 'c source_element list 
  -> 'c source_element list

val before_wrapper : t -> 'c identifier list -> 'c expression -> 'c expression
val after_wrapper : t -> 'c identifier list -> 'c expression -> 'c expression

val create_t : 
  js_namespace: string
  -> variable_prefix: string
  -> pushUndo: string
  -> propAcc: string
  -> propAss: string
  -> mCall: string
  -> newObj: string
  -> trackReads: bool
  -> t
