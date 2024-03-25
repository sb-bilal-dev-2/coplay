let timer

export function debounce(callback) {
  clearTimeout(timer)
  timer = setTimeout(() => {
    callback()
  }, 1000)
}

export function createDebouncedFunction(callback, ms) {
  let innerTimer

  return (...args) => {
    clearTimeout(innerTimer)
    innerTimer = setTimeout(() => {
      callback(...args)
    }, ms || 1000)
  }
}
