This has transformed — from a project to salvage the LGM archive when the
server was down and all that was left to me was a `wget` captured archive
of the site — into the offical source of the LGM 2025 website.

# Website Source new README

The static website is generated with `eleventy`.

To build the website from the sources in `current` use `$ npx @11ty/eleventy`
or for local development as an updating server `npx @11ty/eleventy --serve`.

This will put newly generated files into: `docs/index.html` and `docs/2025/`.

NOTE: within `docs/` there's the "salvaged archive" (see below) as well, so
the website is complete in this form. However, the actual website is taking
its contents from `https://github.com/libregraphicsmeeting/htdocs-2025` and
there only the `index.html` and `2025/` files are pushed/located and the
archive is created as it used to be.

## Use GitHub actions

In order to make a GitHub actions workflow possible, some changes will be
done:

* The `docs/*` archive will still live in here (maybe "docs" renamed to "archive"),
* however the `docs/index.html` and `docs/2025/*` will be put into `.gitignore`.
That way, we can still use `npx @11ty/eleventy --serve` for local development.
* The github pages version version for staging currently under `https://libregraphicsmeeting.strong-type.systems/`
will be served from a gh-pages branch.
* We'll make an action that on push to `main` runs `npx @11ty/eleventy`, then copies all the contents of `docs/` into the `gh-pages` branch.
* We'll make a second action, on manual dispatch (`workflow_dispatch`),
  to update the production version. I.e. update  the files in
  `libregraphicsmeeting/htdocs-2025/public/`. It would be more faithful
  to the original workflow to get the files from the staging version,
  but getting it from a fresh build decouples it from the gh-pages workflow
  and that's better i.e. when a quicker update is required. Also, it would
  be very similar to the gh-actions workflow, just copying less/selected files.



# Archive Salvage old README

## Work in progress: tranformations on the libregraphicsmeeting.org website archive

This code transforms websites for/from libregraphicsmeeting.org.

The directory `libregraphicsmeeting.org` contains files scraped from the web with the `wget` tool, when the website was still available. It combines it with static files from https://github.com/libregraphicsmeeting/ ("htdocs-20xx-static") repositories. The quality if the input data can be improved if required. It's a bit chaotic to be hones.

The transformations are:

* New file names, if they contain characters that are hard to serve with a simple server e.g. (`?`)
* Within the files:
  * Rewrite links (`href`, `src`,`url()` etc.) if they were renamed.
  * Remove the domain name from links e.g. `https://libregraphicsmeeting.org` to make the content agnostic of the actual domain that is used to serve the files.

Transformations are not yet complete.

The `docs` directory contains code from runing the tool. `docs` is chosen because it's the one name GitHub actions allows to serve a website directly from a subdirectory in a repository.

### Install

```
# setup/install
$ python -m venv venv
$ . venv/bin/acivate
(venv)$ pip install --upgrade pip
(venv)$ pip install -r requirements.txt
```


## Execute the tool

```
(venv)$ ./webfix.py -f libregraphicsmeeting.org docs
```

## Serve from http://localhost

```
~/libregraphicsmeeting$ cd docs
~/libregraphicsmeeting/docs$ python3 -m http.server
```




