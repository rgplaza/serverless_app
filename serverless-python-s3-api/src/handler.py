import json
import os
import boto3
import base64

def to_html_response_json(response,status=200):
    return {
            'statusCode': status,
            'headers': {"Access-Control-Allow-Origin": "*" , 'Content-Type': 'application/json'},
            'body': json.dumps(response, indent=4, sort_keys=True, default=str)
            }

def list_album(event, context):
    s3_conn   = boto3.client('s3') 
    s3_result =  s3_conn.list_objects(Bucket=os.environ["BUCKET"],Delimiter = "/")
    
    if "CommonPrefixes" in s3_result:
        status=200
    else:
        status=404
   
    return  to_html_response_json(s3_result,status)

def list_objects(event, context):
    album = event["pathParameters"]["album"]
    s3_conn   = boto3.client('s3') 
    try:
        s3_result =  s3_conn.list_objects_v2(Bucket=os.environ["BUCKET"],Prefix=album)
        status=200
        print(s3_result)
    except Exception as e: 
        status = 500
        s3_result="Error"

    if s3_result["KeyCount"]<2:
        status=404
    
    return to_html_response_json(s3_result,status)

def head_object(event, context):
    album = event["pathParameters"]["album"]+"/"

    s3_conn   = boto3.client('s3')  
    try:
        s3_result =  s3_conn.head_object(Bucket=os.environ["BUCKET"],Key=album)
        status = 200
        s3_result = "Existe"
    except Exception as e:
        if "Not Found" in str(e):
            status = 404
            s3_result="Not Found"
        else:
            status = 500
            s3_result="Error"
    return  to_html_response_json(s3_result,status)

def put_object(event, context):
    album = event["pathParameters"]["album"]+'/'
    
    s3_conn   = boto3.client('s3')  
    s3_result =  s3_conn.put_object(Bucket=os.environ["BUCKET"],Key=album,)
   
    return  to_html_response_json(s3_result)


def delete_object(event, context):
    album = event["pathParameters"]["album"]
    photo = event["pathParameters"]["photo"]

    if photo != 'none':
        key = os.path.join(album,photo) 

        s3_conn   = boto3.client('s3')  
        try:
            s3_result =  s3_conn.delete_object(Bucket=os.environ["BUCKET"],Key=key)
            status = 200
        except Exception as e:
            status = 500
            s3_result="Error"
    else: 
        key = album+"/"
        s3 = boto3.resource('s3')
        bucket = s3.Bucket(os.environ["BUCKET"])

        try:
            s3_result = bucket.objects.filter(Prefix=key).delete()
            status = 200
        except Exception as e:
            status = 500
            s3_result="Error"

    return  to_html_response_json(s3_result,status)

def upload_object(event, context):
    photo = event["pathParameters"]["photo"]
    album = event["pathParameters"]["album"]

    sep=b"\r\n"
    dec =base64.b64decode(event["body"])
    parts = dec.split(sep)
    if len(parts) > 2:
        dec = sep.join(parts[4:-1])
    print(dec)

    key = os.path.join(album,photo) 

    s3_conn   = boto3.client('s3')
    try:
        s3_result = s3_conn.put_object(Bucket=os.environ["BUCKET"], Key=key, Body=dec)
        print(s3_result)
        status = 200
    except Exception as e:
        status = 500
        s3_result="Error"

    return  to_html_response_json(s3_result)

