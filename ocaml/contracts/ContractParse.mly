%{ 
  module Parsing = ParsingOwn.Make(LexingOwn)
  open Parsing
  module Lexing = Parsing.Lexing

  open AST
  open ProglangUtils
  open ExtList
  open Contract
  open BaseContract
 %}

%token LEOF
%token LPARAN
%token RPARAN
%token LBRAKET
%token RBRAKET
%token LLBRACE
%token LRBRACE

%token LUndf
%token LVoid
%token LTop
%token LId
%token LNoTests
%token LNoAsserts
%token LNoEffects
%token LEffects
%token <int> LNumberTests
%token LWith

%token LBool
%token Ltrue
%token Lfalse

%token LString
%token <string> LSingleString

%token LInteger
%token <int> LSingleInteger

%token LFloat
%token <float> LSingleFloat

%token <string> LJSIdent


%token LAT
%left LAT
%token LLabels
%token LSConstants
%token LNConstants
%token L3D

%token LCOLON
%token LOR
%token LSTAR
%token <string> LIdentifier
%token LObject

%token LCOMMA
%token LARROW

%token LSEMICOLON
%token <int  * int> LDepend

%token TEST

%right LARROW
%left LCOMMA

%token LBAR
%left LBAR

%token LDOT
%left LDOT
%token LQUESTION

%nonassoc TEST

%start contractl_top
%type <(BaseContract.t,Analyse.t,Depend.t,unit) Contract.t> contractl_top

%%

contractl_top:
  | contractl globalAnn               { Contract.create_tgI $1 $2 }
  | contractl globalAnn LEOF          { Contract.create_tgI $1 $2 }
;

contractl: 
  |                                   { [] }
  | contract genInfo contract_tail    { ($1,$2) :: $3 } 
;

contract_tail:
  |                                         { [] }
  | LBAR contract genInfo contract_tail     { ($2,$3) :: $4 }
;

contract:
  | base_anl_dep                                  { $1 }
  | fun_contract                                  { $1 }

  | LLBRACE propl LRBRACE analysel                { BObjectPL ($2,false,$4,[]) }
  | LLBRACE propl LRBRACE analysel 
      LPARAN dependl RPARAN                       { BObjectPL ($2,false,$4,$6) }
  | LLBRACE propl L3D LRBRACE analysel            { BObjectPL ($2,true,$5,[]) }
  | LLBRACE propl L3D LRBRACE analysel
      LPARAN dependl RPARAN                       { BObjectPL ($2,true,$5,$7) }
  | LBRAKET contract RBRAKET                      { BArray ($2) }
;

fun_contract:
  | fun_contract_without_effect effects           { let (cl,al) = $1 in                                                     
                                                      CFunction (cl,al,(),Csseff.create_effect_list $2)
                                                  }

;

/** Effects are optional. This parser leads to a shift/reduce conflict which is benign as shifting is taken as the default. */
effects:  
  |                                               { [] }
  | LWith  LBRAKET css_list RBRAKET               { $3 }
;

fun_contract_without_effect:
  | contract LARROW contract                      { ([$1],$3) }
  | paraml LARROW contract                        { ($1,$3) }
  | contract LARROW LPARAN contract RPARAN        { ([$1],$4) }
  | paraml LARROW LPARAN contract RPARAN          { ($1,$4) }
;

css_list:
  | css_path css_tail           { $1 :: $2 }
;

css_tail:
  |                                     { [] } 
  | LCOMMA css_list                     { $2 }
;

css_path:
  | LDepend                         { let (scope,nr) = $1 in
                                         if (scope == 1) 
                                            then (Csseff.Parameter nr) 
                                            else failwith "TODO: Too many dollars" }
  | css_path LDOT LIdentifier       { Csseff.Prop ($1,$3) }
  | css_path LDOT LSTAR             { Csseff.Star $1 }
  | css_path LDOT LQUESTION         { Csseff.Question $1 }
;

paraml:
  | LPARAN paramll_m2 RPARAN      { $2 }
;

paramll_m2:
  | contract LCOMMA paramll_ne    { $1 :: $3 }
;

paramll_ne:
  | contract paramll_me           { $1 :: $2 }
;

paramll_me:
  |                               { [] }
  | LCOMMA contract paramll_me    { $2 :: $3 }
;

analysel:
  |             { [] }
  | analysel_ne { $1 }
;

analysel_ne:
  | LAT LLabels     analysel { List.add (Analyse.Labels) $3 }
  | LAT LSConstants analysel { List.add (Analyse.Strings) $3 }
  | LAT LNConstants analysel { List.add (Analyse.Numbers) $3 }
;

base_anl_dep:
  | base_anl                                { CBase (fst $1,snd $1,[]) }
  | base_anl LPARAN dependl RPARAN          { CBase (fst $1,snd $1,$3) }
;

base_anl:
  | base analysel                           { ($1,$2) }
;

base:
  | LUndf            { BUndf }
  | LVoid            { BVoid }
  | LTop             { BTop  }
  | Ltrue            { BSBool true  }
  | Lfalse           { BSBool false }
  | LBool            { BBool        }
  | LString          { BString      }
  | LSingleString    { BSString $1  }
  | LInteger         { BInteger     }
  | LSingleInteger   { BSInteger $1 }
  | LBRAKET LSingleInteger LSEMICOLON LSingleInteger RBRAKET { BIInterval ($2,$4) } 
  | LSingleFloat     { BSFloat $1   }
  | LFloat           { BFloat }
  | LBRAKET LSingleFloat LSEMICOLON LSingleFloat RBRAKET   { BFInterval ($2,$4) } 
  | LBRAKET LSingleInteger LSEMICOLON LSingleFloat RBRAKET  { BFInterval (float_of_int $2,$4) } 
  | LBRAKET LSingleFloat LSEMICOLON LSingleInteger RBRAKET  { BFInterval ($2,float_of_int $4) } 
  | LJSIdent              { BJavaScriptVar $1 }
  | LId                   { BId }
  | LObject               { BObject }
;


propl_ne:
  | LIdentifier LCOLON contract                 { [($1,$3)] }
  | LIdentifier LCOLON contract LCOMMA propl_ne { ($1,$3) :: $5 }
;

propl:
  |               { [] }
  | propl_ne      { $1 }
;

depend:
  | LDepend             { Depend.create (fst $1) (snd $1) }
;

dependl:
  | depend                   { [$1] }
  | depend LCOMMA dependl    { $1 :: $3 }
;


genInfo:
  |                                   { GenInfo.create () }
  | genInfo LNoTests                  { GenInfo.noTests $1; $1 }  
  | genInfo LNoAsserts                { GenInfo.noAsserts $1; $1 }
  | genInfo LNumberTests              { GenInfo.setTestNumber $1 $2; $1 }
;

globalAnn:
  |                                   { None       }
  | LNoEffects                        { Some false }
  | LEffects                          { Some true  }
;
