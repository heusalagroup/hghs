#!/bin/bash
cd "$(dirname "$0")/.."
set -x
git pull
cat .gitmodules |grep -F path|awk '{print $3}'|while read DIR; do (cd $DIR && git pull); done
