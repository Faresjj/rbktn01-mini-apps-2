import { Range, Map, Record, Repeat } from 'immutable'
import { COLS, GAME_STATUS, MINE, MINE_COUNT, MODES, ROWS } from './constants'
import {
  CHANGE_MODE,
  GAME_ON,
  GAME_OVER_LOSE,
  GAME_OVER_WIN,
  RESET_TIMER,
  RESTART,
  REVEAL,
  SET_INDICATORS,
  TICK,
} from './actions'
import { defaultMines } from './common'

export const GameRecord = Record({
  status: GAME_STATUS.IDLE,

  
  mines: defaultMines(ROWS * COLS, MINE_COUNT),

  modes: Repeat(MODES.COVERED, ROWS * COLS).toList(),

  
  timer: 0,

  
  indicators: Map(),
})

export default function reducer(state, action) {
  if (action.type === GAME_ON) {
    return state.set('status', GAME_STATUS.ON).set('mines', action.mines)
  } else if (action.type === REVEAL) {
    return state.update('modes', modes =>
      modes.map((mode, point) => (action.pointSet.has(point) ? MODES.REVEALED : mode)),
    )
  } else if (action.type === CHANGE_MODE) {
    return state.setIn(['modes', action.point], action.mode)
  } else if (action.type === GAME_OVER_WIN) {
    
    const minePointSet = Range(0, ROWS * COLS)
      .filter(point => state.mines.get(point) === MINE)
      .toSet()
    const nextModes = state.modes.map((mode, point) =>
      minePointSet.has(point) ? MODES.FLAG : mode,
    )
    return state.merge({ status: GAME_STATUS.WIN, modes: nextModes })
  } else if (action.type === RESTART) {
    return state
      .set('status', GAME_STATUS.IDLE)
      .set('mines', defaultMines(ROWS * COLS, MINE_COUNT))
      .set('modes', Repeat(MODES.COVERED, ROWS * COLS).toList())
      .set('indicators', Map())
  } else if (action.type === GAME_OVER_LOSE) {
    
    const { modes, mines } = state.toObject()
    const nextModes = modes.map((mode, point) => {
      if (action.failedPoints.has(point)) {
        return MODES.EXPLODED
      } else if (mode === MODES.FLAG && mines.get(point) !== MINE) {
        return MODES.CROSS
      } else if (mines.get(point) === MINE && modes.get(point) === MODES.COVERED) {
        return MODES.REVEALED
      }
      return mode
    })
    return state.merge({ status: GAME_STATUS.LOSE, modes: nextModes })
  } else if (action.type === TICK) {
    return state.update('timer', timer => (timer === 999 ? timer : timer + 1))
  } else if (action.type === RESET_TIMER) {
    return state.set('timer', 0)
  } else if (action.type === SET_INDICATORS) {
    return state.mergeIn(['indicators'], action.colorMap)
  } else {
    return state
  }
}