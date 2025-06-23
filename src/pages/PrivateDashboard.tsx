import {
  Flex,
  Heading,
  HStack,
  Grid,
  GridItem,
  Divider,
  Progress,
  Text,
  TagLabel,
  Tag,
  TagLeftIcon,
  Button,
  CircularProgress,
  CircularProgressLabel,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
} from "@chakra-ui/react"
import { Markdown } from "../components/Panels"
import { BsFillCircleFill } from "react-icons/bs"
import { usePublish } from "../components/Hooks"
import { useCallback, useMemo, useRef, useState } from "react"
import { t } from "i18next"
import {
  ListIcon,
  RotateFromRightIcon,
  UprightFromSquareIcon,
} from "../components/CustomIcons"
import { set } from "lodash"

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

type ExampleState = "unpublished" | "ongoing" | "finished"

const formatSeconds = (totalSeconds: number) => {
  const seconds = Math.floor(totalSeconds % 60)
  const minutes = Math.floor((totalSeconds / 60) % 60)

  const padded = (num: number) => String(num).padStart(2, "0")

  return `${padded(minutes)}:${padded(seconds)}`
}

const TerminationDialog: React.FC<{ handleTermination: () => void }> = ({
  handleTermination,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = useRef()
  return (
    <>
      <Button
        onClick={onOpen}
        colorScheme="red"
        backgroundColor={"red.600"}
        borderRadius={"lg"}
      >
        Terminate
      </Button>
      <AlertDialog
        motionPreset="slideInBottom"
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isOpen={isOpen}
        isCentered
      >
        <AlertDialogOverlay />

        <AlertDialogContent>
          <AlertDialogHeader>Terminate Example?</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            Are you sure you already want to Terminate this example?
          </AlertDialogBody>
          <AlertDialogFooter gap={2}>
            <Button variant={"outline"} ref={cancelRef} onClick={onClose}>
              No
            </Button>
            <Button
              onClick={handleTermination}
              colorScheme="red"
              backgroundColor={"red.600"}
            >
              Terminate
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

const ResetDialog: React.FC<{ handleReset: () => void }> = ({
  handleReset,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = useRef()
  return (
    <>
      <Button
        onClick={onOpen}
        colorScheme="red"
        backgroundColor={"red.600"}
        borderRadius={"lg"}
        leftIcon={<RotateFromRightIcon color="white" size={4} />}
      >
        Reset Example
      </Button>
      <AlertDialog
        motionPreset="slideInBottom"
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isOpen={isOpen}
        isCentered
      >
        <AlertDialogOverlay />

        <AlertDialogContent>
          <AlertDialogHeader>Terminate Example?</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            Are you sure you want to reset this example?
          </AlertDialogBody>
          <AlertDialogFooter gap={2}>
            <Button variant={"outline"} ref={cancelRef} onClick={onClose}>
              No
            </Button>
            <Button
              onClick={handleReset}
              colorScheme="red"
              backgroundColor={"red.600"}
            >
              Reset
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

const SubmissionInspector: React.FC = () => {
  return (
    <>
      <Flex layerStyle={"card"} direction={"column"}>
        <Heading fontSize="xl">Implementation Type #2</Heading>
        <Divider />
        <Flex justify={"space-around"} pt={2}>
          <Text display={"flex"} flexDirection={"row"} gap={2}>
            Commonality: <Text fontWeight={"bold"}>21%</Text>
          </Text>
          <Text display={"flex"} flexDirection={"row"} gap={2}>
            Number of variations: <Text fontWeight={"bold"}>115</Text>
          </Text>
          <Text display={"flex"} flexDirection={"row"} gap={2}>
            Avg. Score: <Text fontWeight={"bold"}>3.2</Text>
          </Text>
          <Text display={"flex"} flexDirection={"row"} gap={2}>
            Std. Dev.: <Text fontWeight={"bold"}>0.8</Text>
          </Text>
        </Flex>
      </Flex>
      <Flex layerStyle={"card"} direction={"column"} grow={1}>
        <Heading fontSize="lg">{"{Student Username}"}</Heading>
        <Divider />
      </Flex>
      <Flex gap={2}>
        <Button variant={"outline"} borderRadius={"lg"} flex={1}>
          Previous Type
        </Button>
        <Button borderRadius={"lg"} flex={1}>
          Open in Editor
        </Button>
        <Button variant={"outline"} borderRadius={"lg"} flex={1}>
          Next Type
        </Button>
      </Flex>
    </>
  )
}

const TaskDescription: React.FC = () => {
  return (
    <Flex layerStyle={"card"} direction={"column"} grow={1}>
      <Heading fontSize="xl">Some Title</Heading>
      <Divider />
      <Markdown children={someExampleMarkdownTaskDescription}></Markdown>
    </Flex>
  )
}

const GenearlInformation: React.FC<{ exampleState: ExampleState }> = ({
  exampleState,
}) => {
  return (
    <Flex layerStyle={"card"} direction={"column"} flex={1} p={3}>
      <Heading fontSize="xl">{t("General Information")}</Heading>
      <Divider />
      <Flex flexDirection={"column"} justify={"space-between"} flex={1}>
        <HStack w={"full"} p={2}>
          <Text color={"gray.500"} w={105}>
            {t("Submissions")}
          </Text>
          {exampleState === "ongoing" || exampleState === "finished" ? (
            <>
              <Progress
                display={"flex"}
                borderRadius={"full"}
                backgroundColor={"grey.200"}
                colorScheme="purple"
                value={55}
                flex={1}
              ></Progress>
              <Text
                w={70}
                color={"gray.500"}
                display={"flex"}
                justifyContent={"end"}
              >
                80/144
              </Text>
            </>
          ) : (
            <Text color={"gray.500"}> - </Text>
          )}
        </HStack>

        <HStack w={"full"} p={2}>
          <Text color={"gray.500"} w={105}>
            Test pass rate
          </Text>
          {exampleState === "ongoing" || exampleState === "finished" ? (
            <>
              <Progress
                display={"flex"}
                borderRadius={"full"}
                colorScheme="purple"
                value={30}
                flex={1}
              ></Progress>
              <Text
                w={70}
                color={"gray.500"}
                display={"flex"}
                justifyContent={"end"}
              >
                240/960
              </Text>
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
    </Flex>
  )
}

const ExampleTimeControler: React.FC<{
  handleTimeAdjustment: (value: number) => void
  handleStart: () => void
  handleTermination: () => void
  durationAsString: string
  exampleState: ExampleState
}> = ({
  handleTimeAdjustment,
  durationAsString,
  exampleState,
  handleStart,
  handleTermination,
}) => {
  if (exampleState === "unpublished") {
    return (
      <Flex
        direction={"column"}
        align={"space-around"}
        flex={1}
        layerStyle={"card"}
        p={3}
      >
        <Heading fontSize="xl">{t("Duration")}</Heading>
        <Divider />
        <Flex flexDirection={"column"} flex={1} justify={"center"}>
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
        <Button
          colorScheme="green"
          borderRadius={"lg"}
          onClick={() => handleStart()}
        >
          Start
        </Button>
      </Flex>
    )
  }

  if (exampleState === "ongoing") {
    return (
      <Flex layerStyle={"card"} direction={"column"} p={2}>
        <Heading fontSize="xl">{t("Remaining Time")}</Heading>
        <Divider />
        <Flex flex={1} justify="space-around" align={"center"} gap={2} p={2}>
          <CircularProgress value={100} color={"green.500"} size={120}>
            <CircularProgressLabel>{durationAsString}</CircularProgressLabel>
          </CircularProgress>
          <Flex direction={"column"} justify={"center"} h={"100%"} gap={1}>
            <Button variant={"outline"}> +30</Button>
            <Button variant={"outline"}> +60</Button>
            <TerminationDialog
              handleTermination={handleTermination}
            ></TerminationDialog>
          </Flex>
        </Flex>
      </Flex>
    )
  }

  return (
    <Flex layerStyle={"card"} direction={"column"} p={2}>
      <Heading fontSize="xl">{t("Controls")}</Heading>
      <Divider />
      <Flex flex={1} align={"center"} p={2}>
        <Flex direction={"column"} justify={"center"} h={"100%"} gap={2}>
          <Button
            variant={"outline"}
            borderRadius={"lg"}
            leftIcon={
              <UprightFromSquareIcon
                color="purple.600"
                size={4}
              ></UprightFromSquareIcon>
            }
          >
            Public Dashboard
          </Button>
          <Button
            variant={"outline"}
            borderRadius={"lg"}
            leftIcon={<ListIcon color="purple.600" size={4}></ListIcon>}
          >
            Back to List
          </Button>
          <ResetDialog handleTermination={handleTermination}></ResetDialog>
        </Flex>
      </Flex>
    </Flex>
  )
}

export function PrivateDashboard() {
  // replace with non-hardcoded values once object available
  const { publish } = usePublish()
  const [durationInSeconds, setDurationInSeconds] = useState<number>(150)
  const [exampleState, setExampleState] = useState<
    "unpublished" | "ongoing" | "finished"
  >("unpublished")

  const durationAsString = useMemo(() => {
    return formatSeconds(durationInSeconds || 0)
  }, [durationInSeconds])

  const handleTimeAdjustment = useCallback(
    (value: number) => {
      setDurationInSeconds((oldVal) => Math.max(0, oldVal + value))
      console.log("durationInSeconds", durationInSeconds)
    },
    [durationInSeconds, setDurationInSeconds],
  )

  const handleStart = useCallback(() => {
    publish(durationInSeconds)
    setExampleState("ongoing")
  }, [setExampleState, durationInSeconds])

  const handleTermination = useCallback(() => {
    setExampleState("finished")
  }, [setExampleState])

  return (
    <Grid
      layerStyle={"container"}
      templateColumns="1fr 1fr 1fr"
      templateRows={"3fr 1fr"}
      gap={2}
      height={"full"}
    >
      <GridItem
        layerStyle={"card"}
        gap={4}
        rowStart={1}
        rowEnd={-1}
        colStart={1}
        colEnd={2}
        p={3}
      >
        <Heading fontSize="xl">Testcases</Heading>
        <Divider />
        <div>...</div>
      </GridItem>
      <GridItem gap={4} colStart={2} colEnd={4}>
        <Flex direction={"column"} h={"full"} gap={2}>
          {exampleState === "unpublished" ? (
            <TaskDescription />
          ) : (
            <SubmissionInspector />
          )}
        </Flex>
      </GridItem>
      <GridItem
        rowStart={2}
        rowEnd={-1}
        colStart={2}
        colEnd={-1}
        display={"flex"}
        flexDirection={"row"}
        gap={3}
      >
        <GenearlInformation exampleState={exampleState}></GenearlInformation>

        <ExampleTimeControler
          handleTimeAdjustment={handleTimeAdjustment}
          durationAsString={durationAsString} // will be some derived state once implemented properly
          exampleState={exampleState}
          handleStart={handleStart}
          handleTermination={handleTermination}
        ></ExampleTimeControler>
      </GridItem>
    </Grid>
  )
}
