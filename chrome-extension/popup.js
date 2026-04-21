const $ = (id) => document.getElementById(id)

const mainView = $('main-view')
const settingsView = $('settings-view')
const stashForm = $('stash-form')
const notConfigured = $('not-configured')
const successEl = $('success')
const errorEl = $('error-msg')

function showError(msg) {
  errorEl.textContent = msg
  errorEl.classList.remove('hidden')
}

function hideError() {
  errorEl.classList.add('hidden')
}

async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['apiUrl', 'apiToken'], resolve)
  })
}

async function saveSettings(apiUrl, apiToken) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ apiUrl, apiToken }, resolve)
  })
}

async function init() {
  const { apiUrl, apiToken } = await getSettings()

  if (!apiUrl || !apiToken) {
    notConfigured.classList.remove('hidden')
    $('go-settings-btn').addEventListener('click', openSettings)
    return
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  $('url').value = tab.url || ''

  stashForm.classList.remove('hidden')

  stashForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    hideError()

    const url = $('url').value
    const notes = $('notes').value.trim()
    const is_private = $('is-private').checked

    const submitBtn = $('submit-btn')
    submitBtn.disabled = true
    submitBtn.textContent = 'Saving…'

    try {
      const body = { url }
      if (notes) body.notes = notes
      body.is_private = is_private

      const res = await fetch(`${apiUrl.replace(/\/$/, '')}/api/links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiToken,
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Request failed (${res.status})`)
      }

      stashForm.classList.add('hidden')
      successEl.classList.remove('hidden')
    } catch (err) {
      showError(err.message || 'Something went wrong.')
      submitBtn.disabled = false
      submitBtn.textContent = 'Save to Stash'
    }
  })
}

function openSettings() {
  mainView.classList.add('hidden')
  settingsView.classList.remove('hidden')

  getSettings().then(({ apiUrl, apiToken }) => {
    if (apiUrl) $('api-url').value = apiUrl
    if (apiToken) $('api-token').value = apiToken
  })
}

function closeSettings() {
  settingsView.classList.add('hidden')
  mainView.classList.remove('hidden')
}

$('settings-btn').addEventListener('click', openSettings)
$('back-btn').addEventListener('click', closeSettings)

$('settings-form').addEventListener('submit', async (e) => {
  e.preventDefault()
  const apiUrl = $('api-url').value.trim()
  const apiToken = $('api-token').value.trim()

  if (!apiUrl || !apiToken) return

  await saveSettings(apiUrl, apiToken)

  $('settings-saved').classList.remove('hidden')
  setTimeout(() => {
    $('settings-saved').classList.add('hidden')
    closeSettings()
    location.reload()
  }, 1000)
})

init()
