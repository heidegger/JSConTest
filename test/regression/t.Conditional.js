/*c () -> undefined */
function f() {
    var x = 3;
    var y = 2;
    if (x === y + 1) {
	x = 5;
    };
    switch (x) {
    case 0: throw "Should not happen 0";
    case 1: throw "Should not happen 1";
    case 2: throw "Should not happen 2";
    case 3: throw "Should not happen 3";
    case 4: throw "Should not happen 4";
    case 5: 
	break;
    default: throw "Should not happen default";
    };
}