const schedule = require( './schedule-data.js')
const { data, FLEX } = schedule;

const TALKS = [
    'state_of_processing',
    'upstage_presentation',
    'back_to_bitmap_fonts',
    'curious_case_of_splines_freecad',
    'permacomputing_fermenting_regenerative_aesthetics',
    'open-source_video_editing_landscape',

    'pcb_artwork_with_kicad',
    'the_pdf_toolbox',
    'hyper_8_video_system',

    're-imagining_3D_interactive_internet_presentation',
    'making_waterfalls',
    'fontra',
    'introduction_usability-ux_evaluation_methods',
    // TBA
    'from_printer_dust_till_graphics_dawn_presentation',
    'elephant_in_the_room-who_owns_the_image' /* can't be on wednesday */,
    'libre_designers_and_the_software_apocalypse',

    'inkscape_ui_vision_going_forward',
    'type-roof',
    'printing_maps_with_spot_colors',
    'building_website_design_system_with_atomic_design_principles',
    'how_to_run_a_film_festival_on_libre_graphics',
    'ink-stitch'
];

const SESSIONS = [
    [
        'open-source_immersive_animations',
        're-imagination_bof',
        'curved_geometry_freecad',
        'upstage_workshop'
    ]
  , [
        'from_import_to_website_part_1',
        'usability_conduct_heuristic_evaluation',
        'permacomputing_bof',//bof
        're-imagining_3D_interactive_internet_workshop'
    ]
  , [
        'from_import_to_website_part_2',
        'run_brief_usability_test',
        'from_printer_dust_till_graphics_dawn_workshop',
        'graphics_and_creative_coding_on_the_jvm'
    ]
];


function* talksGen() {
    for(const key of TALKS)
        yield key;
    while(true)
        yield undefined;
}
function* sessionsGen() {
    for(const sessions of SESSIONS)
        yield sessions;
    while(true)
        yield [];
}


function statsAddEvent(event, ...stats) {
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

function createDailySchedules() {
    const {timeZone, days} = data
      , [timeZoneUTCOffset] = timeZone
      , fullStats = {}
      , daysData = []
      , keyToTimes = new Map()
      , addKeyTime = (key, time)=>{
            if(!keyToTimes.has(key))
                keyToTimes.set(key, []);
            keyToTimes.get(key).push(time);
        }
      , dailySchedules = {timeZone, stats: fullStats, days:daysData, keyToTimes}
      , talksIter = talksGen()
      , sessionsIter = sessionsGen()
      ;
    for(const day of days) {
        // analyze:
        //  - figure out FLEX durations
        //  - detect time overrun
        const {events, date, startTime, endTime} = day
           , dateAndStartTime = new Date(`${date} ${startTime} ${timeZoneUTCOffset}`)
           , dateAndEndTime = new Date(`${date} ${endTime} ${timeZoneUTCOffset}`)
           , flexItems = new Map()
           , overflows = new Set()
           , dayStats = {}
           , schedule = []
           , dayData = {dateAndStartTime, dateAndEndTime, realEndTime: null,stats: dayStats, schedule}
           ;
        daysData.push(dayData);

        // console.log('dateAndStartTime x', dateAndStartTime, `${date} ${startTime} ${timeZoneUTCOffset}`);
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
            // console.log(
            //     'availableMS', availableMS, dateAndEndTime.valueOf(),  dateAndStartTime.valueOf(),
            //     '\navailableMinutes', availableMinutes, 'flexItems.size', flexItems.size,
            //     '\n rest', rest, 'flexSize', flexSize);

            let current = 0;
            for(const i of flexItems.keys()) {
                if(current + 1 === flexItems.size)
                    flexItems.set(i, flexSize + rest);
                else
                    flexItems.set(i, flexSize);
                current  += 1;
            }
        }
        // console.log('dateAndStartTime y',dateAndStartTime, dateAndStartTime.toLocaleDateString('en-US', {
        //         weekday: "long",
        //         year: "numeric",
        //         month: "long",
        //         day: "numeric",
        //     }));
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
             , scheduleItem = {type
                             , startTime: current
                             , event
                             , fullDurationMin
                             , flexAddMinutes, overflows:overflow
                             , isFlex: duration === FLEX
                             , keys: []
                };
             ;
            schedule.push(scheduleItem);
            if(type === 'talk') {
                const key = talksIter.next().value;
                scheduleItem.keys.push(key);
                addKeyTime(key, current)
            }
            else if(type === 'lightning' || type === 'community' || type === 'general' || type === 'keynote') {
                const key = event.key || event.title;
                scheduleItem.keys.push(key);
                addKeyTime(key, current);
            }
            else if(type === 'sessions') {
                const keys = sessionsIter.next().value || [];
                scheduleItem.keys.push(...keys);
                keys.forEach(key=>addKeyTime(key, current));
            }
            currentTime += durationMs;
        }
        dayData.realEndTime = new Date(currentTime)
    }
    return dailySchedules;
}
exports.createDailySchedules = createDailySchedules;

/**
 * This renders the schedule but it's use case is intended for the
 * design phase, as it contains a lot of debugging and status information.
 *
 * Usage: {% schedule dailySchedules, collections.allEvents %}
 */
function renderHTML(dailySchedules, eventsMap) {
    const {timeZone, stats, days} = dailySchedules
       , [, timeZoneName] = timeZone
       , lines = []
       ;
    for(const dayData of days) {
        const {dateAndStartTime, dateAndEndTime, realEndTime, stats, schedule} = dayData;
        lines.push(`<h2>${dateAndStartTime.toLocaleDateString('en-US', {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                timeZone: timeZoneName
            })
        } -- ${timeZone}</h2>`);
        lines.push('<table>');
        for(const scheduleItem of schedule) {
            const {
                     type, startTime, event, fullDurationMin, flexAddMinutes
                   , overflows, isFlex, keys
                } = scheduleItem
            , time = startTime.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: false, timeZone: timeZoneName})
            , bg = {
                    talk: 'lime'
                  , sessions: 'pink'
                  , lightning: 'yellow'
                  , community: 'deeppink'
               }
            ;
            let title = event.title || '-'
            if(type === 'talk' || type === 'lightning' || type === 'community'
                    ||  type === 'general' || type === 'keynote') {
                const [key] = keys;
                if(eventsMap.has(key)) {
                    const page = eventsMap.get(key);
                    title=`<a href="${page.url}">${page.data.title}</a>`;
                }
                else
                    title = `(¡NONE-${key}!)-`;
            }
            else if(type === 'sessions') {
                const lines = ['<ul>'];
                for(const key of keys) {
                    let subType = '(UKNW)'
                       , title = `(¡NONE-${key}!)-`
                       ;
                    if(eventsMap.has(key)) {
                        const page = eventsMap.get(key);
                        subType = page.data.type;
                        title=`<a href="${page.url}">${page.data.title}</a>`;
                    }
                    lines.push(`<li style="--font-size:1">${subType}—${title}</li>`);
                }
                lines.push('</ul>')
                title = lines.join('\n');
            }
            lines.push(`<tr><th>${time}</th><td>overflows:${overflows}, isFlex:${isFlex}</td><td>${fullDurationMin} min ( + ${flexAddMinutes} min)</td><td style="background:${bg[type] || 'none'};--text-wght:800;">${type}</td><td>${title}</td></tr>`);
        }
        lines.push('</table>');
        lines.push('actual end: ' + realEndTime.toLocaleString() + ' supposed end ' + dateAndEndTime.toLocaleString());
        lines.push(renderStats(stats));
    }
    lines.push('<hr />', renderStats(stats));
    return lines.join('\n');
}

exports.shortcodes = [
    ['schedule', renderHTML]
];
