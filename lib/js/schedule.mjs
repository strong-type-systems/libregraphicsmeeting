import { data, FLEX } from  './schedule-data.mjs';

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

export function createDailySchedules() {
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


/**
 * Some online resources
 * https://c3voc.de/wiki/schedule
 * https://docs.pretalx.org/api/resources/talks/
 * https://github.com/pretalx/pretalx/blob/main/src/pretalx/agenda/templates/agenda/schedule.xml
 * https://c3voc.de/schedule/schema.json
 */

import { v5 as uuidv5 } from 'uuid';
const NAMESPACE = 'd942f339-d76d-4621-b861-126b6b48d530' // from https://www.uuidgenerator.net/version4
const BASE_URL = 'https://libregraphicsmeeting';
import Ajv from 'ajv';
const ajv = new Ajv({ strict: false, allErrors: true, verbose: true }); // options can be passed, e.g. {allErrors: true}
import addFormats from 'ajv-formats';
addFormats(ajv);
import { prettify } from 'awesome-ajv-errors';
ajv.addFormat("color", {
  type: "string",
  validate: () => true,
});
import draft6MetaSchema from 'ajv/dist/refs/json-schema-draft-06.json' with {type: 'json'};
const scheduleSchemaURI = 'https://c3voc.de/schedule/schema.json';

async function _fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok)
        throw new Error('Loading error: ' + res.status);
    return await res.json();
}

const scheduleSchema = await _fetchJSON(scheduleSchemaURI);
ajv.addMetaSchema(draft6MetaSchema);
ajv.addSchema(scheduleSchema, 'schedule');

// https://github.com/pretalx/pretalx/blob/main/src/pretalx/common/text/serialize.py#L7
function serializeDuration(rawMinutes) {
    const hours = Math.trunc(rawMinutes / 60)
      , minutes = ('00' + rawMinutes % 60).slice(-2)
      ;
    // no need to add days in our case
    return `${hours}:${minutes}`;
}

// called like this:
//      {% scheduleJSON dailySchedules, collections.allEvents, collections.allHosts %}
function renderJSON(dailySchedules, allEvents, allHosts) {
    const [/*tzOffset*/, tzName] = dailySchedules.timeZone // 'UTC+02:00', 'Europe/Berlin'
      , startTime = new Date(dailySchedules.days.at(0).dateAndStartTime)
      , endTime =  new Date(dailySchedules.days.at(-1).dateAndEndTime)
      , localeFormatter =  new Intl.DateTimeFormat("en-DE", {
                hour: '2-digit' // "%H:%M"
              , hour12: false
              , minute: '2-digit' // "%H:%M"
              , year: 'numeric' // "%Y-%m-%d"
              , month: '2-digit' // "%Y-%m-%d"
              , day:'2-digit' // "%Y-%m-%d"
              , timeZone: tzName
        })
      , parts2Map = parts=>new Map(parts.filter(p=>p.type!=='literal').map(p=>[p.type, p.value]))
      , dateToPartsMap = date=>parts2Map(localeFormatter.formatToParts(date))
      , getYmd = date=>{ // => "%Y-%m-%d"
            const partsDict = dateToPartsMap(date);
            return `${partsDict.get('year')}-${partsDict.get('month')}-${partsDict.get('day')}`;
        }
      , getHM = date=>{ // => "%H:%M"
            const partsDict = dateToPartsMap(date);
            return `${partsDict.get('hour')}:${partsDict.get('minute')}`;
        }
       , toCodeFormat = key=>key.toUpperCase().replaceAll(/[^A-Z0-9]/g, '') // must match^[A-Z0-9]+$
      ;
    const data = {schedule :{
        url: 'https://libregraphicsmeeting.org/2025/schedule.json',
        version: '0.0.1',
        base_url: 'https://libregraphicsmeeting.org/2025',
        conference: {
            acronym: 'lgm2025'
          , title: 'Libre Graphics Meeting 2025'
          , start: getYmd(startTime)// self.event.date_from.strftime("%Y-%m-%d"),
          , end: getYmd(endTime) // self.event.date_to.strftime("%Y-%m-%d"),
          , daysCount: dailySchedules.days.length //self.event.duration,
          , timeslot_duration: "00:05" //??? what does this do?
          , time_zone_name: tzName
          , colors: {primary: 'ff69b4'/*hotpink*/}
          , rooms: [
                {
                    name: 'main'
                  , slug: 'main'
                  , guid: uuidv5('room/main', NAMESPACE)
                  , description: null
                  , capacity: 180
                }
            ]
          , tracks: []
          , days: []
        }
    }};
    for(const [index, day] of dailySchedules.days.entries()) {
        const dayTalks = []
        const useTypes = new Set(['talk', 'community', 'general', 'lightning', 'keynote'])
        for(const [index, scheduleItem] of day.schedule.entries() ) {
            if(!useTypes.has(scheduleItem.type))
                continue;
            const key = scheduleItem.keys[0] // [ 'inkscape_ui_vision_going_forward' ]
              , guid = uuidv5(key, NAMESPACE)
              , pageData = allEvents.get(key)
                // remove front-matter, not very reliable!
              , cleanInputContent=data=> {
                    const rawInput =  data.page.rawInput
                        // because of eleventyConfig.addPreprocessor("macro-inject",
                        // we are going to remove the first line
                      , inputContent = rawInput.split('\n').slice(1).join('\n').trim()
                      ;
                    return inputContent;
                }
              , cleanedInputContent = cleanInputContent(pageData)
              , persons = []
              ;

            for(const [index, host] of pageData.data.hosts.entries()) {
                const hostPage = allHosts.get(host)
                  , cleanedInputContent = cleanInputContent(hostPage)
                  , name = hostPage && hostPage.data.fullName || host
                  , person = {
                        code: toCodeFormat(host)
                      , id: index // integer (id within this day or for the whole event? for everything?)
                      , name: name
                      , avatar: null
                      // , biography:
                      // , public_name: name // deprecated
                      , guid: uuidv5(`host/${name}`, NAMESPACE)
                      , url: encodeURI(`${BASE_URL}${hostPage.url}`)
                      , biography: cleanedInputContent
                    }
                  ;
                persons.push(person);
            }

            const talk = {
                guid: guid
              , code: toCodeFormat(key) // must match^[A-Z0-9]+$
              , id: index // integer (id within this day or for the whole event? for everything?)
              , logo: null
              , date: scheduleItem.startTime.toISOString()
              , start: getHM(scheduleItem.startTime) // talk.local_start.strftime("%H:%M"),
              , duration: serializeDuration(scheduleItem.fullDurationMin) // should be a string
              , room: 'main'
              , slug: key.toLowerCase()//??? /// ^[a-z0-9_-]+[a-z0-9]$
              , url: encodeURI(`${BASE_URL}${pageData.url}`)
              , title: pageData.data.title
              , subtitle: ''
              , track: null
              , type: pageData.data.type || 'null' // should be a string
              , language: 'en'
              , abstract: cleanedInputContent
              // , description: // we don't have anything other than `abstract`/ cleanedInputContent
              , recording_license: ''
              , do_not_record: false // TODO? Not all of these session require recording, could be in front matter
              , persons: persons
              , links: []
            };
            dayTalks.push(talk);
        }
        const dayData = {
            index: index,
            date: getYmd(day.dateAndStartTime), // day["start"].strftime("%Y-%m-%d"),
            day_start: day.dateAndStartTime.toISOString(), // day["start"].astimezone(self.event.tz).isoformat(),
            day_end: day.dateAndEndTime.toISOString(), // day["end"].astimezone(self.event.tz).isoformat(),
            rooms: {
                main: dayTalks
            }
        };
        data.schedule.conference.days.push(dayData);
    }
    const validate = ajv.getSchema('schedule');
    const valid = validate(data);
    if (!valid){
        console.log(prettify( validate, { data } ) );
        throw new Error('Data does not validate.');
    }
    return JSON.stringify(data, null, 2);
}

export const shortcodes = [
    ['schedule', renderHTML]
  , ['scheduleJSON', renderJSON]
];

export default {createDailySchedules, shortcodes};
