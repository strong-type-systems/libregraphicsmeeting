#! /usr/bin/env python

import os
import shutil
import argparse
from pathlib import Path
from bs4 import BeautifulSoup
from urllib.parse import unquote, urlparse

def clear_dir(dir_name):
    for filename in os.listdir(dir_name):
        file_path = os.path.join(dir_name, filename)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
        except Exception as e:
            print(f'Failed to delete {file_path}. Reason:', e)

class Rule:
    def __init__(self, namesMap, selectorFn, transformFn):
        self._selector_fn = selectorFn
        self._transform_fn = transformFn
        self.namesMap = namesMap;

    def matches(self, file):
        return self._selector_fn(self, file)

    def apply(self, file):
        return self._transform_fn(self, file)

    def __str__(self):
        return f'<Rule {self._selector_fn.__name__} {self._transform_fn.__name__}>'

class CompoundRule:
    def __init__(self, namesMap, selectorFn, rules):
        self._selector_fn = selectorFn
        self.namesMap = namesMap
        self._rules = list(CTOR(self.namesMap, *args) for CTOR, *args in rules)

    def matches(self, file):
        return self._selector_fn(self, file)

    def apply(self, file):
        for rule in self._rules:
            if not rule.matches(file):
                continue
            rule.apply(file)
        return file

    def __str__(self):
        return f'<CompoundRule {self._selector_fn.__name__} rules amount: {len(self._rules)}>'



def select_all(rule, file):
    return True

def select_none(rule, file):
    return False

def select_html_file(rule, file):
    return b'<html' in file.payload \
        and not any(file.normalized_source_name.endswith(suffix) for suffix in ['.js', '.css', '.json', '.txt'])

def select_css_file(rule, file):
    return '.css' in file.normalized_source_name

def parse_html(rule, file):
    parser = 'html5lib' #'html.parser'
    if file.normalized_source_name.endswith('.xml') \
            or file.payload.startswith(b'<?xml version='):
        parser = 'xml'
    file.payload = BeautifulSoup(file.payload, parser)

def serialze_html(rule, file):
    file.payload = file.payload.prettify().encode("utf8")

def read_file(rule, file):
    with open(file.abs_source_path, 'rb') as source:
        file.payload = source.read()

def write_file(rule, file):
    with open(file.abs_target_path, 'wb') as target:
        target.write(file.payload)


def parse_css(rule, file):
    file.payload = file.payload.decode('utf-8')

def serialze_css(rule, file):
    file.payload = file.payload.encode('utf-8')

def css_rewrite_links(rule, file):
    # e.g @import url('../twentytwelve/style.css');
    lines = []
    URL_START_TOKEN = 'url('
    for line in file.payload.splitlines():
        if URL_START_TOKEN not in line:
            lines.append(line)
            continue
        start = 0
        while True:
            seen = []
            url_index = line.find(URL_START_TOKEN, start);
            if url_index == -1:
                seen.append(line[start:])
                break
            seen.append(URL_START_TOKEN)
            start = url_index + len(URL_START_TOKEN)
            quote = line[start: start + 1]
            if quote not in ['"', "'"]:
                quote = ''
            else:
                seen.append(quote)
                start += len(quote)
            url_start = start + len(URL_START_TOKEN)
            URL_END_TOKEN = f'{quote})'
            url_end = line.find(URL_END_TOKEN, url_start)
            if url_end == -1:
                seen.append(line[start:])
                break

            url = line[start:url_end]
            start += len(url) + len(URL_END_TOKEN)
            if not url.startswith('data:'):
                new_url = rewrite_href(rule, file, url)
                # print('url:',url, 'new_url', new_url)
            else:
                new_url = url

            seen.append(new_url)
            seen.append(URL_END_TOKEN)
        line = ''.join(seen)

        lines.append(line)
    return '\n'.join(lines)

def rewrite_href(rule, file, href):
    if 'libregraphicsmeeting.org' in href:
        for start in [
                    'http://libregraphicsmeeting.org/'
                  , 'https://libregraphicsmeeting.org/'
                  , '//libregraphicsmeeting.org/'
                ]:
            if href.startswith(start):
                href = f'/{href[len(start):]}'
    parsed = unquote(href)
    parsed_path = Path(parsed)
    source_dir = Path(file.normalized_source_name).parent
    if not len(parsed_path.parts):
        return href
    if parsed_path.parts[0] == '/':
        normalized_href = parsed
    else:
        # it is relative!
        if parsed_path.parts[0] == '..':
            for i in range(0, len(parsed_path.parts)):
                if parsed_path.parts[i] == '..':
                    source_dir = source_dir.parent
                else:
                    break
            normalized_href = str(Path(*source_dir.parts, *parsed_path.parts[i:]))
        else:
            normalized_href = f'{source_dir}/{parsed}'

    if normalized_href in rule.namesMap and normalized_href != rule.namesMap[normalized_href]:
        href = rule.namesMap[normalized_href]
    return href

def html_rewrite_links(rule, file):
    for [tag_name, attr] in [
            ['a', 'href']
          , ['link', 'href']
          , ['script', 'source']
          , ['script', 'src']
          , ['img', 'src']
          , ['form', 'action']
        ]:
        for tag in file.payload.find_all(tag_name):
            if not tag.has_attr(attr):
                continue
            tag[attr] = rewrite_href(rule, file, tag[attr])


class File:
    def __init__(self, abs_source_path, abs_target_path, normalized_source_name, normalized_target_name):
        self.abs_source_path = abs_source_path
        self.abs_target_path = abs_target_path
        self.normalized_source_name = normalized_source_name
        self.normalized_target_name = normalized_target_name
        self.payload = None

    def __str__(self):
        return f'<File {self.normalized_source_name} to {self.normalized_target_name}>'
HTML_RULES = (
    (Rule, select_all, parse_html)
  , (Rule, select_all, html_rewrite_links)
  , (Rule, select_all, serialze_html)
)

CSS_RULES = (
    (Rule, select_all, parse_css)
  , (Rule, select_all, css_rewrite_links)
  , (Rule, select_all, serialze_css)
)

MAIN_RULES = (
    (Rule, select_all, read_file)
  , (CompoundRule, select_html_file, HTML_RULES)
  , (CompoundRule, select_css_file, CSS_RULES)
  , (Rule, select_all, write_file)
)

def rename_file(file_name):
    new_name = unquote(file_name)\
        .replace('?', '_')\
        .replace('/', '_')\
        .replace('&', '_')\
        .replace(';', '_')\
        .replace(' ', '_')\
        .replace('﹖', '_')
        #.replace('=', '_')\
    for suffix in ['.css', '.js']:
        # The web serve may send the wrong mime type is this is not the case
        if suffix in new_name and not new_name.endswith(suffix):
            new_name = new_name + suffix
            break
    # There are .php files that are by a simple server rather served as pctet/stream
    # than as text/html
    for suffix, additional in [('.php', '.html')]:
        # The web serve may send the wrong mime type is this is not the case
        if new_name.endswith(suffix):
            new_name = new_name + additional
            break
    return new_name

def main(source_dir, target_dir, force=False):
    print(f'source_dir {source_dir}, target_dir {target_dir}, force {force}')
    source_dir_path = Path(source_dir)
    target_dir_path = Path(target_dir)

    try:
        target_dir_path.mkdir(parents=True, exist_ok=False)
    except FileExistsError as error:
        if force:
            print(f'Target dir "{target_dir}" exists, -f (force) is True: cleaning out.')
            clear_dir(target_dir)
        else:
            raise Exception(f'Target dir "{target_dir}" exists but -f (force) is not True.')

    namesMap = {};
    all_files = []
    # traverse root directory, and list directories as dirs and files as files
    for root, dirs, files in os.walk(source_dir):
        path = root.split(os.sep)
        local_source_dir_path = Path(*path)
        # print((len(path) - 1) * '#', os.path.basename(root), ' ///' , 'root', root, 'path', path)

        local_target_dir_path = Path(target_dir, *path[1:])

        # Create the target directory
        # NOTE: all of these paths look OK to me at a first glance,
        # hence I see no need yet to rewrite any of them.
        local_target_dir_path.mkdir(parents=True, exist_ok=True)

        for file in files:
            target_file = rename_file(file)
            abs_source_path = Path(*local_source_dir_path.parts, file)
            abs_target_path = Path(*local_target_dir_path.parts, target_file)

            normalized_source_name = f'/{abs_source_path.relative_to(source_dir_path)}'
            normalized_target_name = f'/{abs_target_path.relative_to(target_dir_path)}'
            # This loop is only to fill the renaming map, then
            # we have a loop with rule selectors.
            namesMap[normalized_source_name] = normalized_target_name
            #if normalized_source_name != normalized_target_name:
            #    print('file name change', normalized_source_name, '=>', normalized_target_name)
            file_obj = File(abs_source_path, abs_target_path, normalized_source_name, normalized_target_name)
            all_files.append(file_obj)

    rules = CompoundRule(namesMap, select_all, MAIN_RULES)
    for file in all_files:
            # apply rules
            # print(file.normalized_source_name)
            # read: applies to all files
            #    put the current file content into the temp file
            #
            #
            #
            # write: applies to all files
            #    write the current file content to the (rewritten?) destination

            # NOTE operations we might want to do:
            #
            # rewrite file names
            #   if file names get rewritten we need to rewrite links ins files as well
            #   hence, it would be good to first know all re-namings before rewriting contents
            # rewrite contents
            #   this is AFAIK mainly about rewriting links and other urls (src in images, css, js)
            #   - some files can be copied without rewriting
            #   - some files may need several rewriting functions
            #   - not all files are the same type, I've even seen html in json data (see e.g. /libregraphicsmeeting.org/lgm/wp-json/wp/v2/pages/261)
            #   - the main task is:
            #       * finding all urls in all relevant files,
            #       * parsing them correctly
            #       * and applying the correct rewrite, if necessary
            #   - with many possible rewrite actions, it's necessary to
            #     identify if they apply and if relevant to have a good
            #     order
            #   - hence, each rule may have a "selector"
            rules.apply(file);

if __name__ == "__main__":
    argument_parser = argparse.ArgumentParser(
        description='Fix the contents of libregraphicsmeeting.org as scraped '
        'by wget into a version that can be served with a simple static server');

    argument_parser.add_argument('source_dir',
        help='The source of the website data.')

    argument_parser.add_argument('target_dir',
        help='Target directory name, will be created. Use --force if it already exist '
             'and its contents can be overridden.')

    argument_parser.add_argument('-f', '--force', action='store_true',
        help='If target_dir exists, allow to change its contents.')

    args = argument_parser.parse_args()

    print('vars(args)', vars(args))
    main(**vars(args))
