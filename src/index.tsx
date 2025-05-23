import { ChakraProvider, ColorModeScript, useToast } from "@chakra-ui/react"
import "@fontsource/courier-prime/700.css"
import "@fontsource/courier-prime/400.css"
import "@fontsource/manrope/600.css"
import "@fontsource/manrope/400.css"
import "@fontsource/dm-sans/700.css"
import "@fontsource/dm-sans/500.css"
import "@fontsource/dm-sans/400.css"
import { ReactKeycloakProvider } from "@react-keycloak/web"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import axios from "axios"
import { AxiosError } from "axios"
import Keycloak from "keycloak-js"
import { compact, flattenDeep, join } from "lodash"
import React from "react"
import "react-day-picker/dist/style.css"
import { createRoot } from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Assignment from "./pages/Assignment"
import Course from "./pages/Course"
import CourseCreator from "./pages/CourseCreator"
import Courses from "./pages/Courses"
import ErrorPage from "./pages/ErrorPage"
import { Landing } from "./pages/Landing"
import Participants from "./pages/Participants"
import Task from "./pages/Task"
import theme from "./Theme"
import Layout from "./pages/Layout"
import i18n from "i18next"
import { useTranslation, initReactI18next } from "react-i18next"
import HttpBackend from "i18next-http-backend"

const authClient = new Keycloak({
  url: import.meta.env.VITE_AUTH_SERVER_URL || window.location.origin + ":8443",
  realm: "access",
  clientId: "access-client",
})

axios.defaults.baseURL = "/api/"
axios.interceptors.response.use((response) => response.data)
const setAuthToken = (token?: string) =>
  (axios.defaults.headers.common = {
    Authorization: token && `Bearer ${token}`,
  })

const getDefaultLanguage = () => {
  const storedLang = localStorage.getItem("language")
  return storedLang || "en"
}

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
    lng: getDefaultLanguage(),
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  })

function App() {
  const { t } = useTranslation()
  const toast = useToast()
  const onError = (error: AxiosError | unknown) => {
    if (axios.isAxiosError(error)) {
      toast({
        title: error?.response?.data?.message || "Error",
        status: "error",
      })
    } else {
      toast({ title: "Error", status: "error" })
    }
  }
  const toURL = (path: string[]) => join(compact(flattenDeep(path)), "/")
  const client = new QueryClient()
  client.setDefaultOptions({
    queries: {
      refetchOnWindowFocus: false,
      queryFn: (context) => axios.get(toURL(context.queryKey as string[])),
    },
    mutations: {
      // eslint-disable-next-line
      mutationFn: (data: any) => axios.post(toURL(data[0]), data[1]),
      onError,
    },
  })

  const router = createBrowserRouter([
    {
      path: "/",
      errorElement: <ErrorPage />,
      children: [
        { index: true, element: <Landing /> },
        { path: "create", element: <CourseCreator /> },
        {
          path: "courses",
          element: <Layout />,
          children: [
            { index: true, element: <Courses /> },
            {
              path: ":courseSlug",
              children: [
                { index: true, element: <Course /> },
                { path: "participants", element: <Participants /> },
                {
                  path: "assignments",
                  children: [
                    {
                      path: ":assignmentSlug",
                      handle: t("Assignment"),
                      children: [
                        { index: true, element: <Assignment /> },
                        {
                          path: "tasks/:taskSlug",
                          handle: "Task",
                          element: <Task />,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ])

  return (
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

createRoot(document.getElementById("root")!).render(
  <ReactKeycloakProvider
    authClient={authClient}
    onTokens={({ token }) => setAuthToken(token)}
  >
    <ChakraProvider theme={theme}>
      <ColorModeScript />
      {/* disabled because of https://github.com/suren-atoyan/monaco-react/issues/440
        <React.StrictMode>
          <App />
        </React.StrictMode> */}
      <App />
    </ChakraProvider>
  </ReactKeycloakProvider>
)
