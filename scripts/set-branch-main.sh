#!/bin/bash
cd "$(dirname "$0")/.."
set -x
#git checkout main
cat .gitmodules |grep -F path|awk '{print $3}'|while read DIR; do 
  (cd $DIR && git checkout main); 
done
