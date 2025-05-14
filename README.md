This has transformed — from a project to salvage the LGM archive when the
server was down and all that was left to me was a `wget` captured archive
of the site — into the offical source of the LGM 2025 website.

# Website Source new README

The static website is generated with `eleventy`.

To build the website from the sources in `current` use `$ npx @11ty/eleventy`
or for local development as an updating server `npx @11ty/eleventy --serve`.

This will put newly generated files into: `archive/index.html` and `archive/2025/`.

NOTE: within `archive/` there's the "salvaged archive" (see below) as well, so
the website is complete in this form. However, the actual website is taking
its contents from `https://github.com/libregraphicsmeeting/htdocs-2025` and
there only the `index.html` and `2025/` files are pushed/located and the
archive is created as it used to be.

## Use of GitHub actions

There are now two actions:

### `deploy-to-ghpages.yml`

This builds the page using `eleventy` and publishes it to the `gh-pages` branch. It publishes the full `archive` directory as that produces the complete page with the archive.
This runs when pushed to `main`.
The result can be seen at https://libregraphicsmeeting.strong-type.systems which is used as the staging and backup domain.

### `deploy-to-production.yml`

To run this:

* go to https://github.com/strong-type-systems/libregraphicsmeeting/actions/workflows/deploy-to-production.yml
* use the `Run workflow` select-ui, choose "Branch: main", press "Run workflow" button

This updates https://github.com/libregraphicsmeeting/htdocs-2025 which in turn will update the production server.

You will need to have a `secrets.PERSONAL_TOKEN` configured that is allowed to push to `libregraphicsmeeting/htdocs-2025`.
Here's a good entry point for advice: https://github.com/peaceiris/actions-gh-pages?tab=readme-ov-file#%EF%B8%8F-set-personal-access-token-personal_token
I'm using a "classic token" with "Select scopes: repo"

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

The `archive` directory contains code from runing the tool.

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
(venv)$ ./webfix.py -f libregraphicsmeeting.org archive
```

## Serve from http://localhost

```
~/libregraphicsmeeting$ cd archive
~/libregraphicsmeeting/archive$ python3 -m http.server
```




