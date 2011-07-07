/*c () -> undefined */
function f() {
    g();
}

var g = function g() {
    h(5);
};

/*c int -> undefined ~noTests */
function h(x) {
    if (x !==5 ) {
	throw "This schould not happen, x !== 5";
    }
}