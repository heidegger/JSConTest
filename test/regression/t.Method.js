/*c () -> undefined */
function f() {
    var o = { x : 5 };
    o.m = m;
    var x = o.m(2);
    if (x !== 5) {
	throw "Should not happen, x is unequal to 5, but it is " + x;
    };
}

function m(x) {
    return this.x;
}