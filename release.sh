#!/bin/sh
# Yeni sürüm: sw.js VERSION ve index.html'deki ?v= numaralarını birlikte artırır.
set -e
cd "$(dirname "$0")"
cur=$(sed -n "s/^const VERSION = 'v\([0-9]*\)';/\1/p" sw.js)
new=$((cur+1))
sed -i "s/^const VERSION = 'v$cur';/const VERSION = 'v$new';/" sw.js
sed -i -E "s/(\.(js|css))(\?v=[0-9]+)?\"/\1?v=$new\"/g" index.html
sed -i -E "s#(src|href)=\"(https://[^\"]*)\?v=$new\"#\1=\"\2\"#g" index.html
echo "v$new"
