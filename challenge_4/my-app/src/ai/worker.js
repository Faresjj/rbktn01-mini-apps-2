import { MINE, SAFE, UNKNOWN } from './constants'
import State from './State'

function postMines(mines) {
  postMessage(
    JSON.stringify({
      type: 'mine',
      value: Array.from(mines),
    }),
  )
}

function postSafes(safes) {
  postMessage(
    JSON.stringify({
      type: 'safe',
      value: Array.from(safes),
    }),
  )
}

function postDangers(dangers) {
  postMessage(
    JSON.stringify({
      type: 'danger',
      value: Array.from(dangers),
    }),
  )
}

onmessage = function(event) {
  const message = JSON.parse(event.data)
  if (message.type === 'hint') {
    const state = new State(message.array, message.ROWS, message.COLS)
    const USE_AUTO = message.USE_AUTO

    
    const firstMines = state.findExplicitMines()
    state.apply(firstMines, MINE)
    postMines(firstMines)

    const firstSafes = state.findExplicitSafes()
    state.apply(firstSafes, SAFE)
    postSafes(firstSafes)

    let lastSafes = firstSafes
    let lastMines = null
    loop: while (true) {
      
      if (lastSafes) {
        const { foundMines, foundSafes } = state.explicitIterationFromSafe(lastSafes)
        postMines(foundMines)
        postSafes(foundSafes)
        lastSafes = null
      }
      if (lastMines) {
        const { foundMines, foundSafes } = state.explicitIterationFromMine(lastMines)
        postMines(foundMines)
        postSafes(foundSafes)
        lastMines = null
      }

     
      if (state.countStatus(SAFE) === 0) {
        for (const part of state.splitUnknownParts()) {
          part.sort(state.sortByNearbyNumbers.bind(state))
          for (const point of part) {
            if (!state.canBeResolve(point)) {
              break
            }
            
            postDangers([point])
            const result = state.resolve(point)
            if (result !== UNKNOWN) {
              if (result === SAFE) {
                state.apply([point], SAFE)
                postSafes([point])
                if (USE_AUTO) {
                  lastSafes = [point]
                  continue loop
                }
              } else if (result === MINE) {
                state.apply([point], MINE)
                postMines([point])
                if (USE_AUTO) {
                  lastMines = [point]
                  continue loop
                }
              }
            }
          }
        }
      }
      
      break
    }
  } else {
    throw new Error(`Invalid message type:${message.type}`)
  }
}