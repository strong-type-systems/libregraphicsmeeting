
const schedule = require( './schedule-data.js')
const { data, FLEX } = schedule;

const TALKS = [
    "State of Processing",
    "UpStage",
    "Back To Bitmap Fonts",

    "Splines in FreeCAD",
    "Permacomputing",


    "Fontra",
    "Elephant in Room" /* can't be on wednesday */,
    "PCB Artwork",
    "Hyper 8 Video",

    "3D Interactive Internet",
    "Making Waterfalls",
    "TypeRoof",
    "Usability/UX Methods",
    "Art on Wayland",
    "Printer Dust",
    "Software Apocalypse",
    "Inkscape UI",

    "PDF Toolbox",
    "Printing Maps",
    "Open-Source Video Editing",
    "Website Design Systems",
    "film festival on Libre Graphics",
    "Ink/Stitch"
];

const SESSIONS = [
    [

        ['workshops', "Immersive Animations"],
        ['bof', 're:imagination LGM self-organization'],
        ['bof', "Splines in FreeCAD"],
        ['workshops', "UpStage"]
    ]
  , [
        ['workshops', "Brief Usability Test"],
        ['bof', "Permacomputing"],
        ['workshops', "3D Interactive Internet"],
        ['workshops', "Import to Website Part 1"],
    ]
  , [
        ['workshops', "Import to Website Part 2"],
        ['workshops', "Usability Heuristic Evaluation"],
        ['workshops', "Printer Dust till dawn"],
        ['bof', "Creative Coding on JVM"]
    ]
];


function* talksGen() {
    for(const title of TALKS)
        yield title;
    while(true)
        yield undefined;
}
function* sessionsGen() {
    for(const sessions of SESSIONS)
        yield sessions;
    while(true)
        yield [];
}


function statsAddEvent(event, ...stats){
    for(const stat of stats){
        const type = event.type || '(undefined)';
        if(stat[type] === undefined)
            stat[type] = 0
        stat[type] += 1;
    }
}

function renderStats(stats) {
    const result = ['<table>'];
    for(const [event, count] of Object.entries(stats)) {
        result.push(`<tr><th>${event}</th><td>${count}</td></tr>`);
    }
    result.push('</table>');
    return result.join('\n');
}

const MIN_TO_MS =  60 * 1000;
function renderHTML() {
    const result = []
      , {timeZone, days } = data
      , fullStats = {}
      , talksIter = talksGen()
      , sessionsIter = sessionsGen()
      ;
    for(const day of days) {
        // analyze:
        //  - figure out FLEX durations
        //  - detect time overrun
        const {events, date, startTime, endTime} = day
           , dateAndStartTime = new Date(`${date} ${startTime} ${timeZone}`)
           , dateAndEndTime = new Date(`${date} ${endTime} ${timeZone}`)
           , flexItems = new Map()
           , overflows = new Set()
           , dayStats = {}
           ;
        console.log('dateAndStartTime x', dateAndStartTime, `${date} ${startTime} ${timeZone}`);
        let currentTime = dateAndStartTime.valueOf(); // epoch in milliseconds
        for(const [i, event] of events.entries()) {
           const { duration, minDuration } = event
             , durationMinutes = duration === FLEX
                ? (minDuration ? minDuration : 0)
                : duration
              , durationMs = durationMinutes * MIN_TO_MS
              ;
            currentTime += durationMs;
            if(duration === FLEX)
                flexItems.set(i, 0);
            if(currentTime > dateAndEndTime.valueOf())
                overflows.add(i);
        }
        if(flexItems.size && !overflows.size) {
            // distribute
            const availableMS = dateAndEndTime.valueOf() - currentTime
              , availableMinutes = availableMS / MIN_TO_MS
              , rest = availableMinutes % flexItems.size
              , flexSize = (availableMinutes-rest) / flexItems.size
              ;
            console.log(
                'availableMS', availableMS, dateAndEndTime.valueOf(),  dateAndStartTime.valueOf(),
                '\navailableMinutes', availableMinutes, 'flexItems.size', flexItems.size,
                '\n rest', rest, 'flexSize', flexSize);

            let current = 0;
            for(const i of flexItems.keys()) {
                if(current + 1 === flexItems.size)
                    flexItems.set(i, flexSize + rest);
                else
                    flexItems.set(i, flexSize);
                current  += 1;
            }
        }
        console.log('dateAndStartTime y',dateAndStartTime, dateAndStartTime.toLocaleDateString('en-US', {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            }));

        result.push(`<h2>${dateAndStartTime.toLocaleDateString('en-US', {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            })
        }</h2>`);
        result.push('<table>');
        currentTime = dateAndStartTime.valueOf(); // epoch in milliseconds
        for(const [i, event] of events.entries()) {
            statsAddEvent(event, fullStats, dayStats);
            const {type, duration, minDuration} = event
              , overflow = overflows.has(i)
              , flexAddMinutes = flexItems.has(i)
                    ? flexItems.get(i)
                    : 0
             , durationMinutes = duration === FLEX
                ? (minDuration ? minDuration : 0)
                : duration
             , fullDurationMin = durationMinutes + flexAddMinutes
             , durationMs = fullDurationMin * MIN_TO_MS
             , current = new Date(currentTime)
             , time = current.toLocaleTimeString('en-US', {hour12: false})//, {timeZone: timeZone})
             , bg = {
                    talk: 'lime'
                  , workshops: 'pink'
                  , lightening: 'yellow'
                  , 'community-session': 'deeppink'
               }
             ;
            let title = event.title || '-'
            if(type === 'talk') {
                title = talksIter.next().value;
            }
            else if(type === 'workshops') {
                const sessions  = sessionsIter.next().value || []
                  , lines = ['<ul>']
                  ;
                for(const [subType, name] of sessions) {
                    lines.push(`<li style="--font-size:1"><em style="--font-size:1">${name}</em>(${subType})</li>`);
                }
                lines.push('</ul>')
                title = lines.join('\n');
            }


            result.push(`<tr><th>${time}</th><td>${overflow}</td><td>${fullDurationMin} min ( + ${flexAddMinutes} min)</td><td style="background:${bg[type] || 'none'};--text-wght:800;">${type}</td><td>${title}</td></tr>`);
            currentTime += durationMs;
        }
        result.push('</table>');
        result.push(renderStats(dayStats));
        result.push(new Date(currentTime).toLocaleString());
    }
    result.push('<hr />', renderStats(fullStats));
    return result.join('\n');
}

exports.renderHTML = renderHTML;
