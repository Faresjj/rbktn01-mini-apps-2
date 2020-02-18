import { clamp } from './common'

const params = new URLSearchParams(document.location.search)
const rows = Number(params.get('rows'))
const cols = Number(params.get('cols'))
const mines = Number(params.get('mines'))

export const ROWS = isNaN(rows) || Number(rows) === 0 ? 16 : clamp(5, rows, 40)
export const COLS = isNaN(cols) || Number(cols) === 0 ? 30 : clamp(8, cols, 60)

export const USE_HINT = params.has('hint')
export const USE_AUTO = params.has('auto')

export const MINE_COUNT =
  isNaN(mines) || mines === 0
    ? ROWS * COLS * 0.20625
    : Math.floor(clamp(0.05, mines / (ROWS * COLS), 0.3) * ROWS * COLS)

history.replaceState(
  null,
  null,
  `?rows=${ROWS}&cols=${COLS}&mines=${MINE_COUNT}` +
    `${USE_HINT ? '&hint' : ''}${USE_AUTO ? '&auto' : ''}`,
)


export const MINE = -1


export const CELL = 16


export const BG_COLOR = '#c0c0c0'
export const BD_COLOR = '#808080'


export const MODES = {
  REVEALED: 'REVEALED', 
  COVERED: 'COVERED', 
  FLAG: 'FLAG', 
  QUESTIONED: 'QUESTIONED', 
  CROSS: 'CROSS', 
  EXPLODED: 'EXPLODED', 
}


export const GAME_STATUS = {
  IDLE: 'IDLE', 
  ON: 'ON', 
  WIN: 'WIN', 
  LOSE: 'LOSE', 
}