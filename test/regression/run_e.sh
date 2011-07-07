rm -f *.test.js
find . -type f -name "t.*.js" -exec ../../ocaml/jscontestbc -e {} \;
./chrome.sh run.*.htm