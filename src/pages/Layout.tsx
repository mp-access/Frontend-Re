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
  useToast,
} from "@chakra-ui/react"
import { useKeycloak } from "@react-keycloak/web"
import { compact, join } from "lodash"
import { useContext, useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
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
import { useAssignment, useCourse, useSSE } from "../components/Hooks"
import { LanguageSwitcher } from "../components/LanguageSwitcher"
import { Placeholder } from "../components/Panels"
import { ExampleStatusContext } from "../context/ExampleStatusContext"

export default function Layout() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const toast = useToast()

  const { keycloak } = useKeycloak()
  const { courseSlug } = useParams()

  const { status: exampleStatusContext, setInteractive } =
    useContext(ExampleStatusContext)

  const isSupervisor =
    !!courseSlug && keycloak.hasRealmRole(courseSlug + "-supervisor")

  useEffect(() => {
    if (!isSupervisor && exampleStatusContext.hasInteractive) {
      const interactiveExamplePath = `/courses/${courseSlug}/examples/${exampleStatusContext.exampleSlug}`
      if (interactiveExamplePath !== location.pathname) {
        navigate(interactiveExamplePath)
      }
    }
  }, [courseSlug, exampleStatusContext, isSupervisor, navigate])

  useSSE<string>("redirect", (data) => {
    const arr = data.split("/")
    const index = arr.indexOf("examples")
    if (index + 1 >= arr.length) {
      throw Error("Index out of bound. There seens to be no exampleSlug")
    }

    const exampleSlug = arr[index + 1]
    setInteractive(exampleSlug)
    navigate(data)
    toast({
      title: t("redirect_toast"),
      status: "info",
    })
  })

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
          <LogoButton
            disabled={
              !context.isAssistant && exampleStatusContext.hasInteractive
            }
          />
          {courseSlug && <CourseNav isAssistant={context.isAssistant} />}
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

export const CourseNav: React.FC<{
  isAssistant: boolean
}> = ({ isAssistant }) => {
  const { i18n, t } = useTranslation()
  const currentLanguage = i18n.language
  const matches = useMatches()
  const { courseSlug, taskSlug } = useParams()
  const { data: course } = useCourse()
  const { data: assignment } = useAssignment()
  const task = assignment?.tasks.find((task) => task.slug === taskSlug)

  const { status: exampleStatusContext } = useContext(ExampleStatusContext)

  const disableNavigation = useMemo(() => {
    return exampleStatusContext.hasInteractive && !isAssistant
  }, [exampleStatusContext.hasInteractive, isAssistant])

  if (!course) return <></>

  const toNav = (h: unknown) =>
    join(compact([h, h === t("Assignment") && assignment?.ordinalNum]), " ")
  return (
    <Breadcrumb
      layerStyle="float"
      separator={<ChevronRightIcon color="gray.500" />}
      pr={3}
      pointerEvents={disableNavigation ? "none" : "auto"}
      opacity={disableNavigation ? 0.5 : 1}
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
          isDisabled={disableNavigation}
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
              isDisabled={disableNavigation}
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
                  isDisabled={disableNavigation}
                />
              ))}
          </BreadcrumbItem>
        ))}
    </Breadcrumb>
  )
}
