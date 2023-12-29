let timer

export function debounce(callback) {
  clearTimeout(timer)
  timer = setTimeout(() => {
    callback()
  }, 1000)
}
