#!/usr/bin/env bash

cd $HOME/pure

d=$(date +"%y.%-m.%d")
release_branch='r1'${d:1}

current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ $current_branch != "master" ]; then
	echo "ERR_NOT_MASTER"
	exit
fi
git pull > /dev/null
git checkout -b $release_branch > /dev/null
git push --set-upstream origin $release_branch > /dev/null

echo $release_branch
