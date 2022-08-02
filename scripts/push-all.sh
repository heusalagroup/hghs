#!/bin/bash
cd "$(dirname "$0")/.."
set -x
git push
cat .gitmodules |grep -F path|awk '{print $3}'|while read DIR; do (cd $DIR && git push); done
