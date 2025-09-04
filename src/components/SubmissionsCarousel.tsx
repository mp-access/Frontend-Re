import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  HStack,
  Select,
  Text,
} from "@chakra-ui/react"
import { MdOutlineScreenShare } from "react-icons/md"
import "./Carousel.css"

import { Editor } from "@monaco-editor/react"
import React, {
  SetStateAction,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { detectType } from "./Util"

export const getFilteredSubmissions = (
  testCaseSelection: Record<string, boolean> | null,
  submissions: SubmissionSsePayload[],
  exactMatch: boolean,
) => {
  if (!testCaseSelection) {
    return submissions
  }

  const selectionArray: boolean[] = Object.values(testCaseSelection)

  return submissions.filter((submission) => {
    const testsFailedBoolean = submission.testsPassed.map((v) => !v) // as we want to match the failed tests
    if (selectionArray.length !== testsFailedBoolean.length) {
      throw new Error(
        "Missmatching array length between testsPassed and testCaseSelectionArray",
      )
    }
    if (exactMatch) {
      return selectionArray.every((val, idx) => val === testsFailedBoolean[idx])
    }

    return selectionArray.every((selected, idx) => {
      if (!selected) return true // ignore tests not selected
      return testsFailedBoolean[idx] // must have failed if selected
    })
  })
}

const BookmarkToggle: React.FC<{
  bookmarked: boolean
  onClick: () => void
}> = ({ bookmarked, onClick }) => {
  const color = "white"
  const iconStyle: React.CSSProperties = {
    fill: color,
    strokeWidth: 10,
    height: 32,
    width: 32,
  }
  const bookmarkIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 640 640"
      style={iconStyle}
    >
      <path d="M128 128C128 92.7 156.7 64 192 64L448 64C483.3 64 512 92.7 512 128L512 545.1C512 570.7 483.5 585.9 462.2 571.7L320 476.8L177.8 571.7C156.5 585.9 128 570.6 128 545.1L128 128zM192 112C183.2 112 176 119.2 176 128L176 515.2L293.4 437C309.5 426.3 330.5 426.3 346.6 437L464 515.2L464 128C464 119.2 456.8 112 448 112L192 112z" />
    </svg>
  )

  const bookmarkIconFilled = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 640 640"
      style={iconStyle}
    >
      <path d="M192 64C156.7 64 128 92.7 128 128L128 544C128 555.5 134.2 566.2 144.2 571.8C154.2 577.4 166.5 577.3 176.4 571.4L320 485.3L463.5 571.4C473.4 577.3 485.7 577.5 495.7 571.8C505.7 566.1 512 555.5 512 544L512 128C512 92.7 483.3 64 448 64L192 64z" />
    </svg>
  )

  return (
    <Box
      as="button"
      onClick={onClick}
      p={0}
      m={0}
      bg="transparent"
      border="none"
      cursor="pointer"
      _focus={{ outline: "none" }}
      _hover={{ transform: "scale(1.05)" }}
    >
      {bookmarked ? bookmarkIconFilled : bookmarkIcon}
    </Box>
  )
}

const EditorContainer: React.FC<{
  submissionContent: string
  selectedFileName: string
}> = ({ submissionContent, selectedFileName }) => {
  const derivedProgrammingLanguage = useMemo(
    () => detectType(selectedFileName),
    [selectedFileName],
  )
  return (
    <Editor
      value={submissionContent}
      options={{
        readOnly: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
      }}
      height={"100%"}
      language={derivedProgrammingLanguage}
    />
  )
}

const MemoizedEditor = React.memo(EditorContainer)

const Slide: React.FC<{
  submission: SubmissionSsePayload
  hideStudentInfo: boolean
  categoryColor: string
  currentIndex: number
  totalSubmissions: number
  bookmarked: boolean
  fileNames: string[]
  selectedFileName: string
  isVisible: boolean
  setSelectedFileName: React.Dispatch<SetStateAction<string | null>>
  handleOnBookmarkClick: (submission: SubmissionSsePayload) => void
  openInEditor: (studentId: string) => Promise<void>
}> = ({
  submission,
  hideStudentInfo,
  currentIndex,
  totalSubmissions,
  categoryColor,
  bookmarked,
  fileNames,
  selectedFileName,
  setSelectedFileName,
  openInEditor,
  handleOnBookmarkClick,
  isVisible,
}) => {
  const handleFileSelection = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedFileName(event.target.value)
    },
    [setSelectedFileName],
  )

  return (
    <Flex direction={"column"} borderRadius={"lg"} flexGrow={0}>
      <HStack
        justify={"space-between"}
        px={3}
        py={2}
        bg={`${categoryColor}.500`}
        color={"white"}
        borderTopRadius={"xl"}
      >
        <Heading fontSize="lg">
          {hideStudentInfo ? "****************" : submission.studentId}{" "}
          <Text fontSize={"sm"} fontWeight={400} display={"inline"}>
            ({currentIndex + 1}/{totalSubmissions})
          </Text>
        </Heading>
        <Text>Points: {submission.points?.toFixed(2)}</Text>
        {fileNames.length > 1 ? (
          <Select
            maxW={150}
            overflow={"hidden"}
            value={selectedFileName}
            onChange={handleFileSelection}
          >
            {fileNames.map((name) => (
              <option value={name}>{name}</option>
            ))}
          </Select>
        ) : null}
        <BookmarkToggle
          onClick={() => handleOnBookmarkClick(submission)}
          bookmarked={bookmarked}
        />
      </HStack>
      <Divider />
      <Flex
        h={"full"}
        marginTop={4}
        direction={"column"}
        p={2}
        minH={0}
        flex={1}
      >
        <Box flex={1} minH={0} position={"relative"}>
          {isVisible ? (
            <MemoizedEditor
              submissionContent={submission.content[selectedFileName]}
              selectedFileName={selectedFileName}
            />
          ) : (
            <Text></Text>
          )}
        </Box>
        <Flex direction={"row-reverse"}>
          <Button
            position={"relative"}
            right={2}
            bottom={2}
            onClick={() => openInEditor(submission.studentId)}
            borderRadius={"lg"}
            leftIcon={<MdOutlineScreenShare />}
          >
            Open in Editor
          </Button>
        </Flex>
      </Flex>
    </Flex>
  )
}

const SLIDES_GAP = 50

export const SubmissionsCarousel: React.FC<{
  submissions: SubmissionSsePayload[]
  hideStudentInfo: boolean
  bookmarks: Bookmark[] | null
  lastDisplayedSubmissionId: number | null
  selectedFileName: string | null
  setSelectedFileName: React.Dispatch<SetStateAction<string | null>>
  setTestsPassedCurrentSubmission: React.Dispatch<
    SetStateAction<number[] | null>
  >
  setLastDisplayedSubmissionId: React.Dispatch<SetStateAction<number | null>>
  handleOnBookmarkClick: (submission: SubmissionSsePayload) => void
  openInEditor: (studentId: string) => Promise<void>
  getSubmissionColor: (submissionId: number) => string
}> = ({
  submissions,
  hideStudentInfo,
  lastDisplayedSubmissionId,
  bookmarks,
  selectedFileName,
  setSelectedFileName,
  setTestsPassedCurrentSubmission,
  setLastDisplayedSubmissionId,
  handleOnBookmarkClick,
  openInEditor,
  getSubmissionColor,
}) => {
  const sliderRef = useRef<HTMLDivElement | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const fileNames = useMemo(() => {
    if (!submissions || submissions.length === 0) return null
    return Object.keys(submissions[0].content)
  }, [submissions])

  const slideCount = useMemo(
    () => (submissions ? submissions?.length : 0),
    [submissions],
  )

  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const goToSlide = useCallback(
    (index: number, behavior?: ScrollBehavior) => {
      const slider = sliderRef.current

      if (slider) {
        const newIndex = Math.max(0, Math.min(index, slideCount - 1))
        const slideWidth = slider.offsetWidth + SLIDES_GAP
        slider.scrollTo({
          left: newIndex * slideWidth,
          behavior: behavior ?? "smooth",
        })
        setCurrentIndex(newIndex)
        setLastDisplayedSubmissionId(submissions[newIndex].submissionId)
      }
    },
    [setLastDisplayedSubmissionId, slideCount, submissions],
  )

  useLayoutEffect(() => {
    const slider = sliderRef.current
    if (!slider) return

    const handleScroll = () => {
      const slideWidth = slider.offsetWidth + SLIDES_GAP
      const index = Math.round(slider.scrollLeft / slideWidth)
      setCurrentIndex(index)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      // this is needed to still enable smooth scrolling via touch screen while keeping track of last selected submission
      scrollTimeoutRef.current = setTimeout(() => {
        setLastDisplayedSubmissionId(submissions[index].submissionId)
      }, 500)
    }

    slider.addEventListener("scroll", handleScroll)
    return () => {
      slider.removeEventListener("scroll", handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [currentIndex, setLastDisplayedSubmissionId, submissions])

  useEffect(() => {
    if (!lastDisplayedSubmissionId) return

    const index = submissions.findIndex(
      (submission) => submission.submissionId === lastDisplayedSubmissionId,
    )

    if (index === -1) return

    goToSlide(index, "instant")
  }, [
    lastDisplayedSubmissionId,
    goToSlide,
    setLastDisplayedSubmissionId,
    submissions,
  ])

  useEffect(() => {
    if (selectedFileName === null && fileNames) {
      setSelectedFileName(fileNames[0])
    }
  }, [fileNames, selectedFileName, setSelectedFileName])

  useEffect(() => {
    if (submissions && currentIndex !== null) {
      setTestsPassedCurrentSubmission(submissions[currentIndex]?.testsPassed)
    }
  }, [currentIndex, setTestsPassedCurrentSubmission, submissions])

  const showPrevButton = currentIndex !== 0
  const showJumpToEndButton = currentIndex === 0 && submissions.length > 1
  const showNextButton = currentIndex !== submissions.length - 1
  const showJumpToStartButton =
    currentIndex === submissions.length - 1 && submissions.length > 1

  const bookmarked = useCallback(
    (submissionId: number) => {
      if (!bookmarks) return false

      return bookmarks.some(
        (bookmark) => bookmark.submissionId === submissionId,
      )
    },
    [bookmarks],
  )
  if (!fileNames || !selectedFileName)
    return (
      <Flex flex={1} layerStyle={"segment"} justify={"center"} align={"center"}>
        <Text>No implementation matches the selected filters</Text>
      </Flex>
    )
  return (
    <Flex
      position={"relative"}
      display={"flex"}
      p={0}
      background={"transparent"}
      flex={1}
    >
      <Flex width={"100%"} borderRadius={"2xl"} flex={1}>
        <Flex
          className="slides"
          ref={sliderRef}
          gap={SLIDES_GAP}
          height={"auto"}
        >
          {submissions.map((submission, i) => {
            const VISIBLE_RANGE = 1 // renders 1 to the left and right of current visible editor => 3 in total
            const isVisible = Math.abs(i - currentIndex) <= VISIBLE_RANGE

            return (
              <Slide
                submission={submission}
                hideStudentInfo={hideStudentInfo}
                categoryColor={getSubmissionColor(submission.submissionId)}
                currentIndex={i}
                totalSubmissions={submissions.length}
                openInEditor={openInEditor}
                handleOnBookmarkClick={handleOnBookmarkClick}
                key={submission.submissionId}
                bookmarked={bookmarked(submission.submissionId)}
                fileNames={fileNames}
                selectedFileName={selectedFileName}
                setSelectedFileName={setSelectedFileName}
                isVisible={isVisible}
              />
            )
          })}
        </Flex>
      </Flex>
      {showPrevButton ? (
        <Button
          style={{
            position: "absolute",
            top: "50%",
            left: 5,
          }}
          onClick={() => goToSlide(currentIndex - 1)}
          variant={"outline"}
          borderRadius={"full"}
          height={"65px"}
          opacity={0.5}
        >
          Prev
        </Button>
      ) : showJumpToEndButton ? (
        <Button
          style={{
            position: "absolute",
            top: "50%",
            left: 5,
          }}
          onClick={() => goToSlide(submissions.length - 1)}
          variant={"outline"}
          borderRadius={"full"}
          height={"65px"}
          opacity={0.5}
        >
          Jump to
          <br />
          Last
        </Button>
      ) : null}
      {showNextButton ? (
        <Button
          style={{
            position: "absolute",
            top: "50%",
            right: 5,
          }}
          onClick={() => goToSlide(currentIndex + 1)}
          variant={"outline"}
          borderRadius={"full"}
          height={"65px"}
          opacity={0.5}
        >
          Next
        </Button>
      ) : showJumpToStartButton ? (
        <Button
          style={{
            position: "absolute",
            top: "50%",
            right: 5,
          }}
          onClick={() => goToSlide(0)}
          variant={"outline"}
          borderRadius={"full"}
          height={"65px"}
          opacity={0.5}
        >
          Jump to
          <br />
          First
        </Button>
      ) : null}
    </Flex>
  )
}
