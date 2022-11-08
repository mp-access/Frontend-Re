import '@fontsource/courier-prime/400.css'
import '@fontsource/dm-sans/400.css'
import '@fontsource/dm-sans/500.css'
import '@fontsource/dm-sans/700.css'
import '@fontsource/source-code-pro'
import React from 'react'
import axios from 'axios'
import Keycloak from 'keycloak-js'
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js'
import { Center, ChakraProvider, ColorModeScript, Spinner } from '@chakra-ui/react'
import { ReactKeycloakProvider, useKeycloak } from '@react-keycloak/web'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { compact, flattenDeep, join } from 'lodash'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, LoaderFunctionArgs, Params, RouterProvider } from 'react-router-dom'
import Layout from './components/Layout'
import Assignment from './pages/Assignment'
import Course from './pages/Course'
import CourseCreator from './pages/CourseCreator'
import Courses from './pages/Courses'
import Error from './pages/Error'
import Students from './pages/Students'
import Task from './pages/Task'
import theme from './Theme'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)
ChartJS.defaults.plugins.legend.display = false
ChartJS.defaults.maintainAspectRatio = false
ChartJS.defaults.elements.bar.borderSkipped = false
ChartJS.defaults.elements.bar.borderRadius = 10
ChartJS.defaults.scale.display = false
ChartJS.defaults.scale.grid.display = false
ChartJS.defaults.scale.grid.drawBorder = false
ChartJS.defaults.datasets.bar.minBarLength = 5

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
  const queryClient = new QueryClient()

  const fetchURL = (...path: any[]) => join(compact(flattenDeep(path)), '/')
  const fetchCourse = (params: Params) => ['courses', params.courseURL]
  const setQuery = (key: string, path: any[]) => queryClient.setQueryDefaults(
      [key], { queryFn: context => axios.get(fetchURL(path, context.queryKey)) })
  const setMutation = (key: string, path: any[]) =>
      queryClient.setMutationDefaults([key], {
        mutationFn: (data) => axios.post(fetchURL(path, key), data),
        onSettled: async () => queryClient.invalidateQueries([path ? 'tasks' : key])
      })

  const loadCourses = () => setQuery('courses', [])
  const loadCreator = () => setMutation('courses', [])
  const loadCourse = ({ params }: LoaderFunctionArgs) => {
    const coursePath = fetchCourse(params)
    setQuery('assignments', coursePath)
    setQuery('students', coursePath)
    setQuery('pull', coursePath)
    setMutation('students', coursePath)
    setMutation('submit', coursePath)
  }
  const loadTasks = ({ params }: LoaderFunctionArgs) =>
      setQuery('tasks', [...fetchCourse(params), 'assignments', params.assignmentURL])

  const loadContext = ({ params }: LoaderFunctionArgs) => ({
    user: keycloak.idTokenParsed,
    isCreator: keycloak.hasRealmRole('supervisor'),
    isSupervisor: !!params.courseURL && keycloak.hasRealmRole(params.courseURL + '-supervisor'),
    isAssistant: !!params.courseURL && keycloak.hasRealmRole(params.courseURL + '-assistant')
  })

  const router = createBrowserRouter([{
    id: 'user', loader: loadContext, children: [{
      path: '/', element: <Layout />, loader: loadCourses, errorElement: <Error />, children: [
        { index: true, element: <Courses /> },
        { path: 'create', loader: loadCreator, element: <CourseCreator /> },
        {
          path: 'courses/:courseURL', loader: loadCourse, children: [{ index: true, element: <Course /> },
            { path: 'students', id: 'students', element: <Students /> },
            {
              path: 'assignments/:assignmentURL', loader: loadTasks, children: [
                { index: true, element: <Assignment /> },
                { path: 'tasks/:taskURL', element: <Task /> }
              ]
            }
          ]
        }
      ]
    }]
  }])

  return (
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
  )
}

createRoot(document.getElementById('root')!).render(
    <ChakraProvider theme={theme}>
      <ColorModeScript />
      <ReactKeycloakProvider authClient={authClient} initOptions={{ onLoad: 'login-required' }}
                             onTokens={({ token }) => setAuthToken(token)}
                             LoadingComponent={<Center h='full'><Spinner size='xl' /></Center>}>
        <React.StrictMode>
          <App />
        </React.StrictMode>
      </ReactKeycloakProvider>
    </ChakraProvider>)