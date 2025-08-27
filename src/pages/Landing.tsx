import {
  Button,
  Center,
  Highlight,
  HStack,
  Icon,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react"
import { useKeycloak } from "@react-keycloak/web"
import { Navigate } from "react-router-dom"
import Typewriter from "typewriter-effect"
import { LogoButton } from "../components/Buttons"
import { SWITCHIcon } from "../components/Icons"

export function Landing() {
  const { keycloak } = useKeycloak()

  const idpHint = "switch-edu-id"
  const redirectUri = window.location.origin + "/courses"

  if (keycloak.token) return <Navigate to="courses" />

  return (
    <Stack h="100vh" w="100vw">
      <HStack
        pos="sticky"
        w="full"
        pl={6}
        pr={3}
        h={16}
        justify="space-between"
      >
        <LogoButton />
      </HStack>
      <Center flexGrow={1}>
        <Stack w="lg">
          <Typewriter
            onInit={(writer) =>
              writer
                .typeString('Hello, <text class="purple">ACCESS</text>!')
                .start()
            }
          />
          <Text fontSize="2xl" lineHeight="tall">
            Learn & teach <b>programming</b> skills
            <Highlight
              query="supervised course"
              styles={{ px: "1", bg: "purple.75" }}
            >
              {" in a supervised course environment."}
            </Highlight>
          </Text>
        </Stack>
        <VStack layerStyle="feature" w="xs" spacing={4}>
          <VStack>
            <Text fontSize="lg">{"Looking for your courses?"}</Text>
            <Button
              size="lg"
              colorScheme="gray"
              borderWidth={2}
              flexDir="column"
              gap={3}
              fontWeight={400}
              p={4}
              w="2xs"
              h="auto"
              rounded="lg"
              onClick={() => keycloak.login({ idpHint, redirectUri })}
            >
              Login with
              <Icon as={SWITCHIcon} boxSize="auto" px={2} />
            </Button>
            <Button
              variant="ghost"
              onClick={() => keycloak.login({ redirectUri })}
            >
              Local account
            </Button>
          </VStack>
        </VStack>
      </Center>
    </Stack>
  )
}
