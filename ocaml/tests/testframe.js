function load() {
  TRANS.initLibrary();
  alert("t="+t);
  alert("start test code");
  
  test();
  alert("t="+t);
  alert("start revert");
  TRANS.revert();
  alert("t="+t);

}
