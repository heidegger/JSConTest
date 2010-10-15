// register test case for JsTestDriver
(function () {
	function registerForJSTestDriver(m, i, test, f) {
		var tc = TestCase(m + " - " + i);
		tc.prototype["test" + i] = f;				
	}
	JSConTest.tests.runLazy(registerForJSTestDriver);
}());
