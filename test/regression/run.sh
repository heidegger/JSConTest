rm -f *.test.js
find . -type f -name "t.*.js" -exec ../../ocaml/jscontestbc {} \;
./chrome.sh run.*.htm