#!/bin/bash
java -jar JsTestDriver/JsTestDriver-1.2.2.jar \
    --server http://localhost:8000 \
    --testOutput ./test-reports \
    --config jsTestDriver.conf \
    --tests all