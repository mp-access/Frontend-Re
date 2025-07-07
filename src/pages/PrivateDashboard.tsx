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
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
} from "@chakra-ui/react"
import { Markdown, Placeholder } from "../components/Panels"
import { BsFillCircleFill } from "react-icons/bs"
import {
  useExample,
  useExtendExample,
  useGeneralExampleInformation,
  usePublish,
  useTerminate,
  useTimeframeFromSSE,
} from "../components/Hooks"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { t } from "i18next"
import {
  ListIcon,
  RotateFromRightIcon,
  UprightFromSquareIcon,
} from "../components/CustomIcons"
import { useTranslation } from "react-i18next"
import { useOutletContext } from "react-router-dom"
import { formatSeconds } from "../components/Util"
import { CountdownTimer } from "../components/CountdownTimer"

const CIRCLE_BUTTON_DIAMETER = 12

type ExampleState = "unpublished" | "publishing" | "ongoing" | "finished"

const TerminationDialog: React.FC<{ handleTermination: () => void }> = ({
  handleTermination,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = useRef<HTMLButtonElement>(null)
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
  const cancelRef = useRef<HTMLButtonElement>(null)
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

const TaskDescription: React.FC<{
  instructionContent: string
  title: string
}> = ({ instructionContent, title }) => {
  return (
    <Flex layerStyle={"card"} direction={"column"} grow={1} p={3}>
      <Heading fontSize="xl">{title}</Heading>
      <Divider />
      <Markdown children={instructionContent}></Markdown>
    </Flex>
  )
}

const GenearlInformation: React.FC<{
  exampleState: ExampleState
  generalInformation: ExampleInformation
}> = ({ exampleState, generalInformation }) => {
  const {
    participantsOnline,
    totalParticipants,
    numberOfStudentsWhoSubmitted,
    passRatePerTestCase,
  } = generalInformation

  const avgTestPassRate = useMemo(() => {
    const passRates = Object.values(passRatePerTestCase)

    return (
      (passRates.reduce((sum, rate) => sum + rate, 0) / passRates.length) * 100
    )
  }, [passRatePerTestCase])

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
                value={
                  (numberOfStudentsWhoSubmitted / participantsOnline) * 100
                }
                flex={1}
              ></Progress>
              <Text
                w={70}
                color={"gray.500"}
                display={"flex"}
                justifyContent={"end"}
              >
                {numberOfStudentsWhoSubmitted}/{participantsOnline}
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
                {avgTestPassRate.toFixed()}%
              </Text>
            </>
          ) : (
            <Text color={"gray.500"}> - </Text>
          )}
        </HStack>
        <Flex grow={1} justify={"space-around"} align={"center"}>
          <Tag colorScheme="purple">
            <TagLabel>
              Grading Tests {Object.keys(passRatePerTestCase).length}
            </TagLabel>
          </Tag>
          <Tag color="green.600" bg="green.50">
            <TagLeftIcon as={BsFillCircleFill} boxSize={2} />
            <TagLabel>
              Online {participantsOnline}/{totalParticipants}
            </TagLabel>
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
  setDurationInSeconds: React.Dispatch<React.SetStateAction<number>>
  startTime: number | null
  endTime: number | null
}> = ({
  handleTimeAdjustment,
  durationAsString,
  exampleState,
  handleStart,
  handleTermination,
  setDurationInSeconds,
  startTime,
  endTime,
}) => {
  const { extendExampleDuration } = useExtendExample()

  const handleExtendTime = useCallback(
    async (duration: number) => {
      try {
        // TODO: make sure new time feteched properly once clock is implemented
        await extendExampleDuration(duration)
        setDurationInSeconds((oldVal) => oldVal + duration)
      } catch (e) {
        console.log("Error extending example duration: ", e)
      }
    },
    [extendExampleDuration, setDurationInSeconds],
  )

  if (exampleState === "unpublished" || exampleState === "publishing") {
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
          isLoading={exampleState === "publishing"}
        >
          Start
        </Button>
      </Flex>
    )
  }

  if (exampleState === "ongoing" && startTime !== null && endTime !== null) {
    return (
      <Flex layerStyle={"card"} direction={"column"} p={2}>
        <Heading fontSize="xl">{t("Remaining Time")}</Heading>
        <Divider />
        <Flex flex={1} justify="space-around" align={"center"} gap={2} p={2}>
          <CountdownTimer
            startTime={startTime}
            endTime={endTime}
            size={"medium"}
          ></CountdownTimer>
          <Flex direction={"column"} justify={"center"} h={"100%"} gap={1}>
            <Button variant={"outline"} onClick={() => handleExtendTime(30)}>
              +30
            </Button>
            <Button variant={"outline"} onClick={() => handleExtendTime(60)}>
              +60
            </Button>
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
          <ResetDialog handleReset={handleTermination}></ResetDialog>
        </Flex>
      </Flex>
    </Flex>
  )
}

export function PrivateDashboard() {
  // replace with non-hardcoded values once object available
  const { publish } = usePublish()
  const { terminate } = useTerminate()
  const [durationInSeconds, setDurationInSeconds] = useState<number>(150)
  const [exampleState, setExampleState] = useState<ExampleState | null>(null)
  const { i18n } = useTranslation()
  const currentLanguage = i18n.language
  const { user } = useOutletContext<UserContext>()
  const { data: example } = useExample(user.email)
  const { data: generalInformation } = useGeneralExampleInformation()

  console.log(generalInformation)
  const { timeFrameFromEvent } = useTimeframeFromSSE()

  const durationAsString = useMemo(() => {
    return formatSeconds(durationInSeconds || 0)
  }, [durationInSeconds])

  const handleTimeAdjustment = useCallback(
    (value: number) => {
      setDurationInSeconds((oldVal) => Math.max(0, oldVal + value))
    },
    [setDurationInSeconds],
  )

  const handleStart = useCallback(async () => {
    try {
      await publish(durationInSeconds)
    } catch (e) {
      console.log("Error publishing example: ", e)
    }
  }, [publish, durationInSeconds])

  const handleTermination = useCallback(async () => {
    try {
      await terminate()
      setExampleState("finished")
    } catch (e) {
      console.log("Error terminating example: ", e)
    }
  }, [terminate])

  const [derivedStartDate, derivedEndDate] = useMemo(() => {
    if (!example) {
      return [null, null]
    }

    if (timeFrameFromEvent) {
      return timeFrameFromEvent
    }

    if (!example.start || !example.end) {
      return [null, null]
    }

    return [Date.parse(example.start), Date.parse(example.end)]
  }, [example, timeFrameFromEvent])

  useEffect(() => {
    if (!derivedEndDate || !derivedEndDate) {
      setExampleState("unpublished")
      return
    }

    const now = Date.now()

    if (derivedStartDate < now && derivedEndDate > now) {
      setExampleState("ongoing")
    } else if (derivedEndDate < now) {
      setExampleState("finished")
    }
  }, [derivedEndDate, derivedStartDate, example])

  if (!example || !exampleState || !generalInformation) {
    return <Placeholder />
  }

  const instructionFile =
    example?.information[currentLanguage]?.instructionsFile ||
    example?.information["en"].instructionsFile
  const instructionsContent = example?.files.filter(
    (file) => file.path === `/${instructionFile}`,
  )[0]?.template
  const title =
    example?.information[currentLanguage]?.title ||
    example?.information["en"]?.title

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
        <Flex direction={"column"} h={"full"}>
          {exampleState === "unpublished" || exampleState == "publishing" ? (
            <TaskDescription
              instructionContent={instructionsContent}
              title={title}
            />
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
        <GenearlInformation
          exampleState={exampleState}
          generalInformation={generalInformation}
        ></GenearlInformation>

        <ExampleTimeControler
          handleTimeAdjustment={handleTimeAdjustment}
          durationAsString={durationAsString} // will be some derived state once implemented properly
          exampleState={exampleState}
          handleStart={handleStart}
          handleTermination={handleTermination}
          setDurationInSeconds={setDurationInSeconds}
          startTime={derivedStartDate}
          endTime={derivedEndDate}
        ></ExampleTimeControler>
      </GridItem>
    </Grid>
  )
}
