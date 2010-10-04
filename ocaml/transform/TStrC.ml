open Contract

type bc = BaseContract.t
type a = Analyse.t 
type d = Depend.t
type tc = (bc,a,d,unit) Contract.t 

let parse_top_contract : string -> tc =
    fun s -> 
      if (String.length s > 0) then begin
        let c = ContractParse.contractl_top 
          ContractLexer.token 
          (Ulexing.from_utf8_string s) 
        in
          raise_analyse c
      end else begin
        Contract.create_tgI [] None
      end

let parse program =
  let a_e = function
    | AST.Sequence (ann,[e]) -> e
    | e -> e
  in
  AST.visit
    ~a_expression:a_e
    ~ba_c:parse_top_contract
    program
