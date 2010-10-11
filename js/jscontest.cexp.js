/* Version: 0.2.0 */
/* author: Phillip Heidegger */

"use strict";
(function(P) {
	var C = {};
	P.cexp = C;

/*
	 * Interface of counterexamples : { 
	 * 		isCExp: void -> true; 
	 * 		value: value;
	 * 		contract: contract; 
	 * 		? (params: value array; ) 
	 * 		? (result: value; ) 
	 * 		module: string; 
	 * 		valueToString: void -> string; 
	 * 		contrToString: void -> string;
	 * 		paramToString: void -> string; 
	 * 		resultToString: void -> string;
	 * 		moduleToString: void -> string; 
	 * }
	 */
	function CExp(value, contract, params, result, module) {
		var tparams = params.slice(0);

		function contrToString(nextLine) {
			return contract.getcdes();
		}

		function paramToTreeView(parent) {
			P.treeView.init(tparams, parent);
		}

		function resultToTreeView(parent) {
			P.treeView.init(result, parent);
		}

		function paramToString(nextLine) {
			return P.utils.valueToString(tparams, nextLine);
		}

		function resultToString(nextLine) {
			return P.utils.valueToString(result, nextLine);
		}
		this.compare = function(that) {
			return ((value === that.value) && (contract === that.contract)
			        && P.utils.compareArray(tparams, that.params) && (result === that.result));
		};
		this.isCExp = function() {
			return true;
		};
		this.value = value;
		this.contract = contract;
		this.params = tparams;
		this.result = result;
		this.module = module;
		this.valueToString = function() {
			return P.utils.valueToString(value);
		};
		this.contrToString = contrToString;

		/** * this.f = f (paramToTreeView) */
		this.paramToTreeView = paramToTreeView;
		this.resultToTreeView = resultToTreeView;
		this.paramToString = paramToString;
		this.resultToString = resultToString;
		this.moduleToString = function() {
			return module;
		};
	}	
	function CExpUnion(c, ce1, ce2, module) {
		this.isCExp = function() {
			return true;
		};
		this.value = ce1.value;
		this.contract = c;
		this.valueToString = function() {
			return P.utils.valueToString(ce1.value);
		};
		this.contrToString = function() {
			return (c.getcdes());
		};
		this.paramToString = function() {
			return ("first: " + ce1.paramToString() + "second: " + ce2
			    .paramToString());
		};
		this.resultToString = function() {
			return ("first: " + ce1.resultToString() + "second: " + ce2
			    .resultToString());
		};
		this.module = module;
		this.moduleToString = function() {
			return module;
		};
	}
	C.CExp = CExp;
	C.CExpUnion = CExpUnion;

}(JSConTest));