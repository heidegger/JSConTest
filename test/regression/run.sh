rm -f *.test.js
find . -type f -name "*.js" -exec ../../ocaml/jscontestbc {} \;
./chrome.sh *.htm