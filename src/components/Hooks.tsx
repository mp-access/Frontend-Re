import { useMonaco } from "@monaco-editor/react"
import { useMutation, useQuery, UseQueryOptions } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { useMotionValue } from "framer-motion"
import { compact, concat, flatten } from "lodash"
import * as monaco from "monaco-editor"
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"
import { useParams } from "react-router-dom"
import { useEventSource } from "../context/EventSourceContext"

interface UseCodeEditorOptions {
  disablePasting?: boolean
}

export const useCodeEditor = (options: UseCodeEditorOptions) => {
  const monacoInstance = useMonaco()

  const getContent = useCallback(
    (path: string) =>
      monacoInstance?.editor.getModel(monaco.Uri.file(path))?.getValue(),
    [monacoInstance],
  )
  const resetModel = useCallback(
    (path: string) => {
      if (!monacoInstance) return
      const model = monacoInstance.editor.getModel(monaco.Uri.file(path))
      if (model) model.dispose()
    },
    [monacoInstance],
  )

  const handleEditorMount = useCallback(
    (editorInstance: monaco.editor.IStandaloneCodeEditor) => {
      if (options.disablePasting) {
        editorInstance.onDidPaste(() => {
          editorInstance.trigger("keyboard", "undo", null)
        })
      }
    },
    [options.disablePasting],
  )

  return { getContent, resetModel, handleEditorMount }
}

const usePath = (prefix: string): string[] => {
  const { courseSlug, assignmentSlug, taskSlug } = useParams()
  return compact(
    flatten(
      concat(
        "courses",
        courseSlug,
        prefix !== "courses" && [
          "assignments",
          assignmentSlug,
          prefix !== "assignments" && ["tasks", taskSlug],
        ],
      ),
    ),
  )
}

export const useCreate = (slug: string) => {
  const target = slug === "" ? "/create" : "/edit"
  const { mutate, isLoading } = useMutation<string, AxiosError, object>(
    (repository) => axios.post(target, repository),
    { onSuccess: () => window.location.reload() },
  )
  return { mutate, isLoading }
}

export const usePull = () => {
  const path = usePath("")
  const { mutate, isLoading } = useMutation(
    () => axios.post("/courses" + `/${path[1]}/pull`, {}),
    { onSuccess: () => window.location.reload() },
  )
  return { mutate, isLoading }
}

export const useCourse = (options: UseQueryOptions<CourseProps> = {}) => {
  const { courseSlug } = useParams()
  return useQuery<CourseProps>(["courses", courseSlug], {
    enabled: !!courseSlug,
    ...options,
  })
}

export const usePublish = () => {
  const { courseSlug, exampleSlug } = useParams()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { mutateAsync } = useMutation<ExamplePublicationDTO, AxiosError, any[]>(
    {},
  )

  const publish = (duration: number) =>
    mutateAsync([
      ["courses", courseSlug, "examples", exampleSlug, "publish"],
      { duration },
    ])

  return { publish }
}

export const useExtendExample = () => {
  const { courseSlug, exampleSlug } = useParams()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { mutateAsync } = useMutation<any, AxiosError, any[]>({
    mutationFn: (duration) => {
      const url = `/courses/${courseSlug}/examples/${exampleSlug}/extend`
      return axios.put<void>(url, { duration: duration[0] })
    },
  })

  const extendExampleDuration = (duration: number) => mutateAsync([duration])

  return { extendExampleDuration }
}

export const useInteractiveExample = (options: UseQueryOptions = {}) => {
  const { courseSlug } = useParams()

  return useQuery<InteractiveExampleDTO>(
    ["courses", courseSlug, "examples", "interactive"],
    {
      enabled: options.enabled,
    },
  )
}

export const useTerminate = () => {
  const { courseSlug, exampleSlug } = useParams()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { mutateAsync } = useMutation<any, AxiosError, any[]>({
    mutationFn: () => {
      const url = `/courses/${courseSlug}/examples/${exampleSlug}/terminate`
      return axios.put<void>(url)
    },
  })

  const terminate = () =>
    mutateAsync([["courses", courseSlug, "examples", exampleSlug, "terminate"]])

  return { terminate }
}

export const useResetExample = () => {
  const { courseSlug, exampleSlug } = useParams()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { mutateAsync } = useMutation<any, AxiosError, any[]>({
    mutationFn: () => {
      const url = `/courses/${courseSlug}/examples/${exampleSlug}/reset`
      return axios.delete<void>(url)
    },
  })

  const resetExample = () =>
    mutateAsync([["courses", courseSlug, "examples", exampleSlug, "reset"]])

  return { resetExample }
}

export const useCategorize = () => {
  const { courseSlug, exampleSlug } = useParams()

  const { mutateAsync: categorize, isLoading } = useMutation<
    {
      categories: Record<string, number[]>
    },
    AxiosError,
    number[]
  >({
    mutationFn: (submissionIds) => {
      const url = `/courses/${courseSlug}/examples/${exampleSlug}/categorize`
      return axios.post(url, {
        submissionIds,
      })
    },
  })

  return { categorize, isLoading }
}

export const useExamples = (
  options: UseQueryOptions<PointDistribution> = {},
) => {
  const { courseSlug } = useParams()

  return useQuery<TaskOverview[]>(["courses", courseSlug, "examples"], {
    enabled: options.enabled,
  })
}

export const usePendingSubmissions = (
  userId: string,
  options: UseQueryOptions<PointDistribution> = {},
) => {
  const { courseSlug, exampleSlug } = useParams()
  return useQuery<NewSubmissionProps[]>(
    [
      "courses",
      courseSlug,
      "examples",
      exampleSlug,
      "users",
      userId,
      "pending-submissions",
    ],
    {
      enabled: options.enabled,
      refetchOnMount: "always",
    },
  )
}

export const useGeneralExampleInformation = () => {
  const { courseSlug, exampleSlug } = useParams()
  return useQuery<ExampleInformation>([
    "courses",
    courseSlug,
    "examples",
    exampleSlug,
    "information",
  ])
}

export const useParticipants = () => {
  const { courseSlug } = useParams()
  return useQuery<ParticipantProps[]>(["courses", courseSlug, "participants"], {
    enabled: !!courseSlug,
  })
}

export const usePoints = () => {
  const { courseSlug } = useParams()
  return useQuery<ParticipantProps[]>(["courses", courseSlug, "points"], {
    enabled: !!courseSlug,
  })
}

export const useStudentExampleSubmissions = () => {
  const { courseSlug } = useParams()
  return useQuery<ExampleSubmissionsCount>(
    ["courses", courseSlug, "examples", "submissions-count"],
    {
      enabled: !!courseSlug,
    },
  )
}

export const useUsers = () => {
  const { courseSlug } = useParams()
  return useQuery<ParticipantProps[]>(["courses", courseSlug, "users"], {
    enabled: !!courseSlug,
  })
}

export const useAssignment = () => {
  const { courseSlug, assignmentSlug } = useParams()
  return useQuery<AssignmentProps>(
    ["courses", courseSlug, "assignments", assignmentSlug],
    { enabled: !!assignmentSlug },
  )
}

export const useExample = (userId: string) => {
  const [timer, setTimer] = useState<number>()
  const { courseSlug, exampleSlug } = useParams()
  const query = useQuery<TaskProps>(
    ["courses", courseSlug, "examples", exampleSlug, "users", userId],
    { enabled: !timer, refetchOnMount: "always" },
  )
  // eslint-disable-next-line
  const { mutateAsync } = useMutation<any, AxiosError, any[]>(
    ["submit", courseSlug, "exampels", exampleSlug],
    {
      onMutate: () => setTimer(Date.now() + 30000),
      onSettled: () => setTimer(undefined),
    },
  )
  const submit = (data: NewSubmissionProps) =>
    mutateAsync([
      ["courses", courseSlug, "examples", exampleSlug, "submit"],
      data,
    ])
  return { ...query, submit, timer }
}

export const useTask = (userId: string) => {
  const [timer, setTimer] = useState<number>()
  const { courseSlug, assignmentSlug, taskSlug } = useParams()
  const query = useQuery<TaskProps>(
    [
      "courses",
      courseSlug,
      "assignments",
      assignmentSlug,
      "tasks",
      taskSlug,
      "users",
      userId,
    ],
    { enabled: !timer },
  )
  // eslint-disable-next-line
  const { mutateAsync } = useMutation<any, AxiosError, any[]>(
    ["submit", courseSlug, assignmentSlug, taskSlug],
    {
      onMutate: () => setTimer(Date.now() + 30000),
      onSettled: () => setTimer(undefined),
      onSuccess: query.refetch,
    },
  )
  const submit = (data: NewSubmissionProps) =>
    mutateAsync([
      [
        "courses",
        courseSlug,
        "assignments",
        assignmentSlug,
        "tasks",
        taskSlug,
        "submit",
      ],
      data,
    ])
  return { ...query, submit, timer }
}

export const useCountdown = (start: number | null, end: number | null) => {
  const [timeLeftInSeconds, setTimeLeftInSeconds] = useState<number | null>(
    null,
  )
  const [circleValue, setCircleValue] = useState<number | null>(null)

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cancelledRef = useRef(false)

  useEffect(() => {
    if (start === null || end === null || end <= start) {
      setTimeLeftInSeconds(null)
      setCircleValue(null)
      return
    }

    cancelledRef.current = false
    const total = end - start

    const tick = () => {
      if (cancelledRef.current) return

      const now = Date.now()
      const timeLeft = Math.max(0, end - now)

      setTimeLeftInSeconds((prev) => {
        const current = Math.floor(timeLeft / 1000)
        return prev !== current ? current : prev
      })

      const progress = Math.max(0, (timeLeft / total) * 100)
      setCircleValue(progress)

      if (timeLeft > 0) {
        timeoutRef.current = setTimeout(tick, 100)
      }
    }

    tick()

    return () => {
      cancelledRef.current = true
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [start, end])

  return { timeLeftInSeconds, circleValue }
}

export const useTimeframeFromSSE = () => {
  const [timeFrameFromEvent, setTimeFrameFromEvent] = useState<
    [number, number] | null
  >(null)

  const resetTimeFrameFromEvent = () => {
    setTimeFrameFromEvent(null)
  }

  useSSE<string>("timer-update", (data) => {
    const [startTimeString, endTimeString] = data.split("/")
    setTimeFrameFromEvent([
      Date.parse(startTimeString),
      Date.parse(endTimeString),
    ])
  })

  return { timeFrameFromEvent, resetTimeFrameFromEvent }
}

export const useSSE = <T,>(
  eventType: string,
  handler: (data: T) => void,
  disabled?: boolean,
) => {
  const { eventSource } = useEventSource()

  const handlerRef = useRef(handler)

  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    if (!eventSource || disabled) return

    const listener = (event: MessageEvent) => {
      try {
        const parsed = JSON.parse(event.data)
        handlerRef.current(parsed as T)
      } catch {
        handlerRef.current(event.data as unknown as T)
      }
    }

    eventSource.addEventListener(eventType, listener)

    return () => {
      eventSource.removeEventListener(eventType, listener)
    }
  }, [disabled, eventSource, eventType])
}

export const useInspect = () => {
  const { courseSlug, exampleSlug } = useParams()

  if (!courseSlug || !exampleSlug) {
    throw new Error(
      `Course Slug ${courseSlug} or example slug ${exampleSlug} undefined`,
    )
  }

  const { mutateAsync } = useMutation<void, AxiosError, [string[]]>({})
  const inspect = (userId: string) =>
    mutateAsync([
      [
        "courses",
        courseSlug,
        "examples",
        exampleSlug,
        "user",
        userId,
        "inspect",
      ],
    ])

  return { inspect }
}

export const useStudentSubmissions = () => {
  const { courseSlug, exampleSlug } = useParams()

  return useQuery<ExampleSubmissionsDTO>([
    "courses",
    courseSlug,
    "examples",
    exampleSlug,
    "submissions",
  ])
}

export const useExamplePointDistribution = (
  options: UseQueryOptions<PointDistribution> = {},
) => {
  const { courseSlug, exampleSlug } = useParams()
  return useQuery<PointDistribution>(
    ["courses", courseSlug, "examples", exampleSlug, "point-distribution"],
    {
      enabled: options.enabled,
      ...options,
    },
  )
}

export const useHeartbeat = () => {
  const { courseSlug } = useParams()

  const { mutateAsync } = useMutation<unknown, AxiosError, string>({
    mutationFn: (emitterId: string) => {
      if (!courseSlug) {
        return Promise.resolve()
      }
      const url = `/courses/${courseSlug}/heartbeat/${emitterId}`
      return axios.put<void>(url)
    },
  })

  const sendHeartbeat = (emitterId: string) => mutateAsync(emitterId)

  return { sendHeartbeat }
}

const getStorageValue = <T,>(key: string, defaultValue: T) => {
  const saved = localStorage.getItem(key)
  if (!saved) return defaultValue
  return JSON.parse(saved)
}

export const useLocalStorage = <T,>(
  key: string,
  defaultValue: T,
): [T, Dispatch<SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(() =>
    getStorageValue(key, defaultValue),
  )

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue]
}

export const usePersistentMotionValue = (
  key: string,
  fallback: number,
  delay = 1000,
) => {
  const value = useMotionValue(fallback)

  useEffect(() => {
    const saved = localStorage.getItem(key)
    if (saved !== null) {
      const parsed = parseFloat(saved)
      if (!isNaN(parsed)) value.set(parsed)
    }
  }, [key, value])

  useEffect(() => {
    // debounce for local storage
    let timeout: NodeJS.Timeout | null = null

    const unsubscribe = value.on("change", (latest) => {
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(() => {
        localStorage.setItem(key, String(latest))
      }, delay)
    })

    return () => {
      unsubscribe()
      if (timeout) clearTimeout(timeout)
    }
  }, [key, value, delay])

  return value
}
