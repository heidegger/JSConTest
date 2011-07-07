if [ -n "$1" ] ; then
    cp *js.draft t.$1.js
    cp *htm.draft run.$1.htm
else
    echo "no name give"
fi