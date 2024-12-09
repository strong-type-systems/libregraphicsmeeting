# Work in progress: tranformations on the libregraphicsmeeting.org website archive

This code transforms websites for/from libregraphicsmeeting.org.

The directory `libregraphicsmeeting.org` contains files scraped from the web with the `wget` tool, when the website was still available. It combines it with static files from https://github.com/libregraphicsmeeting/ ("htdocs-20xx-static") repositories. The quality if the input data can be improved if required. It's a bit chaotic to be hones.

The transformations are:

* New file names, if they contain characters that are hard to serve with a simple server e.g. (`?`)
* Within the files:
  * Rewrite links (`href`, `src`,`url()` etc.) if they were renamed.
  * Remove the domain name from links e.g. `https://libregraphicsmeeting.org` to make the content agnostic of the actual domain that is used to serve the files.

Transformations are not yet complete.

The out directory contains code from runing the tool.

## Install

```
# setup/install
$ python -m venv venv
$ . venv/bin/acivate
(venv)$ pip install --upgrade pip
(venv)$ pip install -r requirements.txt
```


## Execute the tool

```
(venv)$ ./webfix.py -f libregraphicsmeeting.org out
```

## Serve from http://localhost

```
~/libregraphicsmeeting$ cd out
~/libregraphicsmeeting/out$ python3 -m http.server
```




