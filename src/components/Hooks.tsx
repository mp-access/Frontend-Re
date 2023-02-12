import { useMonaco } from '@monaco-editor/react'
import { Uri } from 'monaco-editor'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { compact, concat, flatten } from 'lodash'
import { yupResolver } from '@hookform/resolvers/yup/dist/yup'
import { schemas } from './Fields'

export const useCodeEditor = () => {
  const monaco = useMonaco()
  const getContent = (path: string) => monaco?.editor.getModel(Uri.file(path))?.getValue()
  return { getContent }
}

const usePath = (prefix: string): any[] => {
  const { courseURL, assignmentURL, taskURL } = useParams()
  return compact(flatten(concat('courses', courseURL, prefix !== 'courses' &&
      ['assignments', assignmentURL, prefix !== 'assignments' && ['tasks', taskURL]])))
}

export const useCreatorForm = (prefix: string) =>
    useForm({ mode: 'onChange', resolver: yupResolver(schemas[prefix]), defaultValues: schemas[prefix].getDefault() })

export function useCreator<TData = any>(prefix: string, enabled: boolean) {
  const form = useCreatorForm(prefix)
  const navigate = useNavigate()
  const path = usePath(prefix)
  const { mutateAsync } = useMutation<string, object, any[]>(['create', ...path])
  const { data, isSuccess } = useQuery<TData>(path, { enabled, onSuccess: form.reset })
  const create = (data: object) => mutateAsync([path, data])
      .then(() => navigate('/courses' + (path[1] ? `/${path[1]}/supervisor` : ''), { state: { refresh: !path[1] } }))
  return { form, create, data, isSuccess }
}

export const useCourse = (options: UseQueryOptions<CourseProps> = {}) => {
  const { courseURL } = useParams()
  return useQuery<CourseProps>(['courses', courseURL], { enabled: !!courseURL, ...options })
}

export const useStudents = () => {
  const { courseURL } = useParams()
  return useQuery<StudentProps[]>(['courses', courseURL, 'students'], { enabled: !!courseURL })
}

export const useTemplateFiles = (options: UseQueryOptions<TemplateFileProps[]> = {}) => {
  const { courseURL } = useParams()
  const query = useQuery<TemplateFileProps[]>(['courses', courseURL, 'files'], { enabled: !!courseURL, ...options })
  const { mutateAsync } = useMutation<string, object, any[]>(['files', courseURL], { onSuccess: () => query.refetch() })
  const submit = (data: any) => mutateAsync([['courses', courseURL, 'files'], data])
  return { ...query, submit }
}

export const useImport = () => {
  const { courseURL } = useParams()
  const { mutateAsync, isLoading } = useMutation<string, object, any[]>(['import', courseURL])
  const onImport = (data: any) => mutateAsync([['courses', courseURL, 'import'], data]).then(() => window.location.reload())
  return { onImport, isLoading }
}

export const useAssignment = () => {
  const { courseURL, assignmentURL } = useParams()
  return useQuery<AssignmentProps>(['courses', courseURL, 'assignments', assignmentURL], { enabled: !!assignmentURL })
}

export const useTask = (userId: string) => {
  const [timer, setTimer] = useState<number>()
  const { courseURL, assignmentURL, taskURL } = useParams()
  const query = useQuery<TaskProps>(['courses', courseURL, 'assignments', assignmentURL, 'tasks', taskURL, 'users', userId], { enabled: !timer })
  const { mutateAsync } = useMutation<any, any, any[]>(['submit', courseURL, assignmentURL, taskURL], {
    onMutate: () => setTimer(Date.now() + 30000),
    onSettled: () => setTimer(undefined), onSuccess: query.refetch
  })
  const submit = (data: NewSubmissionProps) =>
      mutateAsync([['courses', courseURL, 'assignments', assignmentURL, 'tasks', taskURL, 'submit'], data])
  return { ...query, submit, timer }
}