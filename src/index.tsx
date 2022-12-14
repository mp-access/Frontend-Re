import '@fontsource/courier-prime/400.css'
import '@fontsource/dm-sans/400.css'
import '@fontsource/dm-sans/500.css'
import '@fontsource/dm-sans/700.css'
import '@fontsource/source-code-pro'
import 'react-day-picker/dist/style.css'
import React from 'react'
import axios from 'axios'
import Keycloak from 'keycloak-js'
import { Center, ChakraProvider, ColorModeScript, Spinner } from '@chakra-ui/react'
import { ReactKeycloakProvider, useKeycloak } from '@react-keycloak/web'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { compact, flattenDeep, join } from 'lodash'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, LoaderFunctionArgs, RouterProvider } from 'react-router-dom'
import Layout from './pages/Layout'
import Assignment from './pages/Assignment'
import Course from './pages/Course'
import CourseCreator from './pages/CourseCreator'
import Courses from './pages/Courses'
import Error from './pages/Error'
import Students from './pages/Students'
import Task from './pages/Task'
import theme from './Theme'
import Assignments from './pages/Assignments'

const authClient = new Keycloak({
  url: process.env.REACT_APP_AUTH_SERVER_URL || window.location.origin + ':8443',
  realm: 'access',
  clientId: 'access-client'
})

axios.defaults.baseURL = '/api/'
axios.interceptors.response.use(response => response.data)
const setAuthToken = (token?: string) => axios.defaults.headers.common = { 'Authorization': `Bearer ${token}` }

function App() {
  const { keycloak } = useKeycloak()

  if (!keycloak.token)
    return <Center h='full'><Spinner /></Center>

  setAuthToken(keycloak.token)
  const fetchURL = (...path: any[]) => join(compact(flattenDeep(path)), '/')
  const client = new QueryClient()
  client.setDefaultOptions({
    queries: { refetchOnWindowFocus: false, queryFn: context => axios.get(fetchURL(context.queryKey)) },
    mutations: { mutationFn: (path) => axios.post(fetchURL('courses', path)) }
  })

  const setQuery = (keys: string[], ...path: any[]) => keys.map(key => client.setQueryDefaults([key],
      { queryFn: context => axios.get(fetchURL('courses', path, context.queryKey)) }))
  const setMutation = (keys: string[], ...path: any[]) => keys.map(key => client.setMutationDefaults([key],
      { mutationFn: (data) => axios.post(fetchURL('courses', path, key), data) }))

  const loadCreator = () => setMutation(['create'])
  const loadStudents = ({ params }: LoaderFunctionArgs) =>
      setQuery(['students'], params.courseURL)
  const loadCourse = ({ params }: LoaderFunctionArgs) =>
      setMutation(['students', 'pull', 'submit'], params.courseURL)
  const loadAssignments = ({ params }: LoaderFunctionArgs) =>
      setQuery(['assignments', 'students'], params.courseURL)
  const loadTasks = ({ params }: LoaderFunctionArgs) =>
      setQuery(['tasks'], params.courseURL, 'assignments', params.assignmentURL)

  const router = createBrowserRouter([{
    path: '/', element: <Layout />, errorElement: <Error />, children: [
      { index: true, element: <Courses /> },
      { path: 'create', loader: loadCreator, element: <CourseCreator /> },
      {
        path: 'courses/:courseURL', loader: loadCourse, children: [
          { index: true, element: <Course /> },
          { path: 'students', loader: loadStudents, element: <Students /> },
          { path: 'assignments', element: <Assignments /> },
          {
            path: 'assignments/:assignmentURL', loader: loadAssignments, children: [
              { index: true, element: <Assignment /> },
              { path: 'tasks/:taskURL', loader: loadTasks, element: <Task /> }
            ]
          }
        ]
      }
    ]
  }])

  return (
      <QueryClientProvider client={client}>
        <RouterProvider router={router} />
      </QueryClientProvider>
  )
}

createRoot(document.getElementById('root')!).render(
    <ReactKeycloakProvider authClient={authClient} initOptions={{ onLoad: 'login-required' }}
                           onTokens={({ token }) => setAuthToken(token)}>
      <ChakraProvider theme={theme}>
        <ColorModeScript />
        <React.StrictMode>
          <App />
        </React.StrictMode>
      </ChakraProvider>
    </ReactKeycloakProvider>)