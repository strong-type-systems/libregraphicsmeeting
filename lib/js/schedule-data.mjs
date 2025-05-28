
/**
 * types:
 *
 * break: a break
 *
 */

export const FLEX = Symbol('FLEX')
  , TALK = {
        duration: 25
      , type: 'talk'
    }
  , SESSIONS = {
        duration: 120
      , type: 'sessions'
    }
  , TRANSITION_BREAK = {
        duration: 10
      , title: 'Transition Break'
      , type: 'break'
    }
  , LUNCHBREAK = {
        duration: 90//FLEX
      //, minDuration: 90
      , title: 'Lunch Break'
      , type: 'break'
    }
  , DINNERBREAK = {
        duration: 90
      , title: 'Dinner Break'
      , type: 'break'
    }
  , LIGHTNING_TALKS = {
        duration: 60
      , type: 'lightning'
    }
  , data = {
        timeZone: ['UTC+02:00', 'Europe/Berlin']
      , days: [
            {
                date: '2025/05/28'
              , startTime: '13:00'
              , endTime: '18:30'
              , events: [
                    {
                        duration: 45
                      , title: 'Doors Open'
                      , type: 'break'
                    }
                  , {
                        duration: 30
                      , key: 'welcome'
                      , type: 'general'
                    }
                  , {
                        duration: 25
                      , type: 'community'
                      , key: 're-imagination_primer' // (preparation)
                    }
                  , {
                        type: 'general'
                      , duration: 50
                      , key: 'state_of_libre_graphics'
                    }
                  , {
                        ...TALK
                    }
                  , {
                        ...TALK
                    }
                  , {
                        duration: FLEX
                      , title: 'Coffee Break'
                      , type: 'break'
                    }
                  , {
                       ...TALK
                    }
                  , {
                       ...TALK
                    }
                  , {
                        ...TALK
                    }
                  , {
                        ...TALK
                    }
                //  , {
                //        ...DINNERBREAK
                //    }
                //  , {
                //        type: 'keynote'
                //      , duration: 150
                //      , key: 'free-libre-software-and-freedom-in-the-digital-society'
                //    }
                ]
            }
          , {
                date: '2025/05/29'
              , startTime: '10:00'
              , endTime: '18:30'
              , events: [
                    {
                        duration: 10
                      , title: 'Doors Open'
                      , type: 'break'
                    }
                  , {
                        duration: 120
                      , type: 'community'
                      , key: 're-imagination_workshop'
                    }
                  , {
                      ... LUNCHBREAK
                    }
                  , {
                        ...SESSIONS
                    }
                  , TRANSITION_BREAK
                  , {
                        ...LIGHTNING_TALKS
                      , key: 'lightning_talks_thursday'
                    }
                  , {
                        duration: FLEX
                      , title: 'Coffee Break'
                      , type: 'break'
                    }
                  , {
                        ...TALK
                    }
                  , {
                        ...TALK
                    }
                  , {
                        ...TALK
                    }
                ]
            }
          , {
                date: '2025/05/30'
              , startTime: '10:00'
              , endTime: '18:30'
              , events: [
                    {
                        duration: 10
                      , title: 'Doors Open'
                      , type: 'break'
                    }
                  , {
                        ...TALK
                    }
                  , {
                        ...TALK
                    }
                  , {
                        ...TALK
                    }
                  , {
                        ...TALK
                    }
                  , {
                        ...LUNCHBREAK
                    }
                  , {
                        ...SESSIONS
                    }
                  , TRANSITION_BREAK
                  , {
                        ...LIGHTNING_TALKS
                      , key: 'lightning_talks_friday'
                    }
                  , {
                        duration: FLEX
                      , title: 'Coffee Break'
                      , type: 'break'
                    }
                  , {
                        ...TALK
                    }
                  , {
                        ...TALK
                    }
                  , {
                        ...TALK
                    }
                  , {
                      ...TALK
                  }
                ]

            }
          , {
                date: '2025/05/31'
              , startTime: '10:00'
              , endTime: '18:00'
              , events: [
                    {
                        duration: 10
                      , title: 'Doors Open'
                      , type: 'break'
                    }
                  , {
                        ...TALK
                    }
                  , {
                        ...TALK
                    }
                  , {
                        ...TALK
                    }
                  // caution, if using this slot remove the duration
                  // in the lunch break below.
                  //, {
                  //      ...TALK
                  //  }
                  , {
                        ...LUNCHBREAK
                      , duration: 120 // remove if talk above is filled again
                    }
                  , {
                        ...SESSIONS
                    }
                  , TRANSITION_BREAK
                  , {
                        ...TALK
                    }
                  , {
                        ...TALK
                    }
                  , {
                        duration: FLEX
                      , title: 'Coffee Break'
                      , type: 'break'
                    }
                  , {
                        duration: 50
                      , key: 'next_LGM'
                      , type: 'community'
                    }
                  , {
                        duration: 20
                      , key: 'goodbye'
                      , type: 'general'
                    }
                ]
            }
        ]
    };
