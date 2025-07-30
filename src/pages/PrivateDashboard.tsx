import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Tag,
  TagLabel,
  TagLeftIcon,
  Text,
  useDisclosure,
  useToast,
  useToken,
} from "@chakra-ui/react"
import { useTranslation } from "react-i18next"
import { BsFillCircleFill } from "react-icons/bs"
import { GoChecklist } from "react-icons/go"
import { Cell, Pie, PieChart } from "recharts"

import { t } from "i18next"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { CountdownTimer } from "../components/CountdownTimer"
import { RotateFromRightIcon } from "../components/CustomIcons"
import {
  useExample,
  useExtendExample,
  useGeneralExampleInformation,
  useInspect,
  usePublish,
  useResetExample,
  useSSE,
  useStudentSubmissions,
  useTerminate,
  useTimeframeFromSSE,
} from "../components/Hooks"

import { useOutletContext } from "react-router-dom"
import { Markdown, Placeholder } from "../components/Panels"
import { SubmissionsCarousel } from "../components/SubmissionsCarousel"
import { TestCaseBarChart } from "../components/TestCaseBarChart"

import { formatSeconds } from "../components/Util"

type ExampleState = "unpublished" | "publishing" | "ongoing" | "finished"

// const Bookmarks: React.FC = () => {
//   return <Flex>Some Bookmarks</Flex>
// }

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
      ></Button>
      <AlertDialog
        motionPreset="slideInBottom"
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isOpen={isOpen}
        isCentered
      >
        <AlertDialogOverlay />

        <AlertDialogContent>
          <AlertDialogHeader>{t("Terminate Example")}</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>{t("termination_alert")}</AlertDialogBody>
          <AlertDialogFooter gap={2}>
            <Button variant={"outline"} ref={cancelRef} onClick={onClose}>
              {t("No")}
            </Button>
            <Button
              onClick={handleTermination}
              colorScheme="red"
              backgroundColor={"red.600"}
            >
              {t("Terminate")}
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
        {t("Reset Example")}?
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
          <AlertDialogHeader>{t("Reset Example")}</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>{t("reset_alert")}</AlertDialogBody>
          <AlertDialogFooter gap={2}>
            <Button variant={"outline"} ref={cancelRef} onClick={onClose}>
              {t("No")}
            </Button>
            <Button
              onClick={handleReset}
              colorScheme="red"
              backgroundColor={"red.600"}
            >
              {t("Reset")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

const SubmissionInspector: React.FC<{
  submissions: SubmissionSsePayload[]
  selectedTests: Record<string, boolean> | null
  exactMatch: boolean
}> = ({ submissions, selectedTests, exactMatch }) => {
  const { inspect } = useInspect()
  const toast = useToast()
  const openInEditor = useCallback(
    async (studentId: string) => {
      inspect(studentId).then(() =>
        toast({
          title: "Submission opened on second device",
          duration: 3000,
        }),
      )
    },
    [inspect, toast],
  )

  return (
    <Flex direction={"column"} h={"full"} gap={2}>
      <Flex layerStyle={"segment"} direction={"column"}>
        <Heading fontSize="xl">Implementation Type #2</Heading>
        <Divider />
        <Flex justify={"space-around"} pt={2}>
          <Text display={"flex"} flexDirection={"row"} gap={2}>
            Number of implementations: <Text fontWeight={"bold"}>115</Text>
          </Text>
          <Text display={"flex"} flexDirection={"row"} gap={2}>
            Avg. Score: <Text fontWeight={"bold"}>3.2</Text>
          </Text>
          <Text display={"flex"} flexDirection={"row"} gap={2}>
            Std. Dev.: <Text fontWeight={"bold"}>0.8</Text>
          </Text>
        </Flex>
      </Flex>

      <SubmissionsCarousel
        submissions={submissions}
        openInEditor={openInEditor}
        testCaseSelection={selectedTests}
        exactMatch={exactMatch}
      />
    </Flex>
  )
}

const TaskDescription: React.FC<{
  instructionContent: string
  title: string
}> = ({ instructionContent, title }) => {
  return (
    <Flex layerStyle={"segment"} direction={"column"} grow={1} p={3}>
      <Heading fontSize="xl">{title}</Heading>
      <Divider />
      <Markdown children={instructionContent}></Markdown>
    </Flex>
  )
}
const CustomPieChart: React.FC<{ value: number }> = ({ value }) => {
  const rest = Math.max(0, 100 - value)

  const data = [
    { name: "Pass", value: value },
    { name: "Remaining", value: rest },
  ]

  const COLORS = [
    useToken("colors", "purple.600"),
    useToken("colors", "gray.300"),
  ]

  const RADIUS = 16
  return (
    <PieChart width={2 * RADIUS} height={2 * RADIUS}>
      <Pie
        data={data}
        dataKey="value"
        cx="50%"
        cy="50%"
        outerRadius={RADIUS}
        startAngle={90}
        endAngle={-450}
        stroke="none"
      >
        {data.map((_entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
    </PieChart>
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

  const submissionsProgress = useMemo(() => {
    if (participantsOnline <= 0 && numberOfStudentsWhoSubmitted <= 0) {
      return 0
    }

    if (
      (participantsOnline <= 0 && numberOfStudentsWhoSubmitted > 0) ||
      numberOfStudentsWhoSubmitted >= participantsOnline
    ) {
      return 100
    } else {
      return numberOfStudentsWhoSubmitted / participantsOnline
    }
  }, [numberOfStudentsWhoSubmitted, participantsOnline])

  const avgTestPassRate = useMemo(() => {
    const passRates = Object.values(passRatePerTestCase)

    return Math.round(
      (passRates.reduce((sum, rate) => sum + rate, 0) / passRates.length) * 100,
    )
  }, [passRatePerTestCase])
  return (
    <HStack p={0} minW={200} gap={5}>
      <Tag color="green.600" bg="green.50">
        <TagLeftIcon as={BsFillCircleFill} boxSize={2} />
        <TagLabel>
          Online {participantsOnline}/{totalParticipants}
        </TagLabel>
      </Tag>
      {exampleState === "ongoing" || exampleState === "finished" ? (
        <>
          <HStack>
            <Icon as={GoChecklist} />
            <Text color={"gray.500"} display={"flex"}>
              {exampleState === "ongoing"
                ? `${numberOfStudentsWhoSubmitted}/${Math.max(numberOfStudentsWhoSubmitted, participantsOnline)}` // if participants online not correctly updated, UI should not break
                : numberOfStudentsWhoSubmitted}
            </Text>
            <CustomPieChart value={submissionsProgress}></CustomPieChart>
          </HStack>

          <HStack>
            <Text color={"gray.500"} display={"flex"}>
              Test Pass Rate {avgTestPassRate}%
            </Text>
            <CustomPieChart value={avgTestPassRate} />
          </HStack>
        </>
      ) : null}
    </HStack>
  )
}

const ExampleTimeControler: React.FC<{
  handleTimeAdjustment: (value: number) => void
  handleStart: () => void
  handleTermination: () => void
  handleReset: () => void
  durationAsString: string
  setDurationInSeconds: React.Dispatch<React.SetStateAction<number>>
  exampleState: ExampleState
  setExampleState: React.Dispatch<React.SetStateAction<ExampleState | null>>
  startTime: number | null
  endTime: number | null
}> = ({
  handleTimeAdjustment,
  durationAsString,
  exampleState,
  setExampleState,
  handleStart,
  handleTermination,
  handleReset,
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

  const handleTimeIsUp = useCallback(() => {
    if (exampleState == "ongoing") {
      setExampleState("finished")
    }
  }, [exampleState, setExampleState])

  if (exampleState === "unpublished" || exampleState === "publishing") {
    return (
      <HStack w={"full"} justify={"space-between"}>
        <HStack gap={3}>
          <Button variant={"outline"} onClick={() => handleTimeAdjustment(-30)}>
            -30
          </Button>
          <Button
            variant={"outline"}
            borderRadius={"full"}
            onClick={() => handleTimeAdjustment(-15)}
          >
            -15
          </Button>
          <Text fontSize={"3xl"} fontFamily={"monospace"} align={"center"}>
            {durationAsString}
          </Text>
          <Button
            variant={"outline"}
            borderRadius={"full"}
            onClick={() => handleTimeAdjustment(15)}
          >
            +15
          </Button>
          <Button
            variant={"outline"}
            borderRadius={"full"}
            onClick={() => handleTimeAdjustment(30)}
          >
            +30
          </Button>
        </HStack>

        <Button
          colorScheme="green"
          borderRadius={"lg"}
          onClick={() => handleStart()}
          isLoading={exampleState === "publishing"}
        >
          Start
        </Button>
      </HStack>
    )
  }

  if (exampleState === "ongoing" && startTime !== null && endTime !== null) {
    return (
      <Flex align={"center"} gap={2} flex={1} justify={"end"}>
        <CountdownTimer
          startTime={startTime}
          endTime={endTime}
          size={"large"}
          onTimeIsUp={handleTimeIsUp}
          variant="number-only"
        ></CountdownTimer>
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
    )
  }

  return (
    <Flex flex={1} justify={"end"}>
      <ResetDialog handleReset={handleReset}></ResetDialog>
    </Flex>
  )
}

export function PrivateDashboard() {
  const { publish } = usePublish()
  const { terminate } = useTerminate()
  const { data: fetchedSubmissions, refetch: refetchStudentSubmissions } =
    useStudentSubmissions()
  const { resetExample } = useResetExample()
  const [durationInSeconds, setDurationInSeconds] = useState<number>(150)
  const [exampleState, setExampleState] = useState<ExampleState | null>(null)
  const [exactMatch, setExactMatch] = useState<boolean>(false)
  const [exampleInformation, setExampleInformation] =
    useState<ExampleInformation | null>(null)

  const [testCaseSelection, setTestCaseSelection] = useState<Record<
    string,
    boolean
  > | null>(null)

  const { i18n } = useTranslation()
  const currentLanguage = i18n.language
  const { user } = useOutletContext<UserContext>()
  const { data: example } = useExample(user.email)
  const {
    data: initialExampleInformation,
    refetch: refetchInitialExampleInformation,
  } = useGeneralExampleInformation()
  const { timeFrameFromEvent } = useTimeframeFromSSE()
  const durationAsString = useMemo(() => {
    return formatSeconds(durationInSeconds || 0)
  }, [durationInSeconds])
  const [submissions, setSubmissions] = useState<SubmissionSsePayload[] | null>(
    null,
  )

  useSSE<SubmissionSsePayload>("student-submission", (data) => {
    setSubmissions((prev) => {
      if (prev == null) {
        return [data]
      }
      return [...prev, data]
    })
  })

  useSSE<ExampleInformation>("example-information", (data) => {
    setExampleInformation(data)
  })

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

  const handleReset = useCallback(async () => {
    try {
      await resetExample()
      setExampleState("unpublished")
      refetchInitialExampleInformation()
      refetchStudentSubmissions()
    } catch (e) {
      console.log("An error occured when resetting the example: ", e)
    }
  }, [
    refetchInitialExampleInformation,
    refetchStudentSubmissions,
    resetExample,
  ])

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
    if (initialExampleInformation) {
      setExampleInformation(initialExampleInformation)
      const initialSelectedTests = Object.fromEntries(
        Object.keys(initialExampleInformation.passRatePerTestCase).map(
          (testName) => [testName, false],
        ),
      )
      setTestCaseSelection(initialSelectedTests)
    }
  }, [initialExampleInformation])

  useEffect(() => {
    if (fetchedSubmissions) {
      setSubmissions(fetchedSubmissions)
    }
  }, [fetchedSubmissions])

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

  if (!example || !exampleState || !exampleInformation) {
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
      templateRows={"5fr 1fr"}
      gap={2}
      height={"full"}
    >
      <GridItem
        layerStyle={"segment"}
        gap={4}
        rowStart={1}
        rowEnd={5}
        colStart={1}
        colEnd={2}
        p={3}
      >
        <TestCaseBarChart
          passRatePerTestCase={exampleInformation.passRatePerTestCase}
          exactMatch={exactMatch}
          setExactMatch={setExactMatch}
          testCaseSelection={testCaseSelection}
          setTestCaseSelection={setTestCaseSelection}
        ></TestCaseBarChart>
        {/* <Bookmarks></Bookmarks> */}
      </GridItem>
      <GridItem gap={4} colStart={2} colEnd={4} rowStart={1} rowEnd={4}>
        <Flex direction={"column"} h={"full"}>
          {!submissions || submissions.length < 1 ? (
            <TaskDescription
              instructionContent={instructionsContent}
              title={title}
            />
          ) : (
            <SubmissionInspector
              submissions={submissions}
              selectedTests={testCaseSelection}
              exactMatch={exactMatch}
            />
          )}
        </Flex>
      </GridItem>
      <GridItem
        rowStart={4}
        rowEnd={5}
        colStart={2}
        colEnd={-1}
        display={"flex"}
        flexDirection={"row"}
        gap={3}
        layerStyle={"segment"}
        alignContent={"space-between"}
        p={2}
      >
        <GenearlInformation
          exampleState={exampleState}
          generalInformation={exampleInformation}
        ></GenearlInformation>

        <ExampleTimeControler
          handleTimeAdjustment={handleTimeAdjustment}
          durationAsString={durationAsString} // will be some derived state once implemented properly
          exampleState={exampleState}
          handleStart={handleStart}
          handleTermination={handleTermination}
          handleReset={handleReset}
          setDurationInSeconds={setDurationInSeconds}
          startTime={derivedStartDate}
          endTime={derivedEndDate}
          setExampleState={setExampleState}
        ></ExampleTimeControler>
      </GridItem>
    </Grid>
  )
}
