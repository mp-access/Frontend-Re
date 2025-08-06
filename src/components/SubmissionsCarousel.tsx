import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  HStack,
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

const Slide: React.FC<{
  submission: SubmissionSsePayload
  categoryColor: string
  currentIndex: number
  totalSubmissions: number
  bookmarked: boolean
  handleOnBookmarkClick: (submission: SubmissionSsePayload) => void
  openInEditor: (studentId: string) => Promise<void>
}> = ({
  submission,
  currentIndex,
  totalSubmissions,
  categoryColor,
  bookmarked,
  openInEditor,
  handleOnBookmarkClick,
}) => {
  return (
    <Flex direction={"column"} borderRadius={"lg"}>
      <HStack
        justify={"space-between"}
        px={3}
        py={2}
        bg={`${categoryColor}.500`}
        color={"white"}
        borderTopRadius={"xl"}
      >
        <Heading fontSize="lg">
          {submission.studentId}{" "}
          <Text fontSize={"sm"} fontWeight={400} display={"inline"}>
            ({currentIndex + 1}/{totalSubmissions})
          </Text>
        </Heading>
        <Text>Points: {submission.points?.toFixed(2)}</Text>
        <BookmarkToggle
          onClick={() => handleOnBookmarkClick(submission)}
          bookmarked={bookmarked}
        ></BookmarkToggle>
      </HStack>
      <Divider />
      <Flex h={"full"} marginTop={4} direction={"column"} p={2}>
        <Editor
          value={submission.content}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
          }}
          language="python"
        ></Editor>
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
  bookmarks: Bookmark[] | null
  lastDisplayedSubmissionId: number | null
  setLastDisplayedSubmissionId: React.Dispatch<SetStateAction<number | null>>
  handleOnBookmarkClick: (submission: SubmissionSsePayload) => void
  openInEditor: (studentId: string) => Promise<void>
  getSubmissionColor: (submissionId: number) => string
}> = ({
  submissions,
  lastDisplayedSubmissionId,
  setLastDisplayedSubmissionId,
  handleOnBookmarkClick,
  openInEditor,
  bookmarks,
  getSubmissionColor,
}) => {
  const sliderRef = useRef<HTMLDivElement | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const slideCount = useMemo(
    () => (submissions ? submissions?.length : 0),
    [submissions],
  )

  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  const showPrevButton = currentIndex !== 0

  const bookmarked = useCallback(
    (submissionId: number) => {
      if (!bookmarks) return false

      return bookmarks.some(
        (bookmark) => bookmark.submissionId === submissionId,
      )
    },
    [bookmarks],
  )

  return (
    <Flex
      position={"relative"}
      display={"flex"}
      p={0}
      background={"transparent"}
      height={"full"}
    >
      <Flex className="slider" width={"full"} borderRadius={"2xl"}>
        <Flex className="slides" ref={sliderRef} gap={SLIDES_GAP}>
          {submissions.map((submission, i) => (
            <Slide
              submission={submission}
              categoryColor={getSubmissionColor(submission.submissionId)}
              currentIndex={i}
              totalSubmissions={submissions.length}
              openInEditor={openInEditor}
              handleOnBookmarkClick={handleOnBookmarkClick}
              key={submission.submissionId}
              bookmarked={bookmarked(submission.submissionId)}
            ></Slide>
          ))}
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
      ) : null}

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
    </Flex>
  )
}
