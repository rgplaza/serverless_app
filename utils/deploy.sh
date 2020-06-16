#!/bin/bash
if [ -z "$1" ]
then
    stage=dev
else
    stage=${1}
fi
echo $stage
cd serverless-python-s3-api
sls deploy --stage ${stage}
api=$(sls info --stage ${stage} -v |grep ServiceEndpoint|cut -d" " -f2)

if [ ${stage} == "tests" ]
then
    echo ${api}/list_album > /tmp/test_api
fi


cd ../serverless-web
echo "const server_root = '${api}'" > static/apiserver.js
sls deploy  --stage ${stage}

web=$(sls info --stage ${stage} -v |grep weburl|cut -d" " -f2)
echo "WEB DESPLEGADA EN:"
echo ${web} 

if [ ${stage} == "tests" ]
then
    echo ${web} > /tmp/test_web
fi
