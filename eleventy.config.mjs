import markdownIt from "markdown-it";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
// import path from 'path'
import fs from 'fs';
import eleventyNavigationPlugin from "@11ty/eleventy-navigation";
import { EleventyHtmlBasePlugin } from "@11ty/eleventy";
import embedEverything from "eleventy-plugin-embed-everything";
import markdownItGitHubHeadings from "markdown-it-github-headings";
import pluginRss from "@11ty/eleventy-plugin-rss";
import Nunjucks from "nunjucks";
import schedule from "./lib/js/schedule.mjs"

import { createHash } from 'node:crypto';

function cacheBusterUrl(dir, rootPath, file) {
    const rewriteSource = {
            'css/main.css': 'css/main.raw.css'
        }
      , sourceFile = Object.hasOwn(rewriteSource, file)
                ? rewriteSource[file]
                : file
      ;
    const key = `file:${sourceFile}`;
    if(!Object.hasOwn(this, key)) {
        const data = fs.readFileSync(`${dir}/${sourceFile}`);
        this[key] = createHash('sha256').update(data).digest('hex');
    }
    return `${rootPath}/${file}?cacheBuster=${this[key]}`;
}

function newsDate(page) {
    const [y, m, d] =page.fileSlug.split('-', 3).map(i=>parseFloat(i))
      , date = new Date(y, m-1, d)
      ;
    return `<time datetime="${date.toISOString()}">${date.toDateString()}</time>`;
}

function renderNews(items, limit=Infinity) {
    const result = ['<ol class="news">']
      , posts = items.toSorted((a,b)=>a.page.fileSlug.localeCompare(
                    b.page.fileSlug, 'en', { sensitivity: 'base' }))
                .reverse()
                .slice(0, limit)
      ;
    for(const post of posts) {
    result.push(`<li><article>
        <span class="date"></span>
        ${newsDate(post.page)}
        <h1><a href="${post.url}">${post.data.title}</a></h1>
        <p class="lead">${post.data.lead ? post.data.lead : ''} <a href="${post.url}">(…\xa0full\xa0announcement)</a></p>
        </article></li>\n`);
    }
    result.push('</ol>');
    return result.join('');
}

function wrapShortcode(fn) {
    return (...args)=> {
        try {
            return fn(...args);
        }
        catch(e) {
            // eleventy error reporting is bad when called as a shortcode...
            console.error(e);
            throw e;
        }
    }
};

function _sortEventsByDate (a, b) {
    const aDate = a.data.dailySchedules.keyToTimes.get(a.fileSlug)?.[0]
        , bDate = b.data.dailySchedules.keyToTimes.get(b.fileSlug)?.[0]
        ;
    if(aDate === undefined && bDate === undefined)
        return 0;
    if(aDate === undefined)
        return 1;
    if(bDate === undefined)
        return -1;
    return aDate - bDate;
}

export default function (eleventyConfig) {
    // Output directory: _site
    const dir = {
            input: 'current'
          , output: 'archive'
        }
      , rootDir = '2025'
      , rootPath = `/${rootDir}`
      ;


    const nunjucksEnvironment = new Nunjucks.Environment(
        new Nunjucks.FileSystemLoader(`${dir.input}/_includes`)
        );
    eleventyConfig.setLibrary('njk', nunjucksEnvironment);
    eleventyConfig.setIncludesDirectory(`_includes`);
    eleventyConfig.addPlugin(eleventyNavigationPlugin);
    eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
    eleventyConfig.addPlugin(embedEverything);

    eleventyConfig.addPreprocessor("macro-inject", ".njk,.md", (data, content) => {
          return `{%- import "macros.njk" as macro with context -%}\n` + content;
    });

    // use this as the default layout.
    eleventyConfig.addGlobalData("layout", "lgm25");
    // This requires dir.input as that setting is not passed to addPassthroughCopy.
    eleventyConfig.addPassthroughCopy(`${dir.input}${rootPath}/css`);
    eleventyConfig.addPassthroughCopy(`${dir.input}${rootPath}/js`);
    eleventyConfig.addPassthroughCopy(`${dir.input}${rootPath}/img`);

    let mdOptions = {
        html: true,
        // breaks: true,
        linkify: true,
        typographer: true,
    };
    const md = markdownIt(mdOptions);
    const headingsOptions = {
        // NOTE: I support the cause of adding prefixes to heading ids,
        // as described in the docs of markdown-it-github-headings, but
        // the hrefs created here do not contain the prefixes. The suggestion
        // is to handle this by listening to hash changes and intercept
        // these, I'm not interested in that approach, I could live with
        // links to e.g. #section-introduction but I also think the risk
        // is in this case not really high, so I just don't use prefixes.
          prefixHeadingIds: false
        //, prefix: 'section-'
        , linkIcon: '#'
        , className: 'heading_anchor'
    };
    md.use(markdownItGitHubHeadings, headingsOptions)
    eleventyConfig.setLibrary("md", md);


    // This replicates (part of) the behavior of markdownItGitHubHeadings
    // to be used as a shortcode.
    eleventyConfig.addShortcode('heading', (tag, text, achor=null)=>{
        const {prefixHeadingIds, prefix, linkIcon, className} = headingsOptions
          , rawId = achor === null ? encodeURIComponent(text) : achor
          , id = prefixHeadingIds
                ? `${prefix}${rawId}`
                : rawId
                ;
        return `<${tag}><a
            id="${id}"
            href="#${id}"
            class="${className}"
            aria-hidden="true"
            >${linkIcon}</a>${text}</${tag}>`;
    });


    eleventyConfig.addPlugin(syntaxHighlight);
    eleventyConfig.addGlobalData('eleventyComputed.rootPath', ()=>{
        // not sure if computation is required in this case
        //return data=>data.page.url
        //        .split('/')
        //        .filter(x=>x)
        //        .map(()=>'../')
        //        .join('');
        //}
        return rootPath;
    });


    // Duplicate landing page in the root.
    // A redirection from root to /2025 would be better IMHO
    // but probably <link rel="canonical" href="https://libregraphicsmeeting/2025" /> is sufficient
    // The navigation will be based on the /2025 index, so that the site
    // is at any time suitable as a self contained archive.
    eleventyConfig.addTemplate(
                `index.md`
              , fs.readFileSync(`${dir.input}/2025/index.md`)
              , {eleventyNavigation: null}
    );
    eleventyConfig.addGlobalData('logo_boxes',  fs.readFileSync(`${dir.input}/2025/css/lgm_2025-boxes.svg`));
    eleventyConfig.addGlobalData('logo_text',  fs.readFileSync(`${dir.input}/2025/css/lgm_2025-text.svg`));
    eleventyConfig.addGlobalData('reimagination',  fs.readFileSync(`${dir.input}/2025/css/re-imagination.svg`));
    eleventyConfig.addPlugin(pluginRss);
    eleventyConfig.addShortcode('newsDate', newsDate);
    eleventyConfig.addShortcode('news', renderNews);

    // I use this for the css and js files. Especially IPhone seems
    // to have trouble to update these when they have changed. Looks
    // like a server configuration thing, but I can't do much in that
    // regard from here. I'd prefer to remove this again at some point.
    // This version hashes the file contents, so the cache will only
    // refresh when the file content changes.
    eleventyConfig.addShortcode('cacheBusterUrl', wrapShortcode(
        cacheBusterUrl.bind({}/* cache */, `${dir.input}${rootPath}/`, rootPath)));

    for(const [tag, fn] of schedule.shortcodes)
        eleventyConfig.addShortcode(tag, wrapShortcode(fn))

    eleventyConfig.addFilter('filterPage', (pages, ...pathParts) => {
        const path = [rootPath, ...pathParts].join('/');
        return pages.find(page => page.filePathStem === path);
    });

    eleventyConfig.addCollection('eventsForHost', function (collectionApi) {
        const hosts = new Map();
        for(const item of collectionApi.getAll()) {
            if (item.data.hosts) {
                for(const hostSlug of item.data.hosts) {
                    if(!hosts.has(hostSlug))
                        hosts.set(hostSlug, []);
                    hosts.get(hostSlug).push(item);
                }
            }
        }
        for(const events of hosts.values()){
            // sort in place
            events.sort(_sortEventsByDate);
        }
        return hosts
    })


    eleventyConfig.addGlobalData('dailySchedules', schedule.createDailySchedules());

    const _isProgramItem = item=>item.page.filePathStem.startsWith(`${rootPath}/program/`)
                                        && item.data.layout === 'event.njk';
    eleventyConfig.addCollection('allEvents', function (collectionApi) {
        const events = new Map();
        for(const item of collectionApi.getAll()) {
            if (_isProgramItem(item)) {
                events.set(item.page.fileSlug, item);
            }
        }
        return events
    });


    eleventyConfig.addCollection('eventClips', function (collectionApi) {
        const events = []
        for(const item of collectionApi.getAll()) {
            if (_isProgramItem(item)) {
                events.push({
                    key: item.page.fileSlug
                  , permalink: `${rootPath}/clips/${item.page.fileSlug}`
                  , data: item.data
                });
            }
        }
        return events
    });

    eleventyConfig.addCollection('allLabels', function (collectionApi) {
        const labels = new Map()
        for(const item of collectionApi.getAll()) {
            if (item.data.labels) {
                for(const rawLabel of item.data.labels) {
                    const label = eleventyConfig.getFilter('slugify')(rawLabel);//rawLabel.toLowerCase();
                    if(!labels.has(label))
                        // for name it is first come first serve
                        // but all pages with the same label slug will
                        // be under the same label.
                        labels.set(label, {name: rawLabel, pages: []});
                    labels.get(label).pages.push(item);
                }
            }
        }
        for(const events of labels.values()) {
            // sort in place
            events.pages.sort(_sortEventsByDate);
        }
        return Array.from(labels.keys()).map((label)=>{
            const data = labels.get(label)
              , pages = data.pages.map(page=>page.fileSlug)
              ;
            return {name: data.name, slug: label, pages};
        });
    });

    return {
        dir
      , markdownTemplateEngine: 'njk'
    }
};
