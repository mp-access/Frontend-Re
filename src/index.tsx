import { ChakraProvider, ColorModeScript, useToast } from '@chakra-ui/react'
import '@fontsource/courier-prime/700.css'
import '@fontsource/courier-prime/400.css'
import '@fontsource/manrope/600.css'
import '@fontsource/manrope/400.css'
import '@fontsource/dm-sans/700.css'
import '@fontsource/dm-sans/500.css'
import '@fontsource/dm-sans/400.css'
import { ReactKeycloakProvider } from '@react-keycloak/web'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'
import Keycloak from 'keycloak-js'
import { compact, flattenDeep, join } from 'lodash'
import React from 'react'
import 'react-day-picker/dist/style.css'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Assignment from './pages/Assignment'
import Assignments from './pages/Assignments'
import Course from './pages/Course'
import Courses from './pages/Courses'
import Error from './pages/Error'
import { Landing } from './pages/Landing'
import Students from './pages/Students'
import Task from './pages/Task'
import theme from './Theme'
import Layout from './pages/Layout'
import Planner from './pages/Planner'
import {
  AssignmentCreator, AssignmentEditor, CourseCreator, CourseEditor, TaskCreator, TaskEditor
} from './pages/Creator'
import Files from './pages/Files'
import Contact from './pages/Contact'

const authClient = new Keycloak({
  url: process.env.REACT_APP_AUTH_SERVER_URL || window.location.origin + ':8443',
  realm: 'access',
  clientId: 'access-client'
})

axios.defaults.baseURL = '/api/'
axios.interceptors.response.use(response => response.data)
const setAuthToken = (token?: string) => axios.defaults.headers.common = { 'Authorization': token && `Bearer ${token}` }

function App() {
  const toast = useToast()
  const onError = (error: any) => toast({ title: error?.response?.data?.message || 'Error', status: 'error' })
  const toURL = (...path: any[]) => join(compact(flattenDeep(path)), '/')
  const client = new QueryClient()
  client.setDefaultOptions({
    queries: { refetchOnWindowFocus: false, queryFn: context => axios.get(toURL(context.queryKey)) },
    mutations: { mutationFn: (data: any) => axios.post(toURL(data[0]), data[1]), onError }
  })

  const router = createBrowserRouter([{
    path: '/', errorElement: <Error />, children: [
      { index: true, element: <Landing /> },
      { path: 'contact', element: <Contact /> },
      {
        path: 'courses', element: <Layout />, children: [
          { index: true, element: <Courses /> },
          { path: 'create', element: <CourseCreator /> },
          {
            path: ':courseURL', children: [
              { index: true, element: <Course />, handle: 'Dashboard' },
              {
                path: 'assignments', children: [
                  { index: true, element: <Assignments />, handle: 'Assignments' },
                  {
                    path: ':assignmentURL', handle: 'Assignment', children: [
                      { index: true, element: <Assignment /> },
                      { path: 'tasks/:taskURL', handle: 'Task', element: <Task /> }
                    ]
                  }
                ]
              },
              {
                path: 'supervisor', handle: 'Supervisor Zone', children: [
                  { index: true, element: <Planner />, handle: 'Course Planner' },
                  { path: 'edit', element: <CourseEditor />, handle: 'Course Editor' },
                  { path: 'files', element: <Files />, handle: 'File Manager' },
                  { path: 'students', element: <Students />, handle: 'Students' },
                  {
                    path: 'assignments', children: [
                      { index: true, element: <AssignmentCreator />, handle: 'Create Assignment' },
                      {
                        path: ':assignmentURL', handle: 'Assignment', children: [
                          { index: true, element: <AssignmentEditor />, handle: 'Assignment Editor' },
                          {
                            path: 'tasks', children: [
                              { index: true, element: <TaskCreator />, handle: 'Create Task' },
                              { path: ':taskURL', element: <TaskEditor />, handle: 'Task' }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }]
  }])

  return (
      <QueryClientProvider client={client}>
        <RouterProvider router={router} />
      </QueryClientProvider>
  )
}

createRoot(document.getElementById('root')!).render(
    <ReactKeycloakProvider authClient={authClient} onTokens={({ token }) => setAuthToken(token)}>
      <ChakraProvider theme={theme}>
        <ColorModeScript />
        <React.StrictMode>
          <App />
        </React.StrictMode>
      </ChakraProvider>
    </ReactKeycloakProvider>)