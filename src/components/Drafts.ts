const PREFIX = "access-draft:"
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000
const MAX_FILE_CHARS = 200000
const WRITE_DELAY_MS = 1000

type Draft = {
  base: string
  savedAt: number
  files: Record<string, string>
}

const isDraft = (value: unknown): value is Draft => {
  const draft = value as Draft | null
  return (
    !!draft &&
    typeof draft.base === "string" &&
    typeof draft.savedAt === "number" &&
    !!draft.files &&
    typeof draft.files === "object" &&
    Object.values(draft.files).every((content) => typeof content === "string")
  )
}

const read = (key: string) => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

const write = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

const remove = (key: string) => {
  try {
    localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

const storedKeys = () => {
  try {
    return Object.keys(localStorage).filter((key) => key.startsWith(PREFIX))
  } catch {
    return []
  }
}

const parse = (raw: string): unknown => {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const tooLarge = (draft: Draft) =>
  Object.values(draft.files).some((content) => content.length > MAX_FILE_CHARS)

const load = (key: string) => {
  const raw = read(key)
  if (raw === null) return null
  const draft = parse(raw)
  if (isDraft(draft) && Date.now() - draft.savedAt < MAX_AGE_MS) return draft
  remove(key)
  return null
}

let currentKey: string | null = null
let current: Draft | null = null
let dirty = false
let timer: ReturnType<typeof setTimeout> | null = null
let reportSaveError: (() => void) | null = null

const saveFailed = () => {
  reportSaveError?.()
  reportSaveError = null
}

const forget = () => {
  if (timer) clearTimeout(timer)
  timer = null
  current = null
  dirty = false
}

const flush = () => {
  if (timer) clearTimeout(timer)
  timer = null
  if (!dirty || !currentKey || !current) return
  dirty = false
  if (tooLarge(current) || !write(currentKey, JSON.stringify(current)))
    saveFailed()
}

const open = (key: string, base: string) => {
  if (key !== currentKey) {
    flush()
    currentKey = key
    current = load(key)
  }
  if (current && current.base !== base) {
    forget()
    remove(key)
  }
  return current
}

export const draftKey = (parts: Array<string | undefined>) =>
  PREFIX +
  parts
    .filter((part) => !!part)
    .map((part) => encodeURIComponent(part ?? ""))
    .join("/")

export const drafts = {
  content: (
    key: string | null,
    base: string,
    path: string,
  ): string | undefined => (key ? open(key, base)?.files[path] : undefined),

  update: (key: string | null, base: string, path: string, content: string) => {
    if (!key) return
    current = open(key, base) ?? { base, savedAt: 0, files: {} }
    current.files[path] = content
    current.savedAt = Date.now()
    dirty = true
    timer = timer ?? setTimeout(flush, WRITE_DELAY_MS)
  },

  clear: (key: string | null) => {
    if (!key) return
    if (key === currentKey) forget()
    remove(key)
  },

  clearAll: () => {
    forget()
    storedKeys().forEach(remove)
  },

  onSaveError: (handler: () => void) => {
    reportSaveError = handler
    return () => {
      reportSaveError = null
    }
  },

  flush,
}

storedKeys().forEach(load)
window.addEventListener("pagehide", flush)
document.addEventListener("visibilitychange", flush)
