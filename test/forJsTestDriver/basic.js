/* Test, as in basic.html to use by JsTestDriver
 *   http://code.google.com/p/js-test-driver/
 * to support running the test cases in multiple browsers
 */

//BasicTestCase = TestCase("BasicTestCase");

//BasicTestCase.prototype.testBasic = function () {
//}
(function () {
	function registerForJSTestDriver(m, i, test, f) {
		var tc = TestCase(m + " - " + i);
		tc.prototype["test" + i] = f;				
	}
	function makeChecker(exp) {
		return {"__default__": 
  		function (msg) {
  			if (exp !== msg) {
					switch (msg) {
					case "fail": 
						fail( "Expected: " + exp 
					    			+ ", got message: " + msg 
									+ ", value: " + arguments[1]
									+ ", constraint: " + arguments[2]);
						break;
					case "success":
					  	fail( "Expected: " + exp 
					    			+ ", got message: " + msg 
									+ ", value: " + arguments[1]
									+ ", constraint: " + arguments[2]);
						break;
					case "error":
					  	fail( "Expected: " + exp 
					    			+ ", got message: " + msg 
									+ ", error message: " + arguments[1]
									+ ", constraint: " + arguments[2]);
						break;
					}
				}
  	  }
  	};
	}
	
	
	var anz = 1;
	
	var u = JSConTest.contracts.Name("u");
	JSConTest.contracts.Let("u",JSConTest.contracts.Union(JSConTest.contracts.Undefined, u));
	var x = JSConTest.contracts.Name("x");
	JSConTest.contracts.Let("x",JSConTest.contracts.Union(JSConTest.contracts.Undefined,JSConTest.contracts.String));
	
	var contr = [
		JSConTest.contracts.Null,
		JSConTest.contracts.Undefined,
		JSConTest.contracts.True,
		JSConTest.contracts.False,
		JSConTest.contracts.Boolean,
		JSConTest.contracts.Integer,
		JSConTest.contracts.IIntervall(0,5),
		JSConTest.contracts.Number,
		JSConTest.contracts.String,
		JSConTest.contracts.Object,
		JSConTest.contracts.Array(JSConTest.contracts.Boolean),
		JSConTest.contracts.Array(JSConTest.contracts.Top),
		JSConTest.contracts.Union(JSConTest.contracts.Object,JSConTest.contracts.Null),
		JSConTest.contracts.Union(JSConTest.contracts.Object,JSConTest.contracts.String),
		JSConTest.contracts.Union(JSConTest.contracts.True,JSConTest.contracts.Boolean),
		u,
		x
	];
	var vals = [
		{ v: null, 
			d: "Null", 
		  expected: ['success', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail',
			           'fail', 'fail', 'fail', 'fail', 'fail', 'success', 'fail', 'fail',
			           'error', 'fail']
		},
		{ v: undefined, 
			d: "Udf",
		  expected: ['fail', 'success', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail',
		             'fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail',
		             'error', 'success']
		},
		{ v: true, 
			d: "True",
			expected: ['fail', 'fail', 'success', 'fail', 'success', 'fail', 'fail', 'fail', 'fail', 
			           'fail', 'fail', 'fail', 'fail', 'fail', 'success', 'error', 'fail']
		},
		{ v: false, 
			d: "False",
			expected: ['fail', 'fail', 'fail', 'success', 'success', 'fail', 'fail', 'fail', 'fail',
			           'fail', 'fail', 'fail', 'fail', 'fail', 'success', 'error', 'fail']
		},
		{ v: 0, 
			d: "Integer",
			expected: ['fail', 'fail', 'fail', 'fail', 'fail', 'success', 'success', 'success', 
			           'fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'error', 'fail'
			           ]				
		},
		{ v: Number.NaN, 
			d: "NaN", 
			expected: ['fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail', 
			           'fail', 'fail', 'fail', 'fail', 'fail', 'error', 'fail']
		},
		{ v: 1.5, 
			d: "Float",
			expected: ['fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'success',
			           'fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'error', 'fail']
		},
		{ v: "str", 
			d: "String",
			expected: ['fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'success', 
			           'fail', 'fail', 'fail', 'fail', 'success', 'fail', 'error', 'success']
		},
		{ v: {}, 
			d: "Obj",
			expected: ['fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail', 
			           'success', 'fail', 'fail', 'success', 'success', 'fail', 'error', 'fail']			
		},
		{ v: [1,2], 
			d: "Array[int]",
			expected: ['fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail', 
			           'success', 'fail', 'success', 'success', 'success', 'fail', 'error', 'fail']
		},
		{ v: [true,false,true], 
			d: "Array[boolean]", 
			expected: ['fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail', 
				         'success', 'success', 'success', 'success', 'success', 'fail', 'error', 'fail']
		},
	];
	
	var j, i, v,d,exp;
	for (j in vals) {
		v = vals[j].v;
		d = vals[j].d;
		vals[j].expected.reverse();
		for (i in contr) {
			exp = vals[j].expected.pop();
			(function (v, d, c, exp) {
				JSConTest.tests.add(d, v, c, anz, {checker: makeChecker(exp)});
			}(v, d, contr[i], exp));
		}
	}
	  
	JSConTest.events.register(JSConTest.events.handler.data.create("checker"));  
	JSConTest.tests.runLazy(registerForJSTestDriver);
}());