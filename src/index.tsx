import '@fontsource/courier-prime/400.css'
import '@fontsource/dm-sans/400.css'
import '@fontsource/dm-sans/500.css'
import '@fontsource/dm-sans/700.css'
import '@fontsource/source-code-pro'
import 'react-day-picker/dist/style.css'
import React from 'react'
import axios from 'axios'
import Keycloak from 'keycloak-js'
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import { ReactKeycloakProvider, useKeycloak } from '@react-keycloak/web'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { compact, flattenDeep, join, tail, takeRight } from 'lodash'
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
  url: process.env.REACT_APP_AUTH_SERVER_URL,
  realm: 'access',
  clientId: 'access-frontend'
})

axios.defaults.baseURL = '/api/'
axios.interceptors.response.use(response => response.data)
const setAuthToken = (token?: string) => axios.defaults.headers.common = { 'Authorization': `Bearer ${token}` }

function App() {
  const { keycloak } = useKeycloak()

  if (!keycloak.token)
    return <></>

  setAuthToken(keycloak.token)
  const client = new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false } } })

  const fetchURL = (...path: any[]) => join(compact(flattenDeep(path)), '/')
  const setQuery = (...path: any[]) => client.setQueryDefaults(takeRight(path),
      { queryFn: context => axios.get(fetchURL(path, tail(context.queryKey))) })
  const setMutation = (...path: any[]) => client.setMutationDefaults(takeRight(path),
      { mutationFn: (data) => axios.post(fetchURL('courses', path), data) })
  client.setDefaultOptions({ mutations: { mutationFn: (path) => axios.post(fetchURL('courses', path)) } })

  const loadCourses = () => setQuery('courses')
  const loadCreator = () => setMutation('create')
  const loadStudents = ({ params }: LoaderFunctionArgs) =>
      setQuery('courses', params.courseURL, 'students')
  const loadCourse = ({ params }: LoaderFunctionArgs) =>
      ['students', 'pull', 'submit'].forEach(key => setMutation(params.courseURL, key))
  const loadAssignments = ({ params }: LoaderFunctionArgs) =>
      ['assignments', 'students'].forEach(key => setQuery('courses', params.courseURL, key))
  const loadTasks = ({ params }: LoaderFunctionArgs) =>
      setQuery('courses', params.courseURL, 'assignments', params.assignmentURL, 'tasks')

  const router = createBrowserRouter([{
    path: '/', element: <Layout />, loader: loadCourses, errorElement: <Error />, children: [
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