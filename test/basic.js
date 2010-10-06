/* Test, as in basic.html to use by JsTestDriver
 * http://code.google.com/p/js-test-driver/
 * to support running the test cases in multiple browsers
 */

BasicTestCase = TestCase("BasicTestCase");

BasicTestCase.prototype.testBasic = function () {
	var anz = 1;
	
	var u = JSConTest.tests.Name("u");
	JSConTest.tests.Let("u",JSConTest.tests.Union(JSConTest.tests.Undefined, u));
	var x = JSConTest.tests.Name("x");
	JSConTest.tests.Let("x",JSConTest.tests.Union(JSConTest.tests.Undefined,JSConTest.tests.String));
	
	var contr = [
		JSConTest.tests.Null,
		JSConTest.tests.Undefined,
		JSConTest.tests.True,
		JSConTest.tests.False,
		JSConTest.tests.Boolean,
		JSConTest.tests.Integer,
		JSConTest.tests.IIntervall(0,5),
		JSConTest.tests.Number,
		JSConTest.tests.String,
		JSConTest.tests.Object,
		JSConTest.tests.Array(JSConTest.tests.Boolean),
		JSConTest.tests.Array(JSConTest.tests.Top),
		JSConTest.tests.Union(JSConTest.tests.Object,JSConTest.tests.Null),
		JSConTest.tests.Union(JSConTest.tests.Object,JSConTest.tests.String),
		JSConTest.tests.Union(JSConTest.tests.True,JSConTest.tests.Boolean),
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
	  
	  
	var ch = checker(['stat','CExpStart'],[
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
	JSConTest.tests.run();
};