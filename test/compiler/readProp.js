/*c ([0;3], { p : { p : { p: top }  } } , "p") -> top 
  | ([0;2], { p : { p: top }  } , "p") -> top 
  | ([0;1], { p : top  } , "p") -> top 
  | (0, top, top) -> top
*/
function f(i, o, p) {
  if (i == 0) {
    return o;
  } else {
    return f(i - 1, o[p], p);
  }
}

