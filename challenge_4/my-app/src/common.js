import Immutable, { List, Range, Repeat } from 'immutable'
import { COLS, MINE, MODES, ROWS } from './constants'

export function clamp(min, value, max) {
  return Math.min(max, Math.max(min, value))
}

function cmp(x, y) {
  return x - y
}


export function doesPlayerWin(modes, mines) {
  return mines.every((mine, point) => {
    if (mine !== MINE) {
      return modes.get(point) === MODES.REVEALED
    }
    return true
  })
}

export function getNeighborList(point) {
  const row = Math.floor(point / COLS)
  const col = point % COLS
  const array = []
  for (const deltaRow of [-1, 0, 1]) {
    for (const deltaCol of [-1, 0, 1]) {
      const row2 = row + deltaRow
      const col2 = col + deltaCol
      if (row2 >= 0 && row2 < ROWS && col2 >= 0 && col2 < COLS) {
        array.push(row2 * COLS + col2)
      }
    }
  }
  return List(array)
}


export function defaultMines(size, mineCount) {
  return Repeat(MINE, mineCount)
    .concat(Repeat(0, size - mineCount))
    .toList()
}


export function generateMines(size, count, excluded = []) {
  const sortedExcluded = Array.from(excluded).sort(cmp)
  
  const array = []
 
  for (let i = 0; i < size - sortedExcluded.length; i += 1) {
    if (i < count) {
      array.push(i)
    } else {
      const r = Math.floor(Math.random() * (i + 1)) 
      if (r < count) {
        array[r] = i
      }
    }
  }
  array.sort(cmp)
  
  let k = 0
  for (let i = 0; i < array.length; i += 1) {
    while (array[i] + k >= sortedExcluded[k]) {
      k += 1
    }
    array[i] += k
  }
  const pointSet = new Set(array)

  
  const hasMines = Range(0, size)
    .map(point => pointSet.has(point))
    .toList()

  function countNeighboringMines(point) {
    return getNeighborList(point)
      .filter(neighbor => hasMines.get(neighbor))
      .count()
  }

  return hasMines.map((has, point) => (has ? MINE : countNeighboringMines(point)))
}


export function find(modes, mines, start) {
  
  const result = new Set()
  let frontier = new Set([start])

  while (frontier.size > 0) {
    const conquer = new Set()
    for (const point of frontier) {
      result.add(point)
      if (mines.get(point) === 0) {
        for (const neighbor of getNeighborList(point)) {
          if (
            !result.has(neighbor) &&
            modes.get(neighbor) === MODES.COVERED &&
            mines.get(neighbor) !== MINE
          ) {
            conquer.add(neighbor)
          }
        }
      }
      frontier = conquer
    }
  }
  return Immutable.Set(result)
}