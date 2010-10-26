/*c [0; 50] -> int */
function f(x) {
  if (x === 0) {
    return 0;
  }
  if (x === 1) {
    return 1;
  }
  return x * f(x - 1);
}

