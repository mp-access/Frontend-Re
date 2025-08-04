import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
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
  useCategorize,
  useExample,
  useExtendExample,
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
import {
  getFilteredSubmissions,
  SubmissionsCarousel,
} from "../components/SubmissionsCarousel"
import { TestCaseBarChart } from "../components/TestCaseBarChart"

import { formatSeconds } from "../components/Util"

type ExampleState =
  | "unpublished"
  | "publishing"
  | "ongoing"
  | "finished"
  | "resetting"

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

const ResetDialog: React.FC<{
  handleReset: () => void
  exampleState: ExampleState
}> = ({ handleReset, exampleState }) => {
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
        isLoading={exampleState === "resetting"}
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

type CategoriesType = Record<
  string,
  { ids: number[]; color: string; selectedIds: number[]; avgScore: number }
>
const SubmissionInspector: React.FC<{
  submissions: SubmissionSsePayload[]
  testCaseSelection: Record<string, boolean> | null
  exactMatch: boolean
  categories: CategoriesType
  setCategories: React.Dispatch<React.SetStateAction<CategoriesType>>
}> = ({
  submissions,
  testCaseSelection,
  exactMatch,
  categories,
  setCategories,
}) => {
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

  const [selectedCategory, setSelectedCategory] = useState<string>()
  const [carouselSubmissions, setCarouselSubmissions] = useState<
    SubmissionSsePayload[]
  >([])
  const LEFTOVER_CATEGORY_KEY = "none"

  const handleCategorySelection = (categoryKey: string) => {
    if (Object.keys(categories).length > 1)
      setSelectedCategory((prev) =>
        prev === categoryKey ? undefined : categoryKey,
      )
  }

  const { categorize, isLoading } = useCategorize()

  // Utils
  const getSubmissionsAvgScore = (ids: number[]) => {
    const selectedPoints = submissions
      .filter((f) => ids.includes(f.submissionId))
      .map((s) => s.points)

    return selectedPoints.reduce((a, b) => a! + b!, 0)! / selectedPoints.length
  }

  const getSubmissionColor = (submissionId: number) => {
    const foundColor = Object.values(categories).filter((category) =>
      category.ids.includes(submissionId),
    )

    if (foundColor.length > 0) return foundColor[0].color
    return "gray"
  }

  // Handle the fetching button
  const handleFetchCategories = async () => {
    categorize(submissions.map((s) => s.submissionId)).then((res) => {
      const rawColors = ["purple", "green", "yellow", "blue", "orange"]
      const newCategories: CategoriesType = {}

      Object.keys(res.categories)
        .sort((a, b) => res.categories[b].length - res.categories[a].length)
        .map((key, i) => {
          newCategories[`cat-${i}`] = {
            color: rawColors[i],
            ids: res.categories[key],
            selectedIds: res.categories[key],
            avgScore: getSubmissionsAvgScore(res.categories[key]),
          }
        })

      const noCatIds = submissions
        .map((s) => s.submissionId)
        .filter((f) => !Object.values(res.categories).flat().includes(f))

      if (noCatIds.length > 0) {
        newCategories[LEFTOVER_CATEGORY_KEY] = {
          color: "gray",
          ids: noCatIds,
          selectedIds: noCatIds,
          avgScore: getSubmissionsAvgScore(noCatIds),
        }
      }

      setCategories(newCategories)
    })
  }

  // Handle the "None" category
  useEffect(() => {
    const withCatIds = Object.keys(categories)
      .filter((f) => f !== LEFTOVER_CATEGORY_KEY)
      .map((key) => categories[key].ids)
      .flat()

    const noCatIds = submissions
      .map((s) => s.submissionId)
      .filter((f) => !withCatIds.includes(f))

    if (noCatIds.length > 0)
      setCategories((prev) => ({
        ...prev,
        [LEFTOVER_CATEGORY_KEY]: {
          color: "gray",
          ids: noCatIds,
          selectedIds: noCatIds,
          avgScore: getSubmissionsAvgScore(noCatIds),
        },
      }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissions])

  // Handle filter change
  useEffect(() => {
    const filteredSubmissionIds = getFilteredSubmissions(
      testCaseSelection,
      submissions,
      exactMatch,
    ).map((f) => f.submissionId)

    Object.keys(categories).forEach((key) => {
      setCategories((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          selectedIds: categories[key].ids.filter((f) =>
            filteredSubmissionIds.includes(f),
          ),
        },
      }))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exactMatch, testCaseSelection])

  useEffect(() => {
    if (selectedCategory) {
      const selectedIds = categories[selectedCategory].selectedIds

      const selectedSubmissions = submissions.filter((f) =>
        selectedIds.includes(f.submissionId),
      )

      setCarouselSubmissions(selectedSubmissions)
    } else {
      setCarouselSubmissions(
        getFilteredSubmissions(testCaseSelection, submissions, exactMatch),
      )
    }
  }, [categories, exactMatch, selectedCategory, submissions, testCaseSelection])

  return (
    <Flex direction={"column"} h={"full"} gap={2}>
      <Flex layerStyle={"segment"} direction="row" p={3}>
        {Object.entries(categories).map(([categoryKey, category], i) => {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const [bgColor, selectedColor] = useToken("colors", [
            `${category.color}.200`,
            `${category.color}.500`,
          ])

          const lastIndex = Object.values(categories).length - 1

          return (
            <Box
              h={9}
              position={"relative"}
              flex={category.ids.length}
              bgColor={bgColor}
              roundedLeft={i === 0 ? 8 : 0}
              roundedRight={i === lastIndex ? 8 : 0}
              mr={-1}
              key={i}
              onClick={() => handleCategorySelection(categoryKey)}
            >
              <Box
                position={"absolute"}
                h={"full"}
                w={
                  category.selectedIds.length === category.ids.length
                    ? "full"
                    : category.selectedIds.length / category.ids.length
                }
                bgColor={selectedColor}
                border={"1px solid black"}
                roundedLeft={i === 0 ? 8 : 0}
                roundedRight={i === lastIndex ? 8 : 0}
                _before={
                  selectedCategory === categoryKey
                    ? {
                        content: `""`,
                        top: "calc(100% + 2px)",
                        left: "-1px",
                        position: "absolute",
                        width: "max(100%, 8px)",
                        height: 2,
                        bg: selectedColor,
                        roundedBottom: "10px",
                      }
                    : {}
                }
              />
              <Grid
                position={"absolute"}
                p={2}
                h={"full"}
                w={"full"}
                overflow={"hidden"}
                placeItems={"center"}
                color={"white"}
                fontSize={"xs"}
                textOverflow={"ellipsis"}
                whiteSpace={"nowrap"}
                textShadow={`-1px -1px 0 ${selectedColor}, 1px -1px 0 ${selectedColor}, -1px 1px 0 ${selectedColor}, 1px 1px 0 ${selectedColor}`}
              >
                {category.ids.length} | Avg: {category.avgScore.toFixed(2)}
              </Grid>
            </Box>
          )
        })}

        <Button
          h={9}
          variant={"outline"}
          borderRadius={8}
          ml={3}
          onClick={handleFetchCategories}
          disabled={submissions.length < 5 || isLoading}
        >
          Re-categorize
        </Button>
      </Flex>

      <SubmissionsCarousel
        submissions={carouselSubmissions}
        openInEditor={openInEditor}
        getSubmissionColor={getSubmissionColor}
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
const GeneralInformation: React.FC<{
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

const ExampleTimeController: React.FC<{
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
      <ResetDialog
        handleReset={handleReset}
        exampleState={exampleState}
      ></ResetDialog>
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
  const { timeFrameFromEvent } = useTimeframeFromSSE()
  const durationAsString = useMemo(() => {
    return formatSeconds(durationInSeconds || 0)
  }, [durationInSeconds])
  const [submissions, setSubmissions] = useState<SubmissionSsePayload[] | null>(
    null,
  )
  const [categories, setCategories] = useState<CategoriesType>({})

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
      setExampleState("resetting")
      await resetExample()
      setExampleState("unpublished")
      refetchStudentSubmissions()
    } catch (e) {
      console.log("An error occured when resetting the example: ", e)
      setExampleState("finished")
    }
  }, [refetchStudentSubmissions, resetExample])

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
    if (fetchedSubmissions) {
      setSubmissions(
        fetchedSubmissions.submissions.sort(
          (a, b) => Date.parse(a.date) - Date.parse(b.date),
        ),
      )

      setExampleInformation(fetchedSubmissions)
      const initialSelectedTests = Object.fromEntries(
        Object.keys(fetchedSubmissions.passRatePerTestCase).map((testName) => [
          testName,
          false,
        ]),
      )
      setTestCaseSelection(initialSelectedTests)
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
              testCaseSelection={testCaseSelection}
              exactMatch={exactMatch}
              categories={categories}
              setCategories={setCategories}
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
        <GeneralInformation
          exampleState={exampleState}
          generalInformation={exampleInformation}
        ></GeneralInformation>

        <ExampleTimeController
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
        ></ExampleTimeController>
      </GridItem>
    </Grid>
  )
}
