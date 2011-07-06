/*c () -> undefined */
function f() {
    var o = {};
    o.x = o.y = "bla";
    if (o.x !== "bla") { 
	throw "Should not happen x";
    };
    if (o.y !== "bla") { 
	throw "Should not happen y";
    };
}