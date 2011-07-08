/*c () -> [top] */
function f() {
    var a = new Array();
    return a;
}

/*c () -> undefined */
function g() {
    var a = f();
    a.push(5);
    if (a[a.length-1] !== 5) { 
	throw "Should not happen, the first entry of the array was set to 5";
    };
}
