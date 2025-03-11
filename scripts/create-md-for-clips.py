#!/usr/bin/env python
# -*- coding: utf-8 -*-

# this script create the /clips/ files  from the /program/ files
# ./scripts/create-md-for-clips.py -f current/2025/program/* -t talk

import os
import argparse
import frontmatter



parser = argparse.ArgumentParser()
parser.add_argument('-f', '--files', dest='files', help='target files', type=argparse.FileType('r'), nargs='+', required=True)
parser.add_argument('-t', '--types', dest='types', help='accepted types', type=str, nargs='+', default='talk')
args = parser.parse_args()

for file in args.files:
    print(file.name)
    post = frontmatter.load(file)
    if 'type' in post:
        if isinstance(post['type'], str):
            if post['type'] in args.types:
                post.content = '''# {{title}}

{% for host in hosts %}
 * {{host}}
{% endfor %}
 '''
                with open(os.path.join('current', '2025', 'clips', os.path.basename(file.name)), "w") as f:  
                    f.write(frontmatter.dumps(post))
