#!/usr/bin/env bash
if [[ "$1" == "" ]]; then
	echo "No branch name provided"
	exit 1
fi

echo "Deploying branch $1 to $2"

echo 'cd pure && git fetch origin && git checkout '$1' && export NODE_ENV="development" && echo $NODE_ENV && npm install && export NODE_ENV="production" && cd src/submodules/know && git checkout master && git pull && npm install && cd ../../.. && npm run build && sudo restart pure && tail -f logs/now.log' | ssh $2
