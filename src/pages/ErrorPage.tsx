import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Button,
  Center,
  Heading,
  Icon,
  Text,
  VStack,
} from "@chakra-ui/react"
import React from "react"
import { GrUndo } from "react-icons/gr"
import {
  Link,
  useRouteError,
  isRouteErrorResponse,
  useNavigate,
} from "react-router-dom"
import { LogoButton } from "../components/Buttons"
import { RobotIcon } from "../components/Icons"

export default function ErrorPage() {
  const navigate = useNavigate()

  const error = useRouteError()
  let errorMessage: string
  if (isRouteErrorResponse(error)) {
    errorMessage = error.error?.message || error.statusText
  } else if (error instanceof globalThis.Error) {
    errorMessage = error.message
  } else if (typeof error === "string") {
    errorMessage = error
  } else {
    errorMessage = "Unknown error"
  }
  return (
    <Center h="full" bg="bg">
      <VStack
        p={8}
        minH="container.sm"
        justify="space-between"
        bg="base"
        rounded="3xl"
        pos="relative"
      >
        <LogoButton />
        <VStack>
          <Heading>Oh no, something went wrong...</Heading>
          <Text>{"The page you are looking for does not exist."}</Text>
        </VStack>
        <Button
          as={Link}
          onClick={() => navigate(-1)}
          variant="solid"
          size="lg"
          leftIcon={<GrUndo />}
        >
          Go Back
        </Button>
        <Icon as={RobotIcon} boxSize="2xs" />
        <Accordion
          allowToggle
          w="full"
          h={24}
          pos="absolute"
          bottom={-24}
          left={0}
        >
          <AccordionItem fontSize="xs" borderColor="transparent">
            <AccordionButton fontSize="xs" justifyContent="center">
              Technical Details
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel as={Center} p={0}>
              <Text w="md">{errorMessage}</Text>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </VStack>
    </Center>
  )
}
