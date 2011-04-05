module Test = struct

  open Etc
  open AST
  open Annotation
  open ProglangUtils
  open ExtList
  open Contract
  open BaseContract
  open Test    

  let init () =
    let parse s =
      (ContractParse.contractl_top ContractLexer.token 
           (Ulexing.from_utf8_string s))
    in
    let b_to_c b = CBase (b,[],[]) in
    let cnull = b_to_c BNull in
    let ctop = b_to_c BTop in
    let ci = b_to_c BInteger in
    let cundf = b_to_c BUndf in
    let csb b = b_to_c (BSBool b) in
    let cb = b_to_c BBool in
    let cs = b_to_c BString in
    let b_to_c_dep b depl = CBase (b,[],depl) in
    let create_tgI a b = Contract.create_tgI_fn
      a 
      b
      ""
    in

    let tc_fun pl r = create_tgI 
      [CFunction (None,pl,r,(),Csseff.create ()),
       GenInfo.create ()]
      (None) 
    in
    let tc_cl cl = create_tgI 
      (List.map (fun c -> (c,GenInfo.create ())) cl)
      (None)
    in

    let so_t = Contract.string_of 
      BaseContract.string_of 
      Analyse.string_of 
      Depend.string_of
    in

    let t1 () =
      let s = "/*c int -> int */" in
      let tc = parse s in
        assert_equal
          ~printer:so_t
          (tc_cl [CFunction (None,[ci],ci,(),Csseff.create ())])
          tc;
        match Contract.get_clgI tc with
          | [c,gi] -> 
              assert_bool
                "Effects does not exists, but GenInfo.getEffects returns true"
                (not (GenInfo.getEffects gi))
          | _ -> assert_failure "get_clgI does not work correct"
    in
    let t1a () =
      let s = "/*c () -> undefined */" in
      let tc = parse s in
        assert_equal
          ~printer:so_t
          (tc_cl [CFunction (None,[],cundf,(),Csseff.create ())])
          tc;
        match Contract.get_clgI tc with
          | [c,gi] -> 
              assert_bool
                "Effects does not exists, but GenInfo.getEffects returns true"
                (not (GenInfo.getEffects gi))
          | _ -> assert_failure "get_clgI does not work correct"
    in
    let t2 () =
      let s = "/*c (true,false) -> bool */" in
      let tc = parse s in
        assert_equal
          ~printer:so_t
          (tc_fun [csb true; csb false] cb)
          tc
    in
    let t3 () =
      let s = "/*c (int -> int, int) -> \"bla\" */" in
      let tc = parse s in
        assert_equal 
          ~printer:so_t
          (tc_fun 
             [CFunction (None,[ci],ci,(),Csseff.create ());ci]
             (b_to_c (BSString "bla"))
          )
          tc;
        match Contract.get_clgI tc with
          | [c,gi] -> 
              assert_bool
                "Effects does not exists, but GenInfo.getEffects returns true"
                (not (GenInfo.getEffects gi))
          | _ -> assert_failure "get_clgI does not work correct"

    in
    let t4 () =
      let s = "/*c */" in
      let tc = parse s in
        assert_equal
          ~printer:so_t
          (tc_cl [])
          tc

    in
    let t5 () =
      let s = "/*c int -> int -> int */" in
      let tc = parse s in
        assert_equal 
          ~printer:so_t
          (tc_fun [ci] (CFunction (None,[ci],ci,(),Csseff.create ())))
          tc
    in
    let t6 () =
      let s = "/*c (false,bool) -> (true-> string) */" in
      let tc = parse s in
        assert_equal
          ~printer:so_t
          (tc_fun [csb false; cb] 
             (CFunction (None,[csb true],cs,(),Csseff.create ())) )
          tc
    in
    let t7 () =
      let s = "/*c (int@numbers, js:intn@numbers) -> bool */" in
      let tc = parse s in
        assert_equal
          ~printer:so_t
          (tc_fun 
             [CBase (BInteger,[Analyse.Numbers],[]);
              CBase (BJavaScriptVar "intn",[Analyse.Numbers],[])] 
             cb)
          tc
    in
    let t8 () =
      let s = "/*c int -> bool($$3) | true($$$13) -> false($1) */" in
      let tc = parse s in
        assert_equal
          ~printer:so_t
          (tc_cl 
             [CFunction (None,[ci],CBase (BBool,[],[Depend.create 2 3]),
                         (),Csseff.create ()); 
              CFunction (None,[b_to_c_dep (BSBool true) [Depend.create 3 13]],
                         b_to_c_dep (BSBool false) 
                           [Depend.create 1 1],(),Csseff.create ())])
          tc
    in


    let t9 () =
      let s = "/*c (int,int($1)) -> bool($2) */" in
      let tc = parse s in
        assert_equal
          ~printer:so_t
          (tc_fun 
             [ci; b_to_c_dep BInteger [Depend.create 1 1]]
             (b_to_c_dep BBool [Depend.create 1 2]))
          tc

    in
    let t10 () =
      let s = "/*c { name : int } -> int */" in
      let tc = parse s in
        assert_equal
          ~printer:so_t
          (tc_fun
             [BObjectPL (["name",ci],false,[],[])]
             ci)
          tc
    in
    let t11 () =
      let s = "/*c { name : 1, contract1: {getCount: int -> int} } -> object */" in
      let tc = parse s in
        assert_equal
          ~printer:so_t
          (tc_fun
             [BObjectPL 
                (["name",b_to_c (BSInteger 1);
                  ("contract1",
                   BObjectPL (["getCount", 
                               CFunction (None,[ci],ci,(),Csseff.create ())],
                              false,
                              [],
                              [])
                  )],
                 false,
                 [],
                 [])]
             (b_to_c BObject))
          tc
    in
    let t12 () =
      let s = "/*c int -> int ~noAsserts | int -> bool #Tests:10 */" in 
      let c1 = CFunction (None,[ci],ci,(),Csseff.create ()) in
      let c2 = CFunction (None,[ci],cb,(),Csseff.create ()) in
      let gi1,gi2 = GenInfo.create (),GenInfo.create () in
      let _ = GenInfo.noAsserts gi1 in
      let _ = GenInfo.setTestNumber gi2 10 in
      let tc = parse s in
        assert_equal
          ~printer:so_t
          (create_tgI [c1,gi1; c2,gi2] None)
          tc
    in
    let t13 () =
      let s = "/*c { name: int, ...} -> object */" in
      let tc = parse s in
        assert_equal
          ~printer:so_t
          (tc_fun 
             [BObjectPL (["name",ci],true,[],[])]
             (b_to_c BObject))
          tc;
        match Contract.get_clgI tc with
          | [c,gi] -> 
              assert_bool
                "Effects does not exists, but GenInfo.getEffects returns true"
                (not (GenInfo.getEffects gi))
          | _ -> assert_failure "get_clgI does not work correct"
    in
    let t14 () =
      let s = "/*c {a:int} -> int  with [ $1.a ] */" in
      let tc = parse s in
        assert_equal
          ~printer:so_t
          (tc_cl [CFunction (None,[BObjectPL (["a",ci],false,[],[])],ci,(),
			     Csseff.create_effect_list ([
							Csseff.Prop(Csseff.Parameter 1,"a")
						      ]))])
          tc;
        match Contract.get_clgI tc with
          | [c,gi] -> 
              assert_bool
                "#noEffects does not exists, but GenInfo.getEffects returns true"
                (not (GenInfo.getEffects gi))
          | _ -> assert_failure "get_clgI does not work correct"

    in 
    let t15 () =
      let s = "/*c {b:int} -> int  with [ $1.b ] */" in
      let tc = parse s in
        assert_equal
          ~printer:so_t
          (tc_cl [CFunction (None,[BObjectPL (["b",ci],false,[],[])],ci,(),
			     Csseff.create_effect_list ([
							Csseff.Prop(Csseff.Parameter 1,"b")
						      ]))])
          tc;
        match Contract.get_clgI tc with
          | [c,gi] -> 
              assert_bool
                "#noEffects does not exists, but GenInfo.getEffects returns true"
                (not (GenInfo.getEffects gi))
          | _ -> assert_failure "get_clgI does not work correct"
              
    in 
    let t16 () =
      let s = "/*c {a:int, b:int} -> int  with [ $1.b, $1.a ] */" in
      let tc = parse s in
        assert_equal
          ~printer:so_t
          (tc_cl [CFunction 
                    (None,
                     [BObjectPL ([("a",ci);("b",ci)],false,[],[])],ci,(),
			         Csseff.create_effect_list 
                       ([Csseff.Prop(Csseff.Parameter 1,"b");
						 Csseff.Prop(Csseff.Parameter 1,"a")
						]))])
          tc;
        match Contract.get_clgI tc with
          | [c,gi] -> 
              assert_bool
                "#noEffects exists, but GenInfo.getEffects returns true"
                (not (GenInfo.getEffects gi))
          | _ -> assert_failure "get_clgI does not work correct"
    in 
    let t17 () =
      let s = "/*c object -> int  with [ $1.a.?.c ] */" in
      let tc = parse s in
        assert_equal
          ~printer:so_t
          (tc_cl [CFunction (None,[b_to_c BObject],ci,(),
			     Csseff.create_effect_list 
                   ([Csseff.Prop 
                       (Csseff.Question 
                          (Csseff.Prop (Csseff.Parameter 1,"a")),"c")
					]))])
          tc;
        match Contract.get_clgI tc with
          | [c,gi] -> 
              assert_bool
                "#noEffects does not exists, but GenInfo.getEffects returns true"
                (not (GenInfo.getEffects gi))
          | _ -> assert_failure "get_clgI does not work correct"
    in 
    let t18 () =
      let s = "/*c object -> int  with [ $1.a.* ] */" in
      let tc = parse s in
        assert_equal
          ~printer:so_t
          (tc_cl [CFunction (None,[b_to_c BObject],ci,(),
			     Csseff.create_effect_list 
                   ([Csseff.Star (Csseff.Prop (Csseff.Parameter 1,"a"))
					]))])
          tc;
        match Contract.get_clgI tc with
          | [c,gi] -> 
              assert_bool
                "#noEffects does not exists, but GenInfo.getEffects returns true"
                (not (GenInfo.getEffects gi))
          | _ -> assert_failure "get_clgI does not work correct"
    in 
    let t19 () =
      let s = "/*c {a:int}.(int) -> int */" in
      let th = BObjectPL (["a",ci],false,[],[]) in
      let tc = parse s in
        assert_equal
          ~printer:so_t
          (tc_cl [CFunction (Some th,[ci],ci,(),Csseff.create ())])
          tc;
        match Contract.get_clgI tc with
          | [c,gi] -> 
              assert_bool
                "Effects does not exists, but GenInfo.getEffects returns true"
                (not (GenInfo.getEffects gi))
          | _ -> assert_failure "get_clgI does not work correct"
    in

    let t20 () =
      let s = "/*c {\"_a\":int}.(int) -> int */" in
      let th = BObjectPL (["_a",ci],false,[],[]) in
      let tc = parse s in
        assert_equal
          ~printer:so_t
          (tc_cl [CFunction (Some th,[ci],ci,(),Csseff.create ())])
          tc;
        match Contract.get_clgI tc with
          | [c,gi] -> 
              assert_bool
                "Effects does not exists, but GenInfo.getEffects returns true"
                (not (GenInfo.getEffects gi))
          | _ -> assert_failure "get_clgI does not work correct"
    in


    let t22 () =
      let s = "/*c () -> null */" in
      let tc = parse s in
        assert_equal
          ~printer:so_t
          (tc_cl [CFunction (None,[],cnull,(),Csseff.create ())])
          tc;
        match Contract.get_clgI tc with
          | [c,gi] -> 
              assert_bool
                "Effects does not exists, but GenInfo.getEffects returns true"
                (not (GenInfo.getEffects gi))
          | _ -> assert_failure "get_clgI does not work correct"
    in

    let t23 () =
      let s = "/*c () -> top */" in
      let tc = parse s in
        assert_equal
          ~printer:so_t
          (tc_cl [CFunction (None,[],ctop,(),Csseff.create ())])
          tc;
        match Contract.get_clgI tc with
          | [c,gi] -> 
              assert_bool
                "Effects does not exists, but GenInfo.getEffects returns true"
                (not (GenInfo.getEffects gi))
          | _ -> assert_failure "get_clgI does not work correct"
    in

    let t24 () =
      let s = "/*c () -> [int] */" in
      let tc = parse s in
        assert_equal
          ~printer:so_t
          (tc_cl [CFunction (None,[],BArray(ci),(),Csseff.create ())])
          tc;
        match Contract.get_clgI tc with
          | [c,gi] -> 
              assert_bool
                "Effects does not exists, but GenInfo.getEffects returns true"
                (not (GenInfo.getEffects gi))
          | _ -> assert_failure "get_clgI does not work correct"
    in

    let t25 () =
      let s = "/*c () -> [[string]] */" in
      let tc = parse s in
        assert_equal
          ~printer:so_t
          (tc_cl [CFunction (None,[],BArray(BArray(cs)),(),Csseff.create ())])
          tc;
        match Contract.get_clgI tc with
          | [c,gi] -> 
              assert_bool
                "Effects does not exists, but GenInfo.getEffects returns true"
                (not (GenInfo.getEffects gi))
          | _ -> assert_failure "get_clgI does not work correct"
    in

    let t26 () =
      let s = "/*c () -> string with [$1./bla/i] */" in
      let tc = parse s in
        assert_equal
          ~printer:so_t
          (tc_cl 
             [CFunction 
                (None,
                 [],
                 cs,
                 (),
                 Csseff.create_effect_list 
                   [Csseff.RegExProp (Csseff.Parameter 1,"/bla/i")])])
          tc
    in      

    let t27 () =
      let s = "/*c () -> string with [$1./bla|blub/*] */" in
      let tc = parse s in
        assert_equal
          ~printer:so_t
          (tc_cl 
             [CFunction 
                (None,
                 [],
                 cs,
                 (),
                 Csseff.create_effect_list 
                   [Csseff.StarRegExProp (Csseff.Parameter 1,"/bla|blub/")])])
          tc
    in      

    let t28 () =
      let s = "/*c () -> string with [$1./bla|blub/*] except [$1.blub] */" in
      let tc = parse s in
        assert_equal
          ~printer:so_t
          (tc_cl 
             [CFunction 
                (None,
                 [],
                 cs,
                 (),
                 Csseff.create_effect_list_neg 
                   [Csseff.StarRegExProp (Csseff.Parameter 1,"/bla|blub/")]
		   [Csseff.Prop (Csseff.Parameter 1,"blub")])])
          tc
    in      

    let t29 () =
      let s = "/*c () -> string with [js:x] */" in
      let tc = parse s in
        assert_equal
          ~printer:so_t
          (tc_cl 
             [CFunction 
                (None,
                 [],
                 cs,
                 (),
                 Csseff.create_effect_list [Csseff.Js "x"])])
          tc
    in      

    let t30 () =
      let s = "/*c () -> string with [/x(.(left|right)).value*/] */" in
      let tc = parse s in
        assert_equal
          ~printer:so_t
          (tc_cl 
             [CFunction 
                (None,
                 [],
                 cs,
                 (),
                 Csseff.create_effect_list [Csseff.RegEx "/x(.(left|right)).value*/"])])
          tc
    in      

      ["Parse int -> int", t1;
       "Parse () -> undefined", t1a;
       "Parse (true,false) -> bool", t2;
       "Parse (int -> int, int) -> \"bla\" */", t3;
       "Parse /*c */", t4;
       "Parse int -> int -> int",t5;
       "Parse (false,bool) -> (true -> string)",t6;
       "Parse (int@numbers, js:intn@numbers) -> bool",t7;
       "Parse int -> bool($$3) | true($$$13) -> false($1)",t8;
       "Parse /*c (int,int($1)) -> bool($2) | true -> false($1)",t9;
       "Parse /*c {name: int} -> int */", t10;
       "Parse /*c { name : 1, contract1: {getCount: int -> int} } -> object */", t11;
       "Parse ~NoAsserts Test", t12;
       "Parse { ... } Test", t13;
       "Parse {a: int} -> int with $1.a",t14;
       "Parse {b : int} -> int with $1.b",t15;
       "Parse {a : int, b : int} -> int with [$1.a, $1.b]",t16;
       "Parse object -> int with [$1.a.?.c]",t17;
       "Parse object -> int with [$1.*]",t18;
       "Parse {a:int}.(int) -> int", t19;
       "Parse {\"_a\":int}.(int) -> int", t20;
       "Parse () -> null", t22;
       "Parse () -> top", t23;
       "Parse () -> [int]", t24;
       "Parse () -> [[string]]", t25; 
       "Parse () -> () with [$1./bla/i]", t26; 
       "Parse () -> string with [$1./bla|blub/*]", t27; 
       "Parse () -> string with [$1./bla|blub/*] except [$1.blub]", t28; 
       "Parse () -> string with [js:x]", t29; 
       "Parse () -> string with [/x(.(left|right))*.value/]", t30; 
      ]
        
  let _ = 
    install_tests
      "Contract Parser"
      init

end
