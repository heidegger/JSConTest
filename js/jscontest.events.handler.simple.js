/* Version: 0.2.0 */
/* author: Phillip Heidegger */

"use strict";
(function(P) {
	var R = {};
	var module;

	if (!P.events) {
		P.events = {};
	}
	if (!P.events.handler) {
		P.events.handler = {};
	}
	P.events.handler.simple = R;

	/** event interface: 
	    { fail: (value, contract) -> void;
	      success: (value, contract, count) -> void;
	      error: string -> void;
	      moduleChange: string -> void;
	      CExpStart: void -> void;
	      CExp: CExp -> void;
	      statistic: (totalCNumber, totalTestNumber, failed, verified,
	             errors, wellTested) -> void;
	      assertParam:  ;
	      assertEffectsRead: ;
	      assertEffectsWrite: ;
	    }
	 */

	function create(divId, enType) {
		var enCId = "";
		function app(s) {
			var enLog = document.getElementById(enCId);
			var item = document.createElement("li");
			item.innerHTML = s;
			enLog.appendChild(item);
		}
		function newTree(dl,s1,tree) {
			var n = document.createElement("dt");
			n.innerHTML = s1;
			dl.appendChild(n);
			var n2 = document.createElement("dd");
			dl.appendChild(n2);
			n2.appendChild(tree);
		}

		function newDef(dl, s1, s2) {
			setDef(dl, false, s1, s2);
		}

		function setDef(dl, id, s1, s2) {
			var n2;
			if (id) {
				n2 = document.getElementById(id);
			}
			if (!n2) {
				var n = document.createElement("dt");
				n.innerHTML = s1;
				dl.appendChild(n);
				var n2 = document.createElement("dd");
				n2.setAttribute('id', id);
				dl.appendChild(n2);
			}
			n2.innerHTML = s2;
		}
		function hide(id) {
			var dl = document.getElementById(id);
			if (dl) {
				dl.style.display = 'none';
			}
		}
		function doHide(id) {
			return (function() {
				var dl = document.getElementById(id);
				if (dl) {
					if (dl.style.display === 'none') {
						dl.style.display = 'block';
					} else {
						hide(id);
					}
				}
			});
		}
		var id = 0;
		function aCE(ce) {
			id++;
			var enLog = document.getElementById(enCId);
			var item = document.createElement("li");
			enLog.appendChild(item);
			var uid = "ce_dl_item" + ce.uid + "_" + id;
			item.appendChild(newB("Hide/Show", doHide(uid)));
			var dl = document.createElement("dl");
			dl.setAttribute('id', uid);
			item.appendChild(dl);
			newDef(dl, "value", ce.valueToString(nextLine));
			newDef(dl, "contract", ce.contrToString());

			// TODO: erzeuge tree view element mithilfe der paramToTreeView methode des ce */
			//      var treeDiv = document.createElement("div");
			//      newDef(dl,"parameter",treeDiv);
			//      ce.paramToTreeView(treeDiv);
			var treeDiv = document.createElement("div");
			newTree(dl, "parameters", treeDiv);
			ce.paramToTreeView(treeDiv);

			treeDiv = document.createElement("div");
			newTree(dl, "result", treeDiv);
			ce.resultToTreeView(treeDiv);

			//newDef(dl, "parameter", ce.paramToString(nextLine));
			//newDef(dl, "result", ce.resultToString());
			// END TODO */

			// newDef(dl,"expected",ce.resultExpToString());
			for ( var i = 1; i < id; ++i) {
				hide("ce_dl_item" + ce.uid + "_" + i);
			}
		}

		function nextLine() {
			return "<br/>";
		}

		function newHeadding(s, m) {
			var divLog = document.getElementById(divId);
			var h2 = document.createElement("h2");
			h2.innerHTML = s;
			divLog.appendChild(h2);
			var en = document.createElement(enType);
			enCId = divId + m;
			en.id = enCId;
			divLog.appendChild(en);
		}
		function newDivHeading(title, c) {
			var div = document.createElement("div");
			var h = document.createElement("h2");
			div.appendChild(h);
			h.innerHTML = title;
			if (c)
				div.setAttribute('class', c);
			return div;
		}
		function newB(title, onclick) {
			var b = document.createElement('button');
			b.innerHTML = title;
			b.onclick = onclick;
			return b;
		}

		var log_console;
		var cancel;
		var initStat = (function() {
			var init = false;
			return function() {
				if (!init) {
					var divLog = document.getElementById(divId);
					var d = document.createElement('div');
					var fc = divLog.firstChild;
					divLog.insertBefore(d, fc);
					d.setAttribute('id', 'first');

					var stat = newDivHeading("Statistic", 'clear');
					d.appendChild(stat);
					var w = newDivHeading("Warnings", 'right');
					d.appendChild(w);
					code = document.createElement('code');
					w.appendChild(code);
					log_console = code;

					var dl = document.createElement("dl");
					stat.appendChild(dl);
					dl.setAttribute('id', divId + '_dl');
					stat.appendChild(newB('cancel all', cancel.doCancel));
					stat.appendChild(newB("cancel active contract", cancel.doCancelAC));
					stat.appendChild(newB("cancel active modul", cancel.doCancelAM));

					init = true;
				}
			};
		})();
		function statistic(s) {
			// totalCNumber, totalTestNumber, failed, verified, errors,
			// wellTested) {
			initStat();
			var dl = document.getElementById(divId + '_dl');
			setDef(dl, 'NoC', "Number of contracts: ", s.getTotal());
			setDef(dl, 'NovC', "Number of verified contracts: ", s.getVerified());
			setDef(dl, 'NofC', "Number of failed contracts: ", s.getFailed());
			setDef(dl, 'Noce',
			       "Number of contracts where check exists with an error: ", s.getErrors());
			setDef(dl, 'Notc', "Number of well tested contracts: ", s.getWellTested());
			setDef(dl, 'Not', "Number of tests run: ", s.getTests());
		}

		var aP = 0;
		function assertParam(cl, pl, str) {
			aP++;
			if (aP < 10) {
				log_console.innerHTML = log_console.innerHTML + str + ": "
				                        + "Parameters passed to function not valid: "
				                        + cl + ", " + P.utils.valueToString(pl)
				                        + "<br/>\n";
			}
		}
		function strEffect(obj, prop, effl_str, eff_str, kind) {
			return "Effect Error, " + kind + " access not allowed! "
			       + "You try to read the property <b>" + prop + "</b>"
			       + " of object " + P.utils.valueToString(obj) + ". <br />\n"
			       + "Permissions you have to respect: " + effl_str + "<br />\n"
			       + "The following was not respected: " + eff_str + "<br />\n";
		}
		function assertEffectsWrite(o, p, effl_str, eff_str) {
			log_console.innerHTML += "<b>" + module + "</b>: "
			                         + strEffect(o, p, effl_str, eff_str, "write");
		}
		;
		function assertEffectsRead(o, p, effl_str, eff_str) {
			log_console.innerHTML += "<b>" + module + "</b>: "
			                         + strEffect(o, p, effl_str, eff_str, "read");
		}

		var aR = 0;
		function assertReturn(cl, v) {
			aR++;
			if (aR < 10) {
				log_console.innerHTML = log_console.innerHTML + "Return value of " + cl
				                        + " not valid: " + P.utils.valueToString(v);
			}
		}
		var o = {
		  skipped: function(c, v, anz) {
		  	var s;
		  	if (!anz) {
		  		s = ".";
		  	} else {
		  		s = " after " + anz + " test runs."; 
		  	}
	  		app(c.failToString(v) + " Conract was canceled" + s);
 		  },
		  fail : function(c, v, anz) {
		  	// this is the test case
			  if (!anz) {
				  var s = c.failToString(v);
				  app(s);
			  } else {
				  var s = c.failToString(v);
				  app(s + " Tests run: " + anz);
			  }
			  ;
		  },
		  success : function(c, v, anz) {
			  if (!anz) {
				  var s = c.okToString(v);
				  app(s);
			  } else {
				  app(c.okToString(v) + " Tests run: <em>" + anz + "</em>");
			  }
		  },
		  error : function(e, c, params) {
		  	// this is the test case
		  	app("While testing contract " + c.getcdes() + ", an error happens: "
			      + e);
			  app("The parameters passed to the function were: " + params);
		  },
		  moduleChange : function(m) {
			  module = m;
			  newHeadding("Module: " + m, m);
		  },
		  CExpStart : function() {
			  newHeadding("Collected Counterexamples", "cex");
		  },
		  CExp : function(ce) {
			  aCE(ce);
		  },
		  statistic : statistic,
		  assertParam : assertParam,
		  assertEffectsRead : assertEffectsRead,
		  assertEffectsWrite : assertEffectsWrite,
		  cancel: function (c) {
		  	cancel = c;
		  },
		  "__default__" : function(msg, param) {
			  // alert('I do not know what todo with log message: ' + msg);
		  }
		};
		return o;
	}

	R.create = create;

})(JSConTest);
