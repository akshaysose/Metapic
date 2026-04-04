"""
Sample script to generate a few embeddings using the face-service local endpoint.
"""
import requests, json
FILES = ['sample1.jpg','sample2.jpg']
for f in FILES:
    with open(f,'rb') as fh:
        r = requests.post('http://localhost:8000/embed', files={'file': (f, fh, 'image/jpeg')})
        print(r.json())
