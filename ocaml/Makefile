OCAMLMAKEFILE=OCamlMakefile
OCAMLYACC := ./ocamlyacc_own.sh

#,own_expat
PACKS   = str,ocamlgraph,camlp4,unix,ulex,proglangUtils

SOURCES = date.ml \
	      etc.mli etc.ml \
	      utils/utils.mli utils/utils.ml \
	      utils/ParsingOwn.mli utils/ParsingOwn.ml \
	      utils/LexingOwn.mli utils/LexingOwn.ml \
          js/annotation.mli js/annotation.ml \
          contracts/depend.mli contracts/depend.ml \
	      contracts/genInfo.mli contracts/genInfo.ml \
	      contracts/dependDown.mli contracts/dependDown.ml \
          contracts/csseff.mli contracts/csseff.ml \
          contracts/Contract.ml contracts/Contract.mli \
		  contracts/ContractOrder.mli contracts/ContractOrder.ml \
		  js/AST.mli js/AST.ml \
	      utils/ASTUtil.mli utils/ASTUtil.ml \
	      utils/testlib.mli utils/testlib.ml \
	      contracts/analyse.mli contracts/analyse.ml \
	      contracts/BaseContract.mli contracts/BaseContract.ml \
		  js/JSParse.mly \
		  js/JSLexer.ml \
		  js/PrettyToken.ml \
		  js/JSParseInterface.ml \
		  contracts/ContractParse.mly \
	      contracts/ContractLexer.ml \
	      contracts/ContractCycle.mli contracts/ContractCycle.ml \
	      transform/TStrC.mli transform/TStrC.ml \
		  transform/jsinter.mli transform/jsinter.ml \
	      transform/trans.mli transform/trans.ml \
	      transform/TCssEffJS.mli transform/TCssEffJS.ml \
	      transform/TCJS.mli transform/TCJS.ml \
		  transform/transactify.mli transform/transactify.ml \
	      transform/effects.mli transform/effects.ml \
		  args.mli args.ml \
	      contracts/ContractParseTest.ml \
		  main.ml

ANNOTATE=yes
RESULT  = jscontest
BCSUFFIX = bc
NCSUFFIX = opt


all: do_date bc

etc.cmi etc.cmo:	do_date

do_date:	
		echo "let date = \"`date '+%F - %H:%M:%S'`\"" > date.ml
		ocamlc date.ml
		rm date.ml

-include OCamlMakefile

