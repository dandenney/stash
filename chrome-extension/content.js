;(function () {
  let btn = null

  function removeBtn() {
    if (btn) {
      btn.remove()
      btn = null
    }
  }

  function showBtn(rect, selectedText) {
    removeBtn()

    btn = document.createElement('button')
    btn.textContent = 'Save highlight'

    const top = Math.max(8, rect.top - 44)
    const left = rect.left + rect.width / 2

    Object.assign(btn.style, {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      transform: 'translateX(-50%)',
      zIndex: '2147483647',
      background: '#18181b',
      color: '#fafafa',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '6px',
      padding: '6px 14px',
      fontSize: '13px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontWeight: '500',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
      whiteSpace: 'nowrap',
      lineHeight: '1',
      transition: 'background 0.15s',
    })

    // prevent mousedown from clearing the selection
    btn.addEventListener('mousedown', (e) => e.preventDefault())

    btn.addEventListener('click', async () => {
      const { apiUrl, apiToken } = await chrome.storage.sync.get(['apiUrl', 'apiToken'])

      if (!apiUrl || !apiToken) {
        btn.textContent = 'Configure the extension first'
        setTimeout(removeBtn, 2000)
        return
      }

      btn.textContent = 'Saving…'
      btn.disabled = true

      try {
        const res = await fetch(`${apiUrl.replace(/\/$/, '')}/api/highlights`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiToken,
          },
          body: JSON.stringify({
            url: window.location.href,
            title: document.title,
            text: selectedText,
          }),
        })

        if (!res.ok) throw new Error()

        btn.textContent = 'Saved!'
        btn.style.background = '#14532d'
        btn.style.borderColor = 'rgba(255,255,255,0.1)'
        setTimeout(removeBtn, 1200)
      } catch {
        btn.textContent = 'Error — try again'
        btn.style.background = '#7f1d1d'
        btn.disabled = false
        setTimeout(removeBtn, 2000)
      }
    })

    document.body.appendChild(btn)
  }

  document.addEventListener('mouseup', (e) => {
    if (btn && btn.contains(e.target)) return

    const selection = window.getSelection()
    const text = selection?.toString().trim()

    if (!text || text.length < 5) {
      removeBtn()
      return
    }

    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    showBtn(rect, text)
  })

  document.addEventListener('mousedown', (e) => {
    if (btn && !btn.contains(e.target)) removeBtn()
  })
})()
