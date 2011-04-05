#!/bin/bash
DIR="`dirname "$1"`"
BASE="`basename "$1" ".mly"`"
pushd $DIR
ocamlyacc -v "$BASE.mly"
cat "$BASE.mlyy" "$BASE.mli" > "$BASE.mli_mtp"
mv "$BASE.mli_mtp" "$BASE.mli"
popd
