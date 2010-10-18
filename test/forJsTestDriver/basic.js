/* Test, as in basic.html to use by JsTestDriver
 *   http://code.google.com/p/js-test-driver/
 * to support running the test cases in multiple browsers
 */

(function () {
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
		x,
		JSConTest.contracts.NIntervall(0,5),
		JSConTest.contracts.TopOUndef,
		JSConTest.contracts.EObject([{name: "bla", contract: JSConTest.contracts.Boolean}])
	];
	var vals = [
		{ v: null, 
			d: "Null", 
		  expected: ['success', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail',
			           'fail', 'fail', 'fail', 'fail', 'fail', 'success', 'fail', 'fail',
			           'error', 'fail', 'fail', "success", "fail"]
		},
		{ v: undefined, 
			d: "Udf",
		  expected: ['fail', 'success', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail',
		             'fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail',
		             'error', 'success', 'fail', 'fail', "fail"]
		},
		{ v: true, 
			d: "True",
			expected: ['fail', 'fail', 'success', 'fail', 'success', 'fail', 'fail', 'fail', 'fail', 
			           'fail', 'fail', 'fail', 'fail', 'fail', 'success', 'error', 'fail', 
			           'fail', "success", "fail"]
		},
		{ v: false, 
			d: "False",
			expected: ['fail', 'fail', 'fail', 'success', 'success', 'fail', 'fail', 'fail', 'fail',
			           'fail', 'fail', 'fail', 'fail', 'fail', 'success', 'error', 
			           'fail', 'fail', "success", "fail"]
		},
		{ v: 0, 
			d: "Integer",
			expected: ['fail', 'fail', 'fail', 'fail', 'fail', 'success', 'success', 'success', 
			           'fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'error', 
			           'fail', 'success', "success", "fail"]				
		},
		{ v: Number.NaN, 
			d: "NaN", 
			expected: ['fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail', 
			           'fail', 'fail', 'fail', 'fail', 'fail', 'error', 'fail', 'fail', "success", "fail"]
		},
		{ v: 1.5, 
			d: "Float",
			expected: ['fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'success',
			           'fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'error', 
			           'fail', 'success', "success", "fail"]
		},
		{ v: "str", 
			d: "String",
			expected: ['fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'success', 
			           'fail', 'fail', 'fail', 'fail', 'success', 'fail', 'error', 
			           'success', 'fail', "success", "fail"]
		},
		{ v: {}, 
			d: "Obj",
			expected: ['fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail', 
			           'success', 'fail', 'fail', 'success', 'success', 'fail', 'error', 
			           'fail', 'fail', "success", "fail"]			
		},
		{ v: [1,2], 
			d: "Array[int]",
			expected: ['fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail', 
			           'success', 'fail', 'success', 'success', 'success', 'fail', 'error', 
			           'fail', 'fail', "success", "fail"]
		},
		{ v: [true,false,true], 
			d: "Array[boolean]", 
			expected: ['fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail', 
				         'success', 'success', 'success', 'success', 'success', 'fail', 'error', 
				         'fail', 'fail', "success", "fail"]
		},
		{ v: { bla: true, blub: "not existens"}, 
			d: "Object with bla and blub", 
			expected: ["fail", "fail", "fail", "fail", "fail", "fail", "fail", "fail", "fail", 
			           "success", "fail", "fail", "success", "success", 
			           "fail", "error", "fail", "fail", "success", "success"
			           ]
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
}());