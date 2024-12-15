

function* cycleGen(arr) {
    while(true)
        yield* arr;
}

function propertiesFromEntries(varPrefix, properties) {
    var propertiesMap = new Map();
    for(const [name, syntax] of properties) {
        const cssName = `--${varPrefix}-${name}`;
        propertiesMap.set(name, {
            name
          , syntax
          , cssName
          , cssVar: `var(${cssName})`
        });
    }
    return propertiesMap;
}

function defineRepeatingConicGradient(varPrefix, amountColors) {
    const  propertiesMap = propertiesFromEntries(varPrefix, [
            ['from', '<angle>']
          , ['position-h', '<percentage>']
          , ['position-v', '<percentage>']
        ])
      , colors = []
      ;
    for(let i=0;i<amountColors;i++) {
        const colorPropertiesMap = propertiesFromEntries(varPrefix, [
            [`color-${i}-color`, '<color>']
           , [`color-${i}-from`, '<percentage>']
           , [`color-${i}-to`, '<percentage>']
        ]);
        const color = Array.from(colorPropertiesMap.values()).map(entry=>entry.cssVar);

        //const [from, to] = [
        //  ['0%', '8.25%']
        //, ['8.25%', '16.5%']
        //, ['16.5%',  '25%']
        //][i];
        //color.push(from, to);
        colors.push(color.join(' '));
        for(const entry of colorPropertiesMap)
            propertiesMap.set(...entry)
    }

    const cssFunction = [
            ['repeating-conic-gradient( from'
                    , propertiesMap.get('from').cssVar
                    , 'at'
                    , propertiesMap.get('position-h').cssVar
                    , propertiesMap.get('position-v').cssVar
            ].join(' ')
          , ...colors
        ].join(',\n') + ')';

    return {
        cssFunction
      , propertiesMap
    }
}

function defineMultiRepeatingConicGradient(varPrefix, repetitions, amountColors) {
    const allProperties = []
      , cssFunctions = []
    for(let i=0; i<repetitions  ; i++) {
        const repetitionPrefix = `${varPrefix}-${i}`
         , {cssFunction, propertiesMap} = defineRepeatingConicGradient(repetitionPrefix, amountColors)
         ;
        cssFunctions.push(cssFunction)
        allProperties.push(...propertiesMap.values());
    }

    return {
        css: cssFunctions.join(',\n')
      , allProperties
    }
}
/**
.multi-repeating-conic {
  background: repeating-conic-gradient(
      from 0deg at 80% 50%,
      #5691f580 0% 8.25%,
      #b338ff80 8.25% 16.5%,
      #f8305880 16.5% 25%
    ),
    repeating-conic-gradient(
      from 15deg at 50% 50%,
      #e856f580 0% 8.25%,
      #ff384c80 8.25% 16.5%,
      #e7f83080 16.5% 25%
    ),
    repeating-conic-gradient(
      from 0deg at 20% 50%,
      #f58356ff 0% 8.25%,
      #caff38ff 8.25% 16.5%,
      #30f88aff 16.5% 25%
    );
}
*/

function randomBetween(min, max) {
    return  Math.random() * (max - min) + min;
}

const GREENYELLOW = 'oklch(91.3% 0.2335 130.02 / .5)'
 , HOTPINK = 'oklch(72.83% 0.19707545854163525 351.9947080594076 / .5)'
 ;
class BackgroundTransitioner {
    constructor(backgroundElement) {
        this.backgroundElement = backgroundElement;
        backgroundElement.addEventListener('transitionend', this._transitionendHandler.bind(this));

        const colors = [GREENYELLOW, HOTPINK];
        this._colorsIter = cycleGen(colors);

        const {css, allProperties} = defineMultiRepeatingConicGradient('lgm25bg', 20, 2)
          , transitions = []
          ;
        this.allProperties = new Map(allProperties.map(prop=>[prop.cssName, prop]));
        for(const property of allProperties) {
            let initialValue = this._valueForProp(property)
            const cssPropertyDefinition = {
                  name: property.cssName
                , syntax: property.syntax
                , inherits: false
                , initialValue
            }
            window.CSS.registerProperty(cssPropertyDefinition);
            transitions.push(
                // property name | duration | easing function | delay
                // transition: margin-right 4s ease-in-out 1s;
                `${property.cssName} ${randomBetween(25,90)}s ease-in-out ${randomBetween(0, 3)}s`
            )
        }
        backgroundElement.style.background = css;
        // One or more single-property transitions, separated by commas.
        backgroundElement.style.transition = transitions.join(', ');

        setTimeout(()=>{
            for(const property of allProperties) {
                backgroundElement.style.setProperty(property.cssName, this._valueForProp(property));
            }
        }, 100);
    }
    _valueForProp(property) {
        if(property.syntax === '<color>')
            return this._colorsIter.next().value;
        if (property.syntax === '<angle>')
            return `${randomBetween(10, 140)}deg`;
        if (property.syntax === '<percentage>')
            return `${randomBetween(20, 80)}%`;
        throw new Error(`Don't know how to set initial value for `
                    + `syntax ${property.syntax} for ${property.cssName}`);
    }
    _transitionendHandler(event) {
        const property = this.allProperties.get(event.propertyName);
        if(!property)
            return
        this.backgroundElement.style.setProperty(event.propertyName, this._valueForProp(property));
        // const stops = Math.round(Math.random() * 10)
        //   , colors = ['greenyellow', 'hotpink']
        //   , colorsIter  = cycleGen(colors)
        //   , gradient = []
        //   ;
        // gradient.push(colorsIter.next().value);
        // for(let i=1;i<stops;i++)
        //     gradient.push(colorsIter.next().value);
        // gradient.push(colorsIter.next().value);
        // // background-image: linear-gradient(rgba(0, 0, 255, 0.5), rgba(255, 255, 0, 0.5)),
        // const bg = `linear-gradient(${gradient.join(', ')})`;
        // backgroundElement.style.background = bg;
        // console.log(stops, 'setNewBackground', bg, 'backgroundElement', backgroundElement);
    }
}

window.CSS.registerProperty({
  name: "--my-color",
  syntax: "<color>",
  inherits: false,
  initialValue: "#c0ffee",
});

function collapsible(element, buttonSelector, isInitiallyOpen=false) {
    const baseClassName = 'ui_collapsible_mixin'
      , openClassName = `${baseClassName}-open`
      , closedClassName = `${baseClassName}-closed`
      ;
    element.classList.add(baseClassName);
    element.classList.add(isInitiallyOpen ? openClassName : closedClassName);
    element.addEventListener('click', (event)=>{
        const button = event.target.closest(buttonSelector);
        if(button === null) return;
        if(button.closest(element.tagName) !== element) return;
        event.preventDefault();
        const isOpen = element.classList.contains(openClassName);

        element.classList[isOpen ? 'remove' : 'add'](openClassName);
        element.classList[isOpen ? 'add' : 'remove'](closedClassName);
        if(!isOpen)
            element.scrollIntoView({block: 'start', inline: 'nearest', behavior: 'smooth'});
    });
}

function main() {
    for(const [selector, fn, ...args] of [
                    [':root', (...args)=>new BackgroundTransitioner(...args)]
                  , ['nav > .past_editions', collapsible, '.past_editions > span']
                ]) {
        for(const element of document.querySelectorAll(selector))
            fn(element, ...args);
    }
}

if(document.readyState === 'loading')
    window.addEventListener('DOMContentLoaded', main);
else
    main();
