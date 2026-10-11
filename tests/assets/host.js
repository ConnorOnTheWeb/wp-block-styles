/*
 * Test-page host: theme toggle (System / Light / Dark).
 *
 * "System" removes data-theme so the page and the package follow the OS.
 * "Light" and "Dark" set data-theme on <html>, which host.css maps to
 * color-scheme and the package reads directly.
 *
 * The choice is remembered per browser. A ?theme=light|dark|system query
 * parameter overrides it (the automated tests use this).
 *
 * Load in <head> without defer so the theme applies before first paint.
 */
(function () {
  var KEY = 'wp-block-styles:theme'
  var MODES = ['system', 'light', 'dark']
  var root = document.documentElement

  function stored() {
    try { return localStorage.getItem(KEY) } catch (e) { return null }
  }

  function remember(mode) {
    try { localStorage.setItem(KEY, mode) } catch (e) { /* private mode, blocked storage */ }
  }

  function apply(mode) {
    if (mode === 'light' || mode === 'dark') root.setAttribute('data-theme', mode)
    else root.removeAttribute('data-theme')
    var buttons = document.querySelectorAll('.host-toggle button')
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute('aria-pressed', String(buttons[i].value === mode))
    }
  }

  var fromQuery = new URLSearchParams(location.search).get('theme')
  var initial = MODES.indexOf(fromQuery) > -1 ? fromQuery : stored()
  var mode = MODES.indexOf(initial) > -1 ? initial : 'system'
  apply(mode)

  document.addEventListener('DOMContentLoaded', function () {
    var slot = document.querySelector('.host-toggle')
    if (!slot) return
    MODES.forEach(function (m) {
      var button = document.createElement('button')
      button.type = 'button'
      button.value = m
      button.textContent = m.charAt(0).toUpperCase() + m.slice(1)
      button.addEventListener('click', function () {
        mode = m
        remember(m)
        apply(m)
      })
      slot.appendChild(button)
    })
    apply(mode)
  })
})()
