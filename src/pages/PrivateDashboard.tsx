import {
  Flex,
  Heading,
  HStack,
  VStack,
  Grid,
  GridItem,
  Divider,
  Spacer,
  Progress,
  Text,
  TagLabel,
  Tag,
  TagLeftIcon,
  Button,
} from "@chakra-ui/react"
import { Markdown } from "../components/Panels"
import { BsFillCircleFill } from "react-icons/bs"
import { usePublish } from "../components/Hooks"
import { useCallback, useMemo, useState } from "react"

const CIRCLE_BUTTON_DIAMETER = 12
const someExampleMarkdownTaskDescription = `Transform the following mathematical expression into a Python program to be able to calculate the
result for arbitrary values of a, b, c, and d defined in the source code:

\`a - (b^2 / (c - d * (a + b)))\`

Implement it in a function \`calculate\` where it should be returned.

Please make sure that your solution is self-contained within the \`calculate\` function. In other words, only change the body of the function, not the code outside the function.

Transform the following mathematical expression into a Python program to be able to calculate the
result for arbitrary values of a, b, c, and d defined in the source code:

\`a - (b^2 / (c - d * (a + b)))\`

Implement it in a function \`calculate\` where it should be returned.

Please make sure that your solution is self-contained within the \`calculate\` function. In other words, only change the body of the function, not the code outside the function.`

const formatSeconds = (totalSeconds: number) => {
  const seconds = Math.floor(totalSeconds % 60)
  const minutes = Math.floor((totalSeconds / 60) % 60)
  const hours = Math.floor(totalSeconds / 3600)

  const padded = (num: number) => String(num).padStart(2, "0")

  if (hours > 0) {
    return `${padded(hours)}:${padded(minutes)}:${padded(seconds)}`
  } else {
    return `${padded(minutes)}:${padded(seconds)}`
  }
}

export function PrivateDashboard() {
  // replace with non-hardcoded values once object available
  const { publish } = usePublish()
  const [durationInSeconds, setDurationInSeconds] = useState<number>(150)

  const [isOngoing, setIsOngoing] = useState(false)

  const durationAsString = useMemo(() => {
    return formatSeconds(durationInSeconds || 0)
  }, [durationInSeconds])

  const handleTimeAdjustment = useCallback(
    (value: number) => {
      setDurationInSeconds((oldVal) => Math.max(0, oldVal + value))
    },
    [durationInSeconds],
  )

  const handleStart = useCallback(() => {
    publish()
    setIsOngoing(true)
  }, [])

  return (
    <Grid
      layerStyle={"container"}
      templateColumns="3fr 4fr 4fr"
      templateRows={"3fr 1fr"}
      gap={4}
      height={"full"}
    >
      <GridItem layerStyle={"card"} gap={4} rowStart={1} rowEnd={-1}>
        <VStack overflow={"auto"} p={2} align={"start "}>
          <Heading fontSize="xl">Testcases pass rate</Heading>
          <Divider />
          <div>...</div>
        </VStack>
      </GridItem>
      <GridItem
        layerStyle={"card"}
        gap={4}
        rowStart={1}
        rowEnd={1}
        colStart={2}
        colEnd={-1}
        p={4}
      >
        <Heading fontSize="xl">Some Title</Heading>
        <Divider />
        <Spacer height={1}></Spacer>
        <Markdown children={someExampleMarkdownTaskDescription}></Markdown>
      </GridItem>
      <GridItem
        layerStyle={"card"}
        p={2}
        rowStart={2}
        rowEnd={-1}
        display={"flex"}
        flexDirection={"column"}
        gap={1}
      >
        <Heading fontSize="xl">General Information</Heading>
        <Divider />
        <Flex flexDirection={"column"} justify={"space-between"} flex={1}>
          <HStack w={"full"} p={2}>
            <Text color={"gray.500"}>Submissions</Text>
            {isOngoing ? (
              <>
                <Progress
                  display={"flex"}
                  borderRadius={"full"}
                  backgroundColor={"grey.200"}
                  colorScheme="purple"
                  value={55}
                  flex={1}
                ></Progress>
                <Text color={"gray.500"}>80/144</Text>
              </>
            ) : (
              <Text color={"gray.500"}> - </Text>
            )}
          </HStack>

          <HStack w={"full"} p={2}>
            <Text color={"gray.500"}>Test pass rate</Text>
            {isOngoing ? (
              <>
                <Progress
                  display={"flex"}
                  borderRadius={"full"}
                  colorScheme="purple"
                  value={30}
                  flex={1}
                ></Progress>
                <Text color={"gray.500"}>240/960</Text>
              </>
            ) : (
              <Text color={"gray.500"}> - </Text>
            )}
          </HStack>
          <Flex grow={1} justify={"space-around"} align={"center"}>
            <Tag colorScheme="purple">
              <TagLabel> 12 Grading Tests</TagLabel>
            </Tag>
            <Tag color="green.600" bg="green.50">
              <TagLeftIcon as={BsFillCircleFill} boxSize={2} />
              <TagLabel> Online 144/219</TagLabel>
            </Tag>
          </Flex>
        </Flex>
      </GridItem>
      <GridItem
        layerStyle={"card"}
        p={2}
        rowStart={2}
        rowEnd={-1}
        display={"flex"}
        flexDirection={"column"}
        gap={1}
      >
        <Heading fontSize="xl">
          {isOngoing ? "Time Left" : "Submission Duration"}
        </Heading>
        <Divider />
        <Flex flexDirection={"column"} flex={1} justify="center">
          <Flex justify={"space-around"} align={"center"}>
            <Button
              w={CIRCLE_BUTTON_DIAMETER}
              h={CIRCLE_BUTTON_DIAMETER}
              variant={"outline"}
              onClick={() => handleTimeAdjustment(-30)}
            >
              -30
            </Button>
            <Button
              w={CIRCLE_BUTTON_DIAMETER}
              h={CIRCLE_BUTTON_DIAMETER}
              variant={"outline"}
              borderRadius={"full"}
              onClick={() => handleTimeAdjustment(-15)}
            >
              -15
            </Button>
            <Text width={"110px"} fontSize={"4xl"}>
              {durationAsString}
            </Text>
            <Button
              w={CIRCLE_BUTTON_DIAMETER}
              h={CIRCLE_BUTTON_DIAMETER}
              variant={"outline"}
              borderRadius={"full"}
              onClick={() => handleTimeAdjustment(15)}
            >
              +15
            </Button>
            <Button
              w={CIRCLE_BUTTON_DIAMETER}
              h={CIRCLE_BUTTON_DIAMETER}
              variant={"outline"}
              borderRadius={"full"}
              onClick={() => handleTimeAdjustment(30)}
            >
              +30
            </Button>
          </Flex>
        </Flex>
        <Button colorScheme="green" onClick={() => handleStart()}>
          Start
        </Button>
      </GridItem>
    </Grid>
  )
}
