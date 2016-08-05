#!/usr/bin/env bash

#branch=$(ssh ubuntu@direct.stage.scrollback.io /home/ubuntu/scrollback/tools/create-hnbr-release-branch.sh)
branch=$($HOME/pure/tools/create-release-branch.sh)
if [[ $branch = "ERR_NOT_MASTER" ]]; then
   echo "A release branch was not created because the staging server is not running master. $branch"
   exit
fi

read -p "Release branch $branch created. Deploy to production server $1 (y/N)? " confirm
if [[ $confirm = "y" ]]; then
   echo $branch 'will be deployed'
   $HOME/pure/tools/./deploy.sh $branch $1
else echo 'canceled'
fi
#echo new branch is: $branch
