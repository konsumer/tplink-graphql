import TPLSmartDevice from 'tplink-lightbulb'
import Chromath from 'chromath'

export const devices = {}

const setPower = async (light, state, transitionTime, options) => {
  const out = await light.power(state, transitionTime, options)
  if (out.err_msg) {
    throw new Error(out.err_msg)
  }
  return out
}

const computeColor = color => {
  const [ hue, saturation, brightness ] = (new Chromath(color)).hsb()
  return {
    color_temp: 0,
    hue,
    saturation: saturation * 100,
    brightness: brightness * 100
  }
}

// wrapper around power call to get info
const power = async (id, state, transitionTime, options) => {
  const { system: { set_relay_state: { err_code } } } = await setPower(devices[id], state, transitionTime, options)
  if (err_code) {
    throw new Error(`Error #${err_code}`)
  }
  return devices[id].info()
}

// get initial list of devices
TPLSmartDevice
  .scan()
  .on('light', light => {
    if (!devices[light.deviceId]) {
      devices[light.deviceId] = light
      console.log('found', light.deviceId)
    }
  })

export default {
  Mutation: {
    power: (_, { id, state, transitionTime }) => power(id, state, transitionTime),

    temp: (_, { id, transitionTime, temp }) => power(id, true, transitionTime, { color_temp: temp }),

    brightness: (_, { id, transitionTime, brightness }) => power(id, true, transitionTime, { brightness }),

    color: (_, { id, transitionTime, color }) => power(id, true, transitionTime, computeColor(color))
  },
  Query: {
    getAllLights: () => Object.values(devices).map(d => devices[d.deviceId].info()),

    getLight: (_, { id }) => devices[id].info()
  },

  Light: {
    longitude: ({ longitude_i }) => longitude_i,
    latitude: ({ latitude_i }) => latitude_i,
    id: ({ deviceId }) => deviceId
  }
}
