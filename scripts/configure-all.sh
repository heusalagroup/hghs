#!/bin/bash
cd "$(dirname "$0")/.."
set -x
git config pull.rebase false
cat .gitmodules |grep -F path|awk '{print $3}'|while read DIR; do 
  (cd $DIR && git config pull.rebase false); 
done
