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


import Ajv from 'ajv';
const ajv = new Ajv({ strict: false, allErrors: true, verbose: true }); // options can be passed, e.g. {allErrors: true}
import addFormats from 'ajv-formats';
addFormats(ajv);

import { prettify } from 'awesome-ajv-errors';

ajv.addFormat("color", {
  type: "string",
  validate: (x) => true,
});


import draft6MetaSchema from 'ajv/dist/refs/json-schema-draft-06.json' with {type: 'json'};
const scheduleSchemaURI = 'https://c3voc.de/schedule/schema.json';

//import { request } from 'https';
async function _fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok)
        throw new Error('Loading error: ' + res.status);
    return await res.json();
}

const scheduleSchema = await _fetchJSON(scheduleSchemaURI);

console.log('scheduleSchema:', scheduleSchema);

ajv.addMetaSchema(draft6MetaSchema);
ajv.addSchema(scheduleSchema, 'schedule');

function renderJSON(...args) {
    const data = {hello: 'this is a test', b: null, c: Date.now()};
    const validate = ajv.getSchema('schedule');
    const valid = validate(data);
    if (!valid){
        console.log(prettify( validate, { data } ) );
        throw new Error('Data does not validate.');
    }


    /*
    schedule = self.schedule
    {
        "url": self.metadata["url"],
        "version": schedule.version,
        "base_url": self.metadata["base_url"],
        "conference": {
            "acronym": self.event.slug,
            "title": str(self.event.name),
            "start": self.event.date_from.strftime("%Y-%m-%d"),
            "end": self.event.date_to.strftime("%Y-%m-%d"),
            "daysCount": self.event.duration,
            "timeslot_duration": "00:05",
            "time_zone_name": self.event.timezone,
            "colors": {"primary": self.event.primary_color or "#3aa57c"},
            "rooms": [
                {
                    "name": str(room.name),
                    "slug": room.slug,
                    # TODO room url
                    "guid": room.uuid,
                    "description": str(room.description) or None,
                    "capacity": room.capacity,
                }
                for room in self.event.rooms.all()
            ],
            "tracks": [
                {
                    "name": str(track.name),
                    "slug": track.slug,
                    "color": track.color,
                }
                for track in self.event.tracks.all()
            ],
            "days": [
                {
                    "index": day["index"],
                    "date": day["start"].strftime("%Y-%m-%d"),
                    "day_start": day["start"].astimezone(self.event.tz).isoformat(),
                    "day_end": day["end"].astimezone(self.event.tz).isoformat(),
                    "rooms": {
                        str(room["name"]): [
                            {
                                "guid": talk.uuid,
                                "code": talk.submission.code,
                                "id": talk.submission.id,
                                "logo": (
                                    talk.submission.urls.image.full()
                                    if talk.submission.image
                                    else None
                                ),
                                "date": talk.local_start.isoformat(),
                                "start": talk.local_start.strftime("%H:%M"),
                                "duration": talk.export_duration,
                                "room": str(room["name"]),
                                "slug": talk.frab_slug,
                                "url": talk.submission.urls.public.full(),
                                "title": talk.submission.title,
                                "subtitle": "",
                                "track": (
                                    str(talk.submission.track.name)
                                    if talk.submission.track
                                    else None
                                ),
                                "type": str(talk.submission.submission_type.name),
                                "language": talk.submission.content_locale,
                                "abstract": talk.submission.abstract,
                                "description": talk.submission.description,
                                "recording_license": "",
                                "do_not_record": talk.submission.do_not_record,
                                "persons": [
                                    {
                                        "code": person.code,
                                        "name": person.get_display_name(),
                                        "avatar": person.get_avatar_url(self.event)
                                        or None,
                                        "biography": person.event_profile(
                                            self.event
                                        ).biography,
                                        "public_name": person.get_display_name(),  # deprecated
                                        "guid": person.guid,
                                        "url": person.event_profile(
                                            self.event
                                        ).urls.public.full(),
                                    }
                                    for person in talk.submission.speakers.all()
                                ],
                                "links": [
                                    {
                                        "title": resource.description,
                                        "url": resource.link,
                                        "type": "related",
                                    }
                                    for resource in talk.submission.resources.all()
                                    if resource.link
                                ],
                                "feedback_url": talk.submission.urls.feedback.full(),
                                "origin_url": talk.submission.urls.public.full(),
                                "attachments": [
                                    {
                                        "title": resource.description,
                                        "url": resource.resource.url,
                                        "type": "related",
                                    }
                                    for resource in talk.submission.resources.all()
                                    if not resource.link
                                ],
                            }
                            for talk in room["talks"]
                        ]
                        for room in day["rooms"]
                    },
                }
                for day in self.data
            ],
        },
    }
    */
    return JSON.stringify(data, null, 2);
}

export const shortcodes = [
    ['schedule', renderHTML]
  , ['scheduleJSON', renderJSON]
];

export default {createDailySchedules, shortcodes};
