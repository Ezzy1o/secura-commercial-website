// Contact page: local-only validation for the demonstration inquiry form.
// Nothing is sent or stored.

const form = document.getElementById("inquiry-form")

if (form) {
  const status = document.getElementById("form-status")
  const fields = ["name", "email", "subject", "message"]

  const validate = (field, value) => {
    const text = value.trim()
    if (!text) return "This field is required."
    if (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return "Enter a valid email address."
    if (field === "message" && text.length < 10) return "Please provide at least 10 characters."
    return ""
  }

  const show = (field, message) => {
    const input = form.elements[field]
    const error = document.getElementById(`${field}-error`)
    input.setAttribute("aria-invalid", String(Boolean(message)))
    error.textContent = message
    error.hidden = !message
  }

  for (const field of fields) {
    const input = form.elements[field]
    input.addEventListener("blur", () => show(field, validate(field, input.value)))
    input.addEventListener("input", () => {
      status.hidden = true
      if (input.getAttribute("aria-invalid") === "true") show(field, validate(field, input.value))
    })
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault()
    let firstInvalid = null
    for (const field of fields) {
      const message = validate(field, form.elements[field].value)
      show(field, message)
      if (message && !firstInvalid) firstInvalid = form.elements[field]
    }
    if (firstInvalid) {
      status.hidden = true
      firstInvalid.focus()
      return
    }
    status.hidden = false
    status.focus()
  })
}
