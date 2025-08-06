import { useMonaco } from "@monaco-editor/react"
import { useKeycloak } from "@react-keycloak/web"
import { useMutation, useQuery, UseQueryOptions } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { EventSource } from "extended-eventsource"
import { compact, concat, flatten } from "lodash"
import { Uri } from "monaco-editor"
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { useEventSource } from "../context/EventSourceContext"

export const useCodeEditor = () => {
  const monaco = useMonaco()
  const getContent = (path: string) =>
    monaco?.editor.getModel(Uri.file(path))?.getValue()
  return { getContent }
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
        ]
      )
    )
  )
}

export const useCreate = (slug: string) => {
  const target = slug === "" ? "/create" : "/edit"
  const { mutate, isLoading } = useMutation<string, AxiosError, object>(
    (repository) => axios.post(target, repository),
    { onSuccess: () => window.location.reload() }
  )
  return { mutate, isLoading }
}

export const usePull = () => {
  const path = usePath("")
  const { mutate, isLoading } = useMutation(
    () => axios.post("/courses" + `/${path[1]}/pull`, {}),
    { onSuccess: () => window.location.reload() }
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
  const { mutateAsync } = useMutation<any, AxiosError, any[]>({
    // TODO: type this correctly once backend res is known.
    onSuccess: () => {
      // just for now
      console.log("Redirected")
    },
  })

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

export const useExamples = () => {
  const { courseSlug } = useParams()

  return useQuery<TaskOverview[]>(["courses", courseSlug, "examples"], {
    enabled: !!courseSlug,
  })
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

export const useAssignment = () => {
  const { courseSlug, assignmentSlug } = useParams()
  return useQuery<AssignmentProps>(
    ["courses", courseSlug, "assignments", assignmentSlug],
    { enabled: !!assignmentSlug }
  )
}

export const useExample = (userId: string) => {
  const [timer, setTimer] = useState<number>()
  const { courseSlug, exampleSlug } = useParams()
  const query = useQuery<TaskProps>(
    ["courses", courseSlug, "examples", exampleSlug, "users", userId],
    { enabled: !timer }
  )
  // eslint-disable-next-line
  const { mutateAsync } = useMutation<any, AxiosError, any[]>(
    ["submit", courseSlug, "exampels", exampleSlug],
    {
      onMutate: () => setTimer(Date.now() + 30000),
      onSettled: () => setTimer(undefined),
      onSuccess: query.refetch,
    }
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
    { enabled: !timer }
  )
  // eslint-disable-next-line
  const { mutateAsync } = useMutation<any, AxiosError, any[]>(
    ["submit", courseSlug, assignmentSlug, taskSlug],
    {
      onMutate: () => setTimer(Date.now() + 30000),
      onSettled: () => setTimer(undefined),
      onSuccess: query.refetch,
    }
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
    null
  )
  const [circleValue, setCircleValue] = useState<number | null>(null)
  const requestRef = useRef<number | null>(null)

  useEffect(() => {
    if (start === null || end === null) {
      return
    }

    const update = () => {
      const total = end - start
      const now = Date.now()
      const timeLeft = Math.max(0, end - now)

      setTimeLeftInSeconds(Math.floor(timeLeft / 1000))

      const progress = Math.max(0, (timeLeft / total) * 100)
      setCircleValue(progress)
      if (timeLeft > 0) {
        requestRef.current = requestAnimationFrame(update)
      } else {
        requestRef.current = null
      }
    }

    update() // only called initially or when startUnix or endUnix changes

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
        requestRef.current = null
      }
    }
  }, [start, end])

  return { timeLeftInSeconds, circleValue }
}

export const useTimeframeFromSSE = () => {
  const { keycloak } = useKeycloak()
  const { courseSlug } = useParams()
  const token = keycloak.token

  const [timeFrameFromEvent, setTimeFrameFromEvent] = useState<
    [number, number] | null
  >(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!token || !courseSlug) return
    const eventSource = new EventSource(
      `/api/courses/${courseSlug}/subscribe`,
      {
        headers: { Authorization: `Bearer ${token}` },
        retry: 3000,
      }
    )

    const onTimeEvent = (e: MessageEvent) => {
      const [startTimeString, endTimeString] = (e.data as string).split("/")
      setTimeFrameFromEvent([
        Date.parse(startTimeString),
        Date.parse(endTimeString),
      ])
    }

    eventSource.addEventListener("timer-update", onTimeEvent)
    eventSource.onerror = (error) => {
      console.error("SSE error", error)
      setError(new Error("SSE connection error"))
    }

    const cleanup = () => {
      eventSource.removeEventListener("timer-update", onTimeEvent)
      eventSource.close()
    }
    window.addEventListener("beforeunload", cleanup)
    return () => {
      window.removeEventListener("beforeunload", cleanup)
      cleanup()
    }
  }, [courseSlug, token])

  return { timeFrameFromEvent, error }
}

// properly define eventType
export const useSSE = <T,>(eventType: string, handler: (data: T) => void) => {
  const { eventSource } = useEventSource()

  useEffect(() => {
    if (!eventSource) return

    const listener = (event: MessageEvent) => {
      try {
        const parsed = JSON.parse(event.data)
        handler(parsed as T)
      } catch {
        handler(event.data as unknown as T)
      }
    }

    eventSource.addEventListener(eventType, listener)

    return () => {
      eventSource.removeEventListener(eventType, listener)
    }
  }, [eventSource, eventType, handler])
}

export const useInspect = () => {
  const { courseSlug, exampleSlug } = useParams()

  if (!courseSlug || !exampleSlug) {
    throw new Error(
      `Course Slug ${courseSlug} or example slug ${exampleSlug} undefined`
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
