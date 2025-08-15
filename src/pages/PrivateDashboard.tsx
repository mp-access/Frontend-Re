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
  Heading,
  HStack,
  Icon,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
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
import React, {
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { CountdownTimer } from "../components/CountdownTimer"
import { RotateFromRightIcon } from "../components/CustomIcons"
import {
  useCategorize,
  useExample,
  useExtendExample,
  useInspect,
  useLocalStorage,
  usePublish,
  useResetExample,
  useSSE,
  useStudentSubmissions,
  useTerminate,
  useTimeframeFromSSE,
} from "../components/Hooks"

import { useOutletContext, useParams } from "react-router-dom"
import { Markdown, Placeholder } from "../components/Panels"
import {
  getFilteredSubmissions,
  SubmissionsCarousel,
} from "../components/SubmissionsCarousel"
import { TestCaseBarChart } from "../components/TestCaseBarChart"

import { BookmarkView } from "../components/BookmarkView"
import { formatSeconds } from "../components/Util"

type ExampleState =
  | "unpublished"
  | "publishing"
  | "ongoing"
  | "finished"
  | "resetting"

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
  bookmarks: Bookmark[] | null
  lastDisplayedSubmissionId: number | null
  categories: CategoriesType
  selectedCategory: string | null
  selectedFileName: string | null
  setSelectedFileName: React.Dispatch<SetStateAction<string | null>>
  setLastDisplayedSubmissionId: React.Dispatch<SetStateAction<number | null>>
  setCategories: React.Dispatch<React.SetStateAction<CategoriesType>>
  setSelectedCategory: React.Dispatch<SetStateAction<string | null>>
  getSubmissionColor: (submissionId: number) => string
  handleOnBookmarkClick: (submission: SubmissionSsePayload) => void
}> = ({
  submissions,
  testCaseSelection,
  exactMatch,
  bookmarks,
  lastDisplayedSubmissionId,
  categories,
  selectedCategory,
  selectedFileName,
  setSelectedFileName,
  setLastDisplayedSubmissionId,
  setSelectedCategory,
  setCategories,
  getSubmissionColor,
  handleOnBookmarkClick,
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

  const [carouselSubmissions, setCarouselSubmissions] = useState<
    SubmissionSsePayload[]
  >([])
  const LEFTOVER_CATEGORY_KEY = "none"

  const handleCategorySelection = (categoryKey: string) => {
    if (Object.keys(categories).length > 1)
      setSelectedCategory((prev) => (prev === categoryKey ? null : categoryKey))
    setLastDisplayedSubmissionId(categories[categoryKey].selectedIds[0])
  }

  const { categorize, isLoading } = useCategorize()

  // Utils
  const getSubmissionsAvgScore = (ids: number[]) => {
    const selectedPoints = submissions
      .filter((f) => ids.includes(f.submissionId))
      .map((s) => s.points)

    return selectedPoints.reduce((a, b) => a! + b!, 0)! / selectedPoints.length
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

  const categoryColorNames = useMemo(() => {
    return Object.values(categories).map((category) => category.color)
  }, [categories])

  const bgColors = useToken(
    "colors",
    categoryColorNames.map((color) => `${color}.200`),
  )
  const selectedColors = useToken(
    "colors",
    categoryColorNames.map((color) => `${color}.500`),
  )

  return (
    <Flex direction={"column"} h={"full"} gap={2} flex={1}>
      <Flex layerStyle={"segment"} direction="row" p={3}>
        {Object.entries(categories).map(([categoryKey, category], i) => {
          const bgColor = bgColors[i]
          const selectedColor = selectedColors[i]
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
          isLoading={isLoading}
        >
          Re-categorize
        </Button>
      </Flex>

      <SubmissionsCarousel
        submissions={carouselSubmissions}
        openInEditor={openInEditor}
        handleOnBookmarkClick={handleOnBookmarkClick}
        bookmarks={bookmarks}
        lastDisplayedSubmissionId={lastDisplayedSubmissionId}
        setLastDisplayedSubmissionId={setLastDisplayedSubmissionId}
        getSubmissionColor={getSubmissionColor}
        selectedFileName={selectedFileName}
        setSelectedFileName={setSelectedFileName}
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
    useToken("colors", "purple.500"),
    useToken("colors", "gray.100"),
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

          <HStack overflow={"auto"}>
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
  durationInSeconds: number
  durationAsString: string
  setDurationInSeconds: React.Dispatch<React.SetStateAction<number>>
  exampleState: ExampleState
  setExampleState: React.Dispatch<React.SetStateAction<ExampleState | null>>
  startTime: number | null
  endTime: number | null
}> = ({
  handleTimeAdjustment,
  durationInSeconds,
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
      <HStack w={"full"} justify={"space-between"} overflow={"auto"}>
        <HStack gap={3}>
          <Button
            isDisabled={
              durationInSeconds <= 30 || exampleState === "publishing"
            }
            variant={"outline"}
            onClick={() => handleTimeAdjustment(-30)}
          >
            -30
          </Button>
          <Button
            variant={"outline"}
            borderRadius={"full"}
            onClick={() => handleTimeAdjustment(-15)}
            isDisabled={
              durationInSeconds <= 15 || exampleState === "publishing"
            }
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
            isDisabled={exampleState === "publishing"}
          >
            +15
          </Button>
          <Button
            variant={"outline"}
            borderRadius={"full"}
            onClick={() => handleTimeAdjustment(30)}
            isDisabled={exampleState === "publishing"}
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
  const { courseSlug, exampleSlug } = useParams()
  const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[] | null>(
    `${courseSlug}-${exampleSlug}-bookmarks`,
    null,
  )

  const [tabIndex, setTabIndex] = useLocalStorage<number>(
    `${courseSlug}-${exampleSlug}-tabindex`,
    0,
  )
  const [testCaseSelection, setTestCaseSelection] = useState<Record<
    string,
    boolean
  > | null>(null)

  const [lastDisplayedSubmissionId, setLastDisplayedSubmissionId] = useState<
    number | null
  >(null)

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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  const getSubmissionColor = (submissionId: number) => {
    const foundColor = Object.values(categories).filter((category) =>
      category.ids.includes(submissionId),
    )

    if (foundColor.length > 0) return foundColor[0].color
    return "gray"
  }

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
      setDurationInSeconds((oldVal) => Math.max(15, oldVal + value))
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
      setBookmarks(null)
      refetchStudentSubmissions()
    } catch (e) {
      console.log("An error occured when resetting the example: ", e)
      setExampleState("finished")
    }
  }, [refetchStudentSubmissions, resetExample, setBookmarks])

  const handleOnBookmarkClick = useCallback(
    (submission: SubmissionSsePayload) => {
      const submissionBookmark: Bookmark = {
        submissionId: submission.submissionId,
        studentId: submission.studentId,
        testsPassed: submission.testsPassed,
        selectedFileName: selectedFileName,
        filters: {
          testCaseSelection,
          exactMatch,
          categorySelected: !!selectedCategory,
        },
      }

      setBookmarks((prev) => {
        if (!prev) {
          return [submissionBookmark]
        }

        // check if bookmark already exists
        const shouldRemove = prev.some(
          (bookmark) => submission.submissionId === bookmark.submissionId,
        )

        if (shouldRemove) {
          const idx = prev.findIndex(
            (bookmark) => bookmark.submissionId === submission.submissionId,
          )

          if (idx !== -1) {
            return [...prev.slice(0, idx), ...prev.slice(idx + 1)]
          }
        }

        return [...prev, submissionBookmark]
      })
    },
    [
      exactMatch,
      selectedCategory,
      selectedFileName,
      setBookmarks,
      testCaseSelection,
    ],
  )

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

  const getCategoryKeyBySubmissionId = useCallback(
    (submissionId: number) => {
      for (const [key, value] of Object.entries(categories)) {
        if (value.ids.includes(submissionId)) {
          return key
        }
      }
      return null
    },
    [categories],
  )

  const handleBookmarkSelection = useCallback(
    (bookmark: Bookmark) => {
      const { exactMatch, testCaseSelection } = bookmark.filters
      setExactMatch(exactMatch)
      setTestCaseSelection(testCaseSelection)
      setSelectedFileName(bookmark.selectedFileName)
      if (
        Object.keys(categories).length >= 1 &&
        bookmark.filters.categorySelected
      ) {
        const submissionCat = getCategoryKeyBySubmissionId(
          bookmark.submissionId,
        )
        setSelectedCategory(submissionCat)
      } else {
        setSelectedCategory(null)
      }

      setLastDisplayedSubmissionId(bookmark.submissionId)
    },

    [categories, getCategoryKeyBySubmissionId],
  )

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
    <Flex layerStyle={"container"} gap={2} height={"full"}>
      <Flex
        direction={"column"}
        layerStyle={"segment"}
        gap={4}
        p={1}
        minWidth={0}
        flex={1}
        overflow={"auto"}
      >
        <Tabs
          variant={"line"}
          isFitted
          display={"flex"}
          flexDir={"column"}
          flex={1}
          colorScheme="purple"
          index={tabIndex}
          onChange={(index) => setTabIndex(index)}
          h="100%"
          minH={0}
        >
          <TabList>
            <Tab>Test Cases</Tab>
            <Tab> Bookmarks</Tab>
          </TabList>
          <TabPanels display={"flex"} flex={1} minH={0}>
            <TabPanel display={"flex"} flex={1} pb={1} pl={1} pr={1} minH={0}>
              <TestCaseBarChart
                passRatePerTestCase={exampleInformation.passRatePerTestCase}
                exactMatch={exactMatch}
                setExactMatch={setExactMatch}
                testCaseSelection={testCaseSelection}
                setTestCaseSelection={setTestCaseSelection}
              ></TestCaseBarChart>
            </TabPanel>
            <TabPanel display={"flex"} flex={1}>
              <BookmarkView
                bookmarks={bookmarks}
                handleBookmarkSelection={handleBookmarkSelection}
                getSubmissionColor={getSubmissionColor}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Flex>
      <Flex gap={2} flexDirection={"column"} minWidth={0} flex={2}>
        <Flex direction={"column"} flex={1}>
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
              handleOnBookmarkClick={handleOnBookmarkClick}
              bookmarks={bookmarks}
              lastDisplayedSubmissionId={lastDisplayedSubmissionId}
              setLastDisplayedSubmissionId={setLastDisplayedSubmissionId}
              categories={categories}
              setCategories={setCategories}
              getSubmissionColor={getSubmissionColor}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedFileName={selectedFileName}
              setSelectedFileName={setSelectedFileName}
            />
          )}
        </Flex>
        <Flex
          display={"flex"}
          flexDirection={"row"}
          gap={3}
          layerStyle={"segment"}
          alignContent={"space-between"}
          p={2}
          overflow={"auto"}
        >
          <GeneralInformation
            exampleState={exampleState}
            generalInformation={exampleInformation}
          ></GeneralInformation>

          <ExampleTimeController
            handleTimeAdjustment={handleTimeAdjustment}
            durationAsString={durationAsString}
            durationInSeconds={durationInSeconds}
            exampleState={exampleState}
            handleStart={handleStart}
            handleTermination={handleTermination}
            handleReset={handleReset}
            setDurationInSeconds={setDurationInSeconds}
            startTime={derivedStartDate}
            endTime={derivedEndDate}
            setExampleState={setExampleState}
          ></ExampleTimeController>
        </Flex>
      </Flex>
    </Flex>
  )
}
