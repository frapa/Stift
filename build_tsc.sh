cd ./content/admin/js/

tsc
for f in dest/*.js; do cat $f; echo; done > concat.js
