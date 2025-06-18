import { ChevronRightIcon } from "@chakra-ui/icons"
import {
  Avatar,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Flex,
  Grid,
  GridItem,
  HStack,
  Menu,
  MenuButton,
  MenuGroup,
  MenuItem,
  MenuList,
} from "@chakra-ui/react"
import { useKeycloak } from "@react-keycloak/web"
import React, { useEffect, useState } from "react"
import { AiOutlineLogout } from "react-icons/ai"
import {
  Link,
  Outlet,
  resolvePath,
  useMatches,
  useNavigate,
  useParams,
} from "react-router-dom"
import { LogoButton } from "../components/Buttons"
import { useAssignment, useCourse, useExamples } from "../components/Hooks"
import { compact, join } from "lodash"
import { Placeholder } from "../components/Panels"
import { LanguageSwitcher } from "../components/LanguageSwitcher"
import { useTranslation } from "react-i18next"
import { EventSource } from "extended-eventsource"

export default function Layout() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { keycloak } = useKeycloak()
  const { courseSlug } = useParams()
  const { data: examples } = useExamples()
  const [ongoingExamplePath, setOngoingExamplePath] = useState<string | null>(
    null,
  )
  const isSupervisor =
    !!courseSlug && keycloak.hasRealmRole(courseSlug + "-supervisor")

  useEffect(() => {
    if (ongoingExamplePath) {
      navigate(ongoingExamplePath)
    }
  }, [ongoingExamplePath])

  useEffect(() => {
    if (!courseSlug || !examples || isSupervisor) return

    const interactiveExample = examples.find(
      (example) => example.status === "Interactive",
    )

    if (interactiveExample) {
      const interactiveExamplePath = `/courses/${courseSlug}/examples/${interactiveExample.slug}`

      if (interactiveExamplePath !== location.pathname) {
        navigate(interactiveExamplePath)
      }
    }
  }, [examples, courseSlug, navigate, location.pathname])

  useEffect(() => {
    if (!keycloak.token || !courseSlug) return

    // course slug will only be defined once within a course route.
    if (courseSlug != undefined) {
      const eventSource = new EventSource(
        `/api/courses/${courseSlug}/subscribe`,
        {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
          },
          retry: 3000,
        },
      )
      eventSource.onopen = () => {}
      if (!isSupervisor) {
        eventSource.addEventListener("redirect", (event) => {
          console.log("redirect...")
          setOngoingExamplePath(event.data)
        })
      }

      eventSource.onerror = (error) => {
        console.error("SSE error occurred:", error)
      }
      const handleBeforeUnload = () => {
        console.log("Closing EventSource (before unload)")
        eventSource.close()
      }
      window.addEventListener("beforeunload", handleBeforeUnload)
      return () => {
        console.log("Closing EventSource (component unmount)")
        eventSource.close()
      }
    }
  }, [courseSlug, keycloak.token, isSupervisor])

  useEffect(() => {
    const timeout = setTimeout(() => !keycloak.token && navigate("/"), 2000)
    return () => clearTimeout(timeout)
  })

  if (!keycloak?.token) return <Placeholder />

  if (courseSlug && !keycloak.hasRealmRole(courseSlug))
    throw new Response("Not Found", { status: 404 })

  const context = {
    user: keycloak.idTokenParsed,
    isCreator: keycloak.hasRealmRole("supervisor"),
    isSupervisor:
      !!courseSlug && keycloak.hasRealmRole(courseSlug + "-supervisor"),
    isAssistant:
      !!courseSlug && keycloak.hasRealmRole(courseSlug + "-assistant"),
  }

  return (
    <Grid
      templateRows="auto 1fr"
      bg="bg"
      h="100vh"
      w="100vw"
      justifyItems="stretch"
      alignItems="stretch"
      justifyContent="center"
      pos="relative"
      overflow="hidden"
    >
      <GridItem
        as={Flex}
        pos="sticky"
        justify="space-between"
        px={3}
        w="full"
        h={16}
        align="center"
        zIndex={1}
      >
        <HStack p={3}>
          <LogoButton />
          {courseSlug && <CourseNav />}
        </HStack>
        <HStack>
          <LanguageSwitcher />
          <Menu>
            <MenuButton
              as={Avatar}
              bg="purple.200"
              boxSize={10}
              _hover={{ boxShadow: "lg" }}
              cursor="pointer"
              mx={2}
            />
            <MenuList minW={40}>
              <MenuGroup
                title={`${context.user?.name} (${context.user?.email})`}
              >
                <MenuItem
                  icon={<AiOutlineLogout fontSize="120%" />}
                  children={t("Logout")}
                  onClick={() =>
                    keycloak.logout({ redirectUri: window.location.origin })
                  }
                />
              </MenuGroup>
            </MenuList>
          </Menu>
        </HStack>
      </GridItem>
      <GridItem overflow="auto" w="100vw">
        <Outlet context={context} />
      </GridItem>
    </Grid>
  )
}

function CourseNav() {
  const { i18n, t } = useTranslation()
  const currentLanguage = i18n.language
  const matches = useMatches()
  const { courseSlug, taskSlug, exampleSlug } = useParams()
  const { data: course } = useCourse()
  const { data: assignment } = useAssignment()
  const task = assignment?.tasks.find((task) => task.slug === taskSlug)
  const example = course?.examples.find((e) => e.slug === exampleSlug)

  if (!course) return <></>

  const toNav = (h: unknown) =>
    join(
      compact([
        h,
        (h === t("Assignment") && assignment?.ordinalNum) ||
          (h == t("Example") && example?.ordinalNum),
      ]),
      " ",
    )
  return (
    <Breadcrumb
      layerStyle="float"
      separator={<ChevronRightIcon color="gray.500" />}
      pr={3}
    >
      <BreadcrumbItem>
        <Button
          as={Link}
          to={`/courses/${courseSlug}`}
          variant="gradient"
          children={
            course.information[currentLanguage]?.title ||
            course.information["en"].title
          }
        />
      </BreadcrumbItem>
      {matches
        .filter((match) => match.handle)
        .map((match) => (
          <BreadcrumbItem key={match.id}>
            <Button
              as={Link}
              to={match.pathname}
              variant="link"
              colorScheme="gray"
              children={toNav(match.handle)}
            />
            {match.handle === "Task" &&
              task &&
              assignment?.tasks.map((t) => (
                <Button
                  key={t.id}
                  as={Link}
                  ml={2}
                  size="sm"
                  children={t.ordinalNum}
                  variant="ghost"
                  boxSize={8}
                  isActive={t.id === task?.id}
                  to={resolvePath(`../${t.slug}`, match.pathname)}
                />
              ))}
          </BreadcrumbItem>
        ))}
    </Breadcrumb>
  )
}
