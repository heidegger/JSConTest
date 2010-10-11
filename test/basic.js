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
		{v: null, d: "Null"},
		{v: undefined, d: "Udf"},
		{v: true, d: "True"},
		{v: false, d: "False"},
		{v: 0, d: "Integer"},
		{v: Number.NaN, d: "NaN" },
		{v: 1.5, d: "Float"},
		{v: "str", d: "String"},
		{v: {}, d: "Obj" },
		{v: [1,2], d: "Array[int]" },
		{v: [true,false,true], d: "Array[boolean]" },
	];
	for (var j in vals) {
		var v = vals[j].v;
		var d = vals[j].d;
		for (var i in contr) {
			JSConTest.tests.add(d, v, contr[i],anz);
			// success, fail, error
		}
	}
	  
//	var dl = JSConTest.events.enum.create('logger',"ul");
//	JSConTest.events.register(dl);
	  
	  
	var ch = checker(['statistic', 'cancel','CExpStart'],[
	    // Null
		{ msg: 'moduleChange' },
		{ msg: 'fail' },
		{ msg: 'error' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'success' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'success' },
		 // Udf
		{ msg: 'moduleChange' },
		{ msg: 'success' },
		{ msg: 'error' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'success' },
		{ msg: 'fail' },
		 // True
		{ msg: 'moduleChange' },
		{ msg: 'fail' },
		{ msg: 'error' },
		{ msg: 'success' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'success' },
		{ msg: 'fail' },
		{ msg: 'success' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		// False
		{ msg: 'moduleChange' },
		{ msg: 'fail' },
		{ msg: 'error' },
		{ msg: 'success' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'success' },
		{ msg: 'success' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		// Integer
		{ msg: 'moduleChange' },
		{ msg: 'fail' },
		{ msg: 'error' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'success' },
		{ msg: 'success' },
		{ msg: 'success' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		// NaN
		{ msg: 'moduleChange' },
		{ msg: 'fail' },
		{ msg: 'error' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		// Float
		{ msg: 'moduleChange' },
		{ msg: 'fail' },
		{ msg: 'error' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'success' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		// String
		{ msg: 'moduleChange' },
		{ msg: 'success' },
		{ msg: 'error' },
		{ msg: 'fail' },
		{ msg: 'success' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'success' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		// Object
		{ msg: 'moduleChange' },
		{ msg: 'fail' },
		{ msg: 'error' },
		{ msg: 'fail' },
		{ msg: 'success' },
		{ msg: 'success' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'success' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		// Array[int]
		{ msg: 'moduleChange' },
		{ msg: 'fail' },
		{ msg: 'error' },
		{ msg: 'fail' },
		{ msg: 'success' },
		{ msg: 'success' },
		{ msg: 'success' },
		{ msg: 'fail' },
		{ msg: 'success' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		// Array[boolean]
		{ msg: 'moduleChange' },
		{ msg: 'fail' },
		{ msg: 'error' },
		{ msg: 'fail' },
		{ msg: 'success' },
		{ msg: 'success' },
		{ msg: 'success' },
		{ msg: 'success' },
		{ msg: 'success' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
		{ msg: 'fail' },
	]);
	JSConTest.events.register(ch);

	JSConTest.tests.runLazy(registerForJSTestDriver);
}());