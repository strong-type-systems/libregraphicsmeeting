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

function newsDate(page) {
    const [y, m, d] =page.fileSlug.split('-', 3).map(i=>parseFloat(i))
      , date = new Date(y, m-1, d)
      ;
    return `<time datetime="${date.toString()}">${date.toDateString()}</time>`;
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
        <p class="lead">${post.data.lead ? post.data.lead : ''}<a href="${post.url}">(… full announcment)</a></p>
        </article></li>\n`);
    }
    result.push('</ol>');
    return result.join('');
}

export default function (eleventyConfig) {
    // Output directory: _site
    const dir = {
            input: 'current'
          , output: 'docs'
        }
      , rootDir = '2025'
      , rootPath = `/${rootDir}`
      ;


    const nunjucksEnvironment = new Nunjucks.Environment(
        new Nunjucks.FileSystemLoader(`${dir.input}/_includes`)
        );
    eleventyConfig.setLibrary('njk', nunjucksEnvironment);

    // I use this for the css and js files. Especially IPhone seems
    // to have trouble to update these when they have changed. Looks
    // like a server configuration thing, but I can't do much in that
    // regard from here. I'd prefer to remove this again at some point.
    // The Date will be different for each newly generated version.
    eleventyConfig.addGlobalData('cacheBuster', `?cacheBuster=${(new Date()).toISOString()}`);
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
    md.use(markdownItGitHubHeadings, {
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
    })
    eleventyConfig.setLibrary("md", md);

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

    return {
        dir
      , markdownTemplateEngine: 'njk'
    }
};
