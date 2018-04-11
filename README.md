# tplink-graphql

This will make a GraphQL server for controlling and looking in on all the TPLink lights on your local network.

Here is the [API docs](api.md).

## getting started

* [Download](LINK_NEEDED) this project
* `npm i`
* `npm start`
* visit your [graphql console](http://localhost:3000/playground)

## colors

I am using [Chromath](https://github.com/jfsiii/chromath) for colors, so you can use any of these strings for `color` value:

```
'#FF0000'                  // Hex (6 characters with hash)
'FF0000'                   // Hex (6 characters without hash)
'#F00'                     // Hex (3 characters with hash)
'F00'                      // Hex (3 characters without hash)
'red'                      // CSS/SVG Chromath name
'rgb(255, 0, 0)'           // RGB via CSS
'rgba(255, 0, 0, 1)'       // RGBA via CSS
'hsl(0, 100%, 50%)'        // HSL via CSS
'hsla(0, 100%, 50%, 1)'    // HSLA via CSS
'hsv(0, 100%, 100%)'       // HSV via CSS
'hsva(0, 100%, 100%, 1)'   // HSVA via CSS
'hsb(0, 100%, 100%)'       // HSB via CSS
'hsba(0, 100%, 100%, 1)'   // HSBA via CSS
```

## how I made this

I used a little script to generate some JSON about my home network:

```js
import { writeFileSync } from 'fs'
import TPLSmartDevice from 'tplink-lightbulb'

const json = {light: [], daystat: [], schedule: []}

TPLSmartDevice
  .scan()
  .on('light', async light => {
    const info = await light.info()
    const daystat = await light.daystat(2018, 1)
    const schedule = await light.schedule()
    json.light.push(info)
    json.daystat.push(daystat)
    json.schedule.push(schedule)
  })

setTimeout(() => {
  writeFileSync('mock.json', JSON.stringify(json, null, 2))
  process.exit()
}, 1000)
```

I couldn't get any of the GraphQL from JSON tools to work, and didn't want to write the types all by hand, so I created a server & got it's schema to use as a base.

* ran `json-graphql-server` to start a demo GraphQL server.
* ran `get-graphql-schema` to get the schema from the running GraphQL server.
* used some of the types it generated
* replaced all JSON types with actual types
* built out my interface in `Query` and `Mutation`