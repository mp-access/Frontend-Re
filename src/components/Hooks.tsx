import { useMonaco } from "@monaco-editor/react"
import { Uri } from "monaco-editor"
import { useParams } from "react-router-dom"
import { useMutation, useQuery, UseQueryOptions } from "@tanstack/react-query"
import { useState } from "react"
import axios, { AxiosError } from "axios"
import { compact, concat, flatten } from "lodash"

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

export const useExamples = () => {
  const { courseSlug } = useParams()
  return useQuery<TaskOverview[]>(["courses", courseSlug, "examples"])
}

export const useStudents = () => {
  const { courseSlug } = useParams()
  return useQuery<StudentProps[]>(["courses", courseSlug, "students"], {
    enabled: !!courseSlug,
  })
}

export const useStudentPoints = () => {
  const { courseSlug } = useParams()
  return useQuery<StudentProps[]>(["courses", courseSlug, "studentPoints"], {
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
    { enabled: !timer },
  )
  // eslint-disable-next-line
  const { mutateAsync } = useMutation<any, AxiosError, any[]>(
    ["submit", courseSlug, "exampels", exampleSlug],
    {
      onMutate: () => setTimer(Date.now() + 30000),
      onSettled: () => setTimer(undefined),
      onSuccess: query.refetch,
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
