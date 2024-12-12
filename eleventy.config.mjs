import markdownIt from "markdown-it";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import path from 'path'
import fs from 'fs';
import eleventyNavigationPlugin from "@11ty/eleventy-navigation";
import { EleventyHtmlBasePlugin } from "@11ty/eleventy";
import embedEverything from "eleventy-plugin-embed-everything";
import markdownItGitHubHeadings from "markdown-it-github-headings";

import process from 'process';
export default function (eleventyConfig) {
    // Output directory: _site

    const dir = {
            input: 'current'
          , output: 'docs'
        }
      ;

    eleventyConfig.setIncludesDirectory(`_includes`);
    eleventyConfig.addPlugin(eleventyNavigationPlugin);
    eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
    eleventyConfig.addPlugin(embedEverything);

    // use this as the default layout.
    eleventyConfig.addGlobalData("layout", "lgm25");

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
        return '/2025';
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


    return {
        dir
    }
};
