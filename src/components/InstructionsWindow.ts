const WINDOW_FEATURES = "popup,width=680,height=820"

const PAGE_STYLE = `
html, body { width: auto; height: auto; overflow: auto; background: #fff; }
main { max-width: 43rem; margin: 0 auto; padding: 1.5rem; }
main > h1 { font-size: 1.5rem; font-weight: 700; line-height: 1.3; padding-bottom: 1rem; }
`

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;")

const pageStyles = () =>
  Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return Array.from(sheet.cssRules, (rule) => rule.cssText).join("\n")
      } catch {
        return ""
      }
    })
    .join("\n")

const instructionsHtml = (source: HTMLElement) => {
  const copy = source.cloneNode(true) as HTMLElement
  copy.querySelectorAll("a[href]").forEach((link) => {
    if (link.getAttribute("href")?.startsWith("#")) {
      link.removeAttribute("href")
    } else {
      link.setAttribute("target", "_blank")
      link.setAttribute("rel", "noopener noreferrer")
    }
  })
  return copy.innerHTML
}

let lastUrl: string | null = null

export const openInstructionsWindow = (
  source: HTMLElement,
  title: string,
  name: string,
) => {
  const root = document.documentElement
  const page = `<!doctype html>
<html lang="${escapeHtml(root.lang)}" data-theme="${escapeHtml(root.dataset.theme ?? "light")}">
<head>
<meta charset="utf-8">
<base href="${escapeHtml(window.location.origin)}/">
<title>${escapeHtml(title)}</title>
<style>${pageStyles()}${PAGE_STYLE}</style>
</head>
<body class="${escapeHtml(document.body.className)}">
<main><h1>${escapeHtml(title)}</h1>${instructionsHtml(source)}</main>
</body>
</html>`
  const url = URL.createObjectURL(new Blob([page], { type: "text/html" }))
  const opened = window.open(url, name, WINDOW_FEATURES)
  if (lastUrl) URL.revokeObjectURL(lastUrl)
  lastUrl = opened ? url : null
  if (!opened) {
    URL.revokeObjectURL(url)
    return false
  }
  opened.focus()
  return true
}
