
/**
 * types:
 *
 * break: a break
 *
 */

const FLEX = Symbol('FLEX')
  , TALK = {
        duration: 25
      , type: 'talk'
    }
  , WORKSHOPS = {
        duration: 120
      , type: 'workshops'
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
  , LIGHTENING_TALKS = {
        duration: 60
      , title: 'Lightening Talks'
      , type: 'lightening'
    }
  , data = {
        timeZone: 'UTC+02:00'
      , days: [
            {
                date: '2025/05/28'
              , startTime: '13:00'
              , endTime: '18:00'
              , events: [
                    {
                        duration: 45
                      , title: 'Doors Open'
                      , type: 'break'
                    }
                  , {
                        duration: 30
                      , title: 'Welcome'
                      , type: 'general'
                    }
                  , {
                        duration: 25
                      , type: 'community-session'
                      , title: 're:imagination primer' // (preparation)
                    }
                  , {
                        type: 'general'
                      , duration: 25
                      , title: 'the state of libre graphics'
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
                        duration: FLEX
                      , title: 'Coffee Break'
                      , type: 'break'
                    }
                  , {
                        ...TALK
                    }
                  , LIGHTENING_TALKS
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
                      , type: 'community-session'
                      , title: 're:imagination workshop'
                    }
                  , {
                      ... LUNCHBREAK
                    }
                  , {
                        ...WORKSHOPS
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
                        ...WORKSHOPS
                    }
                  , TRANSITION_BREAK
                  , LIGHTENING_TALKS
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
                  , {
                        ...TALK
                    }
                  , {
                        ...LUNCHBREAK
                    }
                  , {
                        ...WORKSHOPS
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
                      , title: 'Next-LGM'
                      , type: 'community-session'
                    }
                  , {
                        duration: 20
                      , title: 'Good Bye'
                      , type: 'general'
                    }
                ]
            }
        ]
    };

exports.data = data;
exports.FLEX = FLEX;
