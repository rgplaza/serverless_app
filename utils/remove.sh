#!/bin/bash
if [ -z "$1" ]
then
    stage=dev
else
    stage=${1}
fi
echo $stage
cd serverless-web
sls remove --stage ${stage}
cd ../serverless-python-s3-api
sls remove --stage ${stage}
