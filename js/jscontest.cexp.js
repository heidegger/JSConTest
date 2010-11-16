/* Version: 0.2.0 */
/* author: Phillip Heidegger */

"use strict";
(function (P) {
	var C = {};
	P.cexp = C;

/*
	 * Interface of counterexamples : { 
	 * 		isCExp: void -> true; 
	 * 		value: value;
	 * 		contract: contract; 
	 * 		? (params: value array; ) 
	 *    ? (thisv: value; )
	 * 		? (result: value; ) 
	 * 		module: string; 
	 * 		valueToString: void -> string; 
	 * 		contrToString: void -> string;
	 * 		paramToString: void -> string; 
	 * 		resultToString: void -> string;
	 * 		moduleToString: void -> string; 
	 * }
	 */
	function CExpOld(value, contract, params, result, module, thisValue) {
		var tparams = params.slice(0);
		this.getParams = function () {
			return tparams;
		};
		this.getValue = function () {
			return value;
		};
		this.getContract = function () {
			return contract;
		};
		this.getResult = function () {
			return result;
		};
		this.getModule = function () {
			return module;
		};
		this.getThisValue = function () {
			return thisValue;
		};
		this.compare = function (that) {
			return ((value === that.getValue()) && (contract === that.getContract()) &&
			        P.utils.compareArray(tparams, that.getParams()) && 
			        (result === that.getResult()) &&
			        (thisValue === that.getThisValue()));
		};
		this.isCExp = function () {
			return true;
		};
	}	
	function CExpUnion(c, ce1, ce2, module) {
		this.isCExp = function () {
			return true;
		};
		this.value = ce1.value;
		this.contract = c;
		this.valueToString = function () {
			return P.utils.valueToString(ce1.value);
		};
		this.contrToString = function () {
			return (c.getcdes());
		};
		this.paramToString = function () {
			return ("first: " + ce1.paramToString() + "second: " + ce2
			    .paramToString());
		};
		this.resultToString = function () {
			return ("first: " + ce1.resultToString() + "second: " + ce2
			    .resultToString());
		};
		this.module = module;
		this.moduleToString = function () {
			return module;
		};
	}
	function CExp(cexp) {
		return new CExpOld(cexp.value, cexp.contract, cexp.parameter, cexp.returnv, cexp.module, cexp.thisv);
	}
	C.CExp = CExp;
	C.CExpUnion = CExpUnion;

}(JSConTest));