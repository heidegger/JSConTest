/* Version: 0.2.0 */
/* author: Phillip Heidegger,Dirk Kienle */

"use strict";
(function (P) {
	
	var J = {},
		module,
		moduleId,
		numOfFails = 0,
		numOfSuccess = 0,
		cexIDs = [],
		mIDs = [],
		$ = jQuery,
		id = 0,
		init,
		aP = 0,
		aR = 0,
		o,
		cancel,
		log_console,
		lastUid,
		counter = 0;
	
	if (!P.events) {
		P.events = {};
	}
	if (!P.events.handler) {
		P.events.handler = {};
	}
	P.events.handler.jquery = J;

	function create(divId, enType) {
		var enCId = "";
		
		
		function app(s, numOfFails, numOfSuccess) {
			var enLog = document.getElementById(enCId),
				item = document.createElement("li"),
				fail, success;
			item.innerHTML = s;
			enLog.appendChild(item);
			
			fail = document.getElementById(moduleId + 'numOfFails');
			success = document.getElementById(moduleId + 'numOfSuccess');
			
			fail.innerHTML = "Failed contracts: " + numOfFails;
			success.innerHTML = "Successful contracts: " + numOfSuccess;			

		}
		
		
		function newDivHeading(title, c, id, icon) {
			var div = document.createElement('div'),
				span;

			div.setAttribute('id', id);
			if (icon) {
				span = document.createElement('span');
				span.setAttribute('class', 'ui-icon ui-icon-alert');
				span.setAttribute('style', 'float: left; margin-right: .3em;');				
				div.appendChild(span);
			}
			
			if (c) {
				div.setAttribute('class', c);
			}
			
			return div;
		}
		
		function newTree(dl, s1, tree) {
			var n = document.createElement("dt"),
				n2;
			n.innerHTML = s1;
			dl.appendChild(n);
			n2 = document.createElement("dd");
			dl.appendChild(n2);
			n2.appendChild(tree);
			return n2;
		}
		
		function createJsonString (tree){
			var str;
			for (var attr in tree){
				if (tree[attr].data === (function () {return this;} ())) {
					return "window";
				} 
				if (tree.hasOwnProperty(attr)){
					str = JSON.stringify(JSON.decycle(tree[attr].data));
				}
			}
			
			return str;
		}
		
		function nextLine() {
			return document.createElement("br");
		}
		
		function createTable(IDs) {			
			var table = document.createElement('table'),
				tr = document.createElement('tr'),
				i,
				td;
			
			for (i = 0; i < IDs.length; i += 1) {
				td = document.createElement('td');
				if (!(IDs[i] === "")) {
					td.setAttribute('id', IDs[i]);
				} else {
					td.setAttribute('class', 'separater');
				}
				tr.appendChild(td);
			}
			table.appendChild(tr);
			return table;
		}
		
		
		function createButton(text, prependingId, workingId, title, color) {
			var buttonColor = "color:#000";
			
			if (color) {
				buttonColor = "color:" + color;
			}	
			
			$('<button>').text(text).attr({style: buttonColor, title: title}).prependTo('#' + prependingId).addClass('hideContent').click(function () {
				var dl = document.getElementById(workingId);
				if (dl.style.display === 'block') {
					dl.style.display = 'none';
					$(this).removeClass('showContent').addClass('hideContent');
				} else {
					dl.style.display = 'block';
					$(this).removeClass('hideContent').addClass('showContent');
				}		
			});
			
		}
		
		function extractFunctionname (cexValue) {
			var index,str,a;
			index = cexValue.indexOf('(');
			str = cexValue.substring (0,index);
			a = str.split(" ");
			return a[1];
			
		}
		
		function createServerButton (id,ce,exampleId){
			counter++;
			
			$('<button>').text("send to server").appendTo('#' + id).button().click(function () {
				var field, text,functionName;
				
				//counter: was gehört zusammen, function name: beispiele einer function in eine datei, type: this, paramter, result, entry:inhalt
				functionName = extractFunctionname(P.utils.valueToString(ce.getValue()));
				$.post('http://localhost:8080/log.htm',
				       { functionName: functionName, exampleId: exampleId, type: "value", entry: P.utils.valueToString(ce.getValue()) });
				
				$.post('http://localhost:8080/log.htm',
				       { functionName: functionName, exampleId: exampleId, type: "contract", entry: ce.getContract().getcdes() });
				
				field = document.getElementById(id+"_"+"this");
				text = field.getAttribute('value');
				$.post('http://localhost:8080/log.htm',
				       { functionName: functionName, exampleId: exampleId, type: "this", entry: text });
				
				field = document.getElementById(id+"_"+"params");
				text = field.getAttribute('value');
				$.post('http://localhost:8080/log.htm',
				       { functionName: functionName, exampleId: exampleId, type: "parameters", entry: text });
				
				field = document.getElementById(id+"_"+"result");
				text = field.getAttribute('value');
				$.post('http://localhost:8080/log.htm',
				       { functionName: functionName, exampleId: exampleId, type: "result", entry: text });
				
			});
		}
		
		function createMenuButtons(appendingId) {
			
			$('<button>').text('cancel all').appendTo('#' + appendingId).button().click(cancel.doCancel);
					
			$('<button>').text('cancel active contract').appendTo('#' + appendingId).button().click(cancel.doCancelAC);	
			
			$('<button>').text('cancel active modul').appendTo('#' + appendingId).button().click(cancel.doCancelAM);
			
			$('<button>').text('collapse all').appendTo('#' + appendingId).button().click(function () {
				var stat = document.getElementById('StatisticsContent'),
					warn,
					module,
					i;
				
				stat.style.display = 'none';
				warn = document.getElementById('WarningsContent');
				warn.style.display = 'none';
				
				for (i = 0; i < mIDs.length; i += 1) {
					module = document.getElementById(mIDs[i]);
					module.style.display = 'none';
				}
				
				$('button').each(function () {
					var title = $(this).attr("title");
					if (title === "module" || title === "Statistics" || title === "Warnings") {
						$(this).addClass('hideContent').removeClass('showContent');
					}
				});
				
			});
			
			$('<button>').text('expand all').appendTo('#' + appendingId).button().click(function () {				
				var stat = document.getElementById('StatisticsContent'),
					warn,
					module,
					i;
				stat.style.display = 'block';
				
				warn = document.getElementById('WarningsContent');
				warn.style.display = 'block';
				
				for (i = 0; i < mIDs.length; i += 1) { 
					module = document.getElementById(mIDs[i]);
					module.style.display = 'block';
				}
				
				$('button').each(function () {
					var title = $(this).attr("title");
					if (title === "module" || title === "Statistics" || title === "Warnings") {
						$(this).addClass('showContent').removeClass('hideContent');
					}
				});
				
			});
		}
		
		function createCexCollapseExpandButton(id) {
			
			$('<button>').text('collapse all').prependTo('#' + id).addClass('cexButton').click(function () {
				var i, example;
				for (i = 0; i < cexIDs.length; i += 1) {
					example = document.getElementById(cexIDs[i]);
					example.style.display = 'none';
				}
				
				$('button').each(function () {
					var title = $(this).attr("title");
					if (title === "cex") {
						$(this).addClass('hideContent').removeClass('showContent');
					}
				});
				
			});
			$('<button>').text('expand all').prependTo('#' + id).addClass('cexButton').click(function () {
				var i, example;
				for (i = 0; i < cexIDs.length; i += 1) {
					example = document.getElementById(cexIDs[i]);
					example.style.display = 'block';
				}
				$('button').each(function () {
					var title = $(this).attr("title");
					if (title === "cex") {
						$(this).addClass('showContent').removeClass('hideContent');
					}
				});
			});
		}
	
		function aCE(ce) {
			var enLog, item, uid, dl, treeDiv, exp_header, exp_content,text,dd,paraTree,label,resultTree,thisTree;

			uid = "ce_dl_item" + ce.uid;
			if (lastUid !== ce.uid) {
				lastUid = ce.uid;

				id = 1;
				item = document.createElement("li");
				item.setAttribute('id', uid);
				item.setAttribute('class', 'ui-state-highlight ui-corner-all');
				item.setAttribute('style', 'padding:0.3em');
				enLog = document.getElementById(enCId); 
				enLog.appendChild(item);

				dl = document.createElement("dl");
				dl.setAttribute('style', 'padding:0.7em');
				item.appendChild(dl);
				newDef(dl, "value", P.utils.valueToString(ce.getValue()));
				newDef(dl, "contract", ce.getContract().getcdes());				
				
			} else {
				id += 1;
				item = document.getElementById(uid);
				
			}
			exp_header = document.createElement("div");
			item.appendChild(exp_header);
			exp_header.setAttribute('id', uid + "_div_" + id);
			createButton("Example " + id, uid + "_div_" + id, uid + "_" + id, "cex");
			cexIDs.push(uid + "_" + id);
			
			dl = document.createElement("dl");
			dl.setAttribute('id', uid + "_" + id);
			dl.setAttribute('style', 'display:none;padding:0.7em');
			exp_header.appendChild(dl);
			
			treeDiv = document.createElement("div");
			dd = newTree(dl, "this", treeDiv);
			thisTree = P.treeView.init(ce.getThisValue(), treeDiv);
			text = document.createElement("input");
			text.setAttribute('type','text');
			text.setAttribute('value',createJsonString(thisTree._nodes));
			text.setAttribute('id',uid + "_" + id+"_"+"this");
			label = document.createElement("label");
			label.innerHTML = 'JSON: ';
			dd.appendChild(label);
			dd.appendChild(text);
			
			treeDiv = document.createElement("div");
			dd = newTree(dl, "parameters", treeDiv);
			paraTree = P.treeView.init(ce.getParams(), treeDiv);
			text = document.createElement("input");
			text.setAttribute('type','text');
			text.setAttribute('value',createJsonString(paraTree._nodes));
			text.setAttribute('id',uid + "_" + id+"_"+"params");
			label = document.createElement("label");
			label.innerHTML = 'JSON: ';
			dd.appendChild(label);
			dd.appendChild(text);
			
			treeDiv = document.createElement("div");
			dd = newTree(dl, "result", treeDiv);
			resultTree = P.treeView.init(ce.getResult(), treeDiv);
			text = document.createElement("input");
			text.setAttribute('type','text');
			text.setAttribute('value',createJsonString(resultTree._nodes));
			text.setAttribute('id',uid + "_" + id+"_"+"result");
			label = document.createElement("label");
			label.innerHTML = 'JSON: ';
			dd.appendChild(label);
			dd.appendChild(text);
			
			createServerButton (uid + "_" + id,ce,"Example"+id);
		}
		
		
		function setDef(dl, id, s1, s2) {
			var n, n2;
			
			if (id) {
				n2 = document.getElementById(id);
			}
			if (!n2) {
				n = document.createElement("dt");
				n.innerHTML = s1;
				dl.appendChild(n);
				n2 = document.createElement("dd");
				n2.setAttribute('id', id);
				dl.appendChild(n2);
			}
			n2.innerHTML = s2;
		}
		
		function newDef(dl, s1, s2) {
			setDef(dl, false, s1, s2);
		}
		
		function setDefAdd(dl, id, s1, s2) {
			var td = document.getElementById(id);
			td.innerHTML = s1 + " " + s2;
		}
		
		function newHeadding(s, m, shortContent) {
			var divLog = document.getElementById(divId),
				module,
				moduleContent,
				table,
				buttonDiv,
				en;
			
			//module div
			module = document.createElement('div');
			module.setAttribute('class', 'ui-state-highlight ui-corner-all');
			module.setAttribute('id', moduleId);
			divLog.appendChild(module);
			
			divLog.appendChild(nextLine());
			
			//div to put module content in
			moduleContent = document.createElement('div');
			moduleContent.setAttribute('style', 'display:none;padding:0.7em');
			moduleContent.setAttribute('id', moduleId + 'Content');
			
			if (shortContent) {
				//Module Table for short content
				table = createTable([moduleId + "Button", moduleId + "numOfFails", "", 
				                     moduleId + "numOfSuccess"]);
				module.appendChild(table);
			} else {	
				buttonDiv = document.createElement("div");
				buttonDiv.setAttribute('id', moduleId + 'Button');
				module.appendChild(buttonDiv);				
			}
			
			module.appendChild(moduleContent);
			
			en = document.createElement(enType);
			
			enCId = divId + m;
			en.id = enCId;
			moduleContent.appendChild(en);
		}
		
		
		init = (function () {
			var init2 = false;
			return (function () {
				var divLog,
					d,
					fc,
					menuDiv,
					stat,
					table,
					statContent,
					w,
					code,
					dl;
				
				if (!init2) {
					init2 = true;
					
					divLog = document.getElementById(divId);
					d = document.createElement('div');
					fc = divLog.firstChild;
					divLog.insertBefore(d, fc);
					d.setAttribute('id', 'first');
					
					//menu div
					menuDiv = document.createElement('div');
					menuDiv.setAttribute('id', 'menuDiv');
					menuDiv.setAttribute('align', 'center');
					d.appendChild(menuDiv);
					
					d.appendChild(nextLine());
					
					//Statistics Headline
					stat = newDivHeading("Statistics", 'ui-state-highlight ui-corner-all', 'statContainer');
					d.appendChild(stat);
					
					//Statistics Table
					table = createTable(["statButton", "numOfConTotal", "", "numOfContracts", "", "numTestRuns"]);
					stat.appendChild(table);
					
					d.appendChild(nextLine());
					
					//div to put statistic content in
					statContent = document.createElement('div');
					statContent.setAttribute('style', 'display:none;padding:0.7em');
					statContent.setAttribute('id', 'StatisticsContent');
					stat.appendChild(statContent);
					
					//Warning Headline
					w = newDivHeading("Warnings", 'ui-state-error ui-corner-all', 'warnContainer', 
					                  'ui-icon ui-icon-alert');
					d.appendChild(w);
					
					d.appendChild(nextLine());
					
					//div to put warning content in
					code = document.createElement('code');
					code.setAttribute('style', 'display:none;color:#fff;');
					code.setAttribute('id', 'WarningsContent');
					w.appendChild(code);
					
					// TODO
					log_console = code;
					
					createButton('Statistics', 'statButton', 'StatisticsContent', 'Statistics');
					createButton('Warnings', 'warnContainer', 'WarningsContent', 'Warnings', '#fff');
					
					dl = document.createElement("dl");
					statContent.appendChild(dl);
					dl.setAttribute('id', divId + '_dl');
					
					createMenuButtons("menuDiv");
					
				}
			});			
		}());

		function statistic(s) {
			var dl,
				dlTotal,
				dlCon,
				dlRun;
			
			init();
			dl = document.getElementById('StatisticsContent');
			dlTotal = document.getElementById('numOfConTotal');
			dlCon = document.getElementById('numOfContracts');
			dlRun = document.getElementById('numTestRuns');
			setDef(dl, 'NoCTodo', "Number of contracts total:", s.getTotalTodo());
			setDefAdd(dlTotal, 'numOfConTotal', "Number of contracts total:", s.getTotalTodo());
			setDef(dl, 'NoC', "Number of contracts done: ", s.getTotal());
			setDefAdd(dlCon, 'numOfContracts', "Number of contracts done: ", s.getTotal());
			setDef(dl, 'NovC', "Number of verified contracts: ", s.getVerified());
			setDef(dl, 'NofC', "Number of failed contracts: ", s.getFailed());
			setDef(dl, 'Noce',
			       "Number of contracts where check exists with an error: ", s.getErrors());
			setDef(dl, 'Notc', "Number of well tested contracts: ", s.getWellTested());
			setDef(dl, 'Not', "Number of tests run: ", s.getTests());
			setDefAdd(dlRun, 'numTestRuns', "Number of tests run: ", s.getTests());
			
		}
		
		function assertParam(cl, pl, str) {
			aP += 1;
			if (aP < 10) {
				log_console.innerHTML = log_console.innerHTML + str + ": " +
				                        "Parameters passed to function not valid: " +
				                        cl + ", " + P.utils.valueToString(pl) +
				                        "<br/>\n";
			}
		}
		function strEffect(obj, prop, effl_str, eff_str, kind) {
			return "Effect Error, " + kind + " access not allowed! " +
			       "You try to read the property <b>" + prop + "</b> " +
			       "of object " + P.utils.valueToString(obj) + ". <br />\n" +
			       "Permissions you have to respect: " + effl_str + "<br />\n" +
			       "The following was not respected: " + eff_str + "<br />\n";
		}
		function assertEffectsWrite(o, p, effl_str, eff_str) {
			log_console.innerHTML += "<b>" + module + "</b>: " +
			                         strEffect(o, p, effl_str, eff_str, "write");
		}

		function assertEffectsRead(o, p, effl_str, eff_str) {
			log_console.innerHTML += "<b>" + module + "</b>: " +
			                         strEffect(o, p, effl_str, eff_str, "read");
		}

		function assertReturn(cl, v) {
			aR += 1;
			if (aR < 10) {
				log_console.innerHTML = log_console.innerHTML + "Return value of " + cl +
				                        " not valid: " + P.utils.valueToString(v);
			}
		}
		

		function skipped(c, v, anz) {
			var s;
			if (!anz) {
				s = ".";
			} else {
				s = " after " + anz + " test runs."; 
			}
			app(c.failToString(v) + " Contract was canceled" + s);
		}
		function fail(c, v, anz) {
			var s;
			// this is the test case
			
			numOfFails += 1;
		
			if (!anz) {
				s = c.failToString(v);
				app(s, numOfFails, numOfSuccess);
			} else {
				s = c.failToString(v);
				app(s + " Tests run: " + anz);
			}
		}
		
		function success(c, v, anz) {
			numOfSuccess += 1;
			if (!anz) {
				var s = c.okToString(v);
				app(s, numOfFails, numOfSuccess);
			} else {
				app(c.okToString(v) + " Tests run: <em>" + anz + "</em>");
			}
		}
		function error(e, c, params) {
			// this is the test case
			app("While testing contract " + c.getcdes() + ", an error happens: " + e);
			app("The parameters passed to the function were: " + params);
		}
		function moduleChange(m) {
			moduleId = P.utils.md5(m);
			module = m;
			numOfFails = 0;
			numOfSuccess = 0;
			mIDs.push(moduleId + 'Content');
			newHeadding("Module: " + m, m, true);
			createButton("Module: " + m, moduleId + 'Button', moduleId + 'Content', 'module');
		}
		function CExpStart() {
			moduleId = P.utils.md5("cex");
			mIDs.push(moduleId + 'Content');
			newHeadding("Collected Counterexamples", "cex");
			createButton("Collected Counterexamples", moduleId + 'Button', moduleId + 'Content', 'module');
			createCexCollapseExpandButton(moduleId + 'Content');
		}
		function cancelCall(c) {
			cancel = c;
		}
		function defaultHandler(msg, param) {
			
		}
		
		o = { skipped: skipped,
		  fail: fail,
		  success: success,
		  error: error,
		  moduleChange: moduleChange,
		  CExpStart: CExpStart,
		  CExp : aCE,
		  statistic: statistic,
		  assertParam: assertParam,
		  assertEffectsRead: assertEffectsRead,
		  assertEffectsWrite: assertEffectsWrite,
		  cancel: cancelCall,
		  "__default__": defaultHandler
		};
		return o;
		
	}
	
	J.create = create;
	
}(JSConTest));
