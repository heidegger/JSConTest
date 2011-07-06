if [ -n "$1" ] ; then
    cp *js.draft $1.js
    cp *htm.draft $1.htm
else
    echo "no name give"
fi