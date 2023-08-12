#!/bin/bash
cd "$(dirname "$0")/.."
#set -x

FORMAT='%-15s %-22s %-20s %s\n'

ROOT_BRANCH="$(
    git branch \
     | grep -E '^\*' \
     | sed -re 's/^\* *//' \
     | tr -d '\n'
)"

printf "$FORMAT" "$ROOT_BRANCH" "." "." "." "."

cat .gitmodules |grep -F path|awk '{print $3}'|while read DIR; do  
  (
    cd $DIR
    MODULE=$(echo $DIR|sed -re 's@^.*/src/@@'|tr '/' '.')
    TAG=$((git describe --tags 2>/dev/null)|sort -n|tail -n1)
    if test "x$TAG" = x; then
      TAG="$(git rev-parse --short HEAD)"
    fi
    BRANCH="$(
      git branch \
       | grep -E '^\*' \
       | sed -re 's/^\* *//' \
       | tr -d '\n'
    )"

    printf "$FORMAT" "$BRANCH" "$MODULE" "$TAG" "$DIR"
  ); 
done
