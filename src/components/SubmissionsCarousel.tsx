import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  HStack,
  Text,
  useToken,
} from "@chakra-ui/react"
import { MdOutlineScreenShare } from "react-icons/md"
import "./Carousel.css"

import { Editor } from "@monaco-editor/react"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"

const getFilteredSubmissions = (
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
  const color = useToken("colors", "purple.600")
  const bookmarkIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 640 640"
      style={{ fill: color, height: 32, width: 32 }}
    >
      <path d="M128 128C128 92.7 156.7 64 192 64L448 64C483.3 64 512 92.7 512 128L512 545.1C512 570.7 483.5 585.9 462.2 571.7L320 476.8L177.8 571.7C156.5 585.9 128 570.6 128 545.1L128 128zM192 112C183.2 112 176 119.2 176 128L176 515.2L293.4 437C309.5 426.3 330.5 426.3 346.6 437L464 515.2L464 128C464 119.2 456.8 112 448 112L192 112z" />
    </svg>
  )
  const bookmarkIconFilled = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 640 640"
      style={{ fill: color, height: 32, width: 32 }}
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
  handleOnBookmarkClick: (submission: SubmissionSsePayload) => void
  openInEditor: (studentId: string) => Promise<void>
  bookmarked: boolean
}> = ({ submission, handleOnBookmarkClick, openInEditor, bookmarked }) => {
  return (
    <Flex direction={"column"} p={2}>
      <HStack justify={"space-between"} pl={2} pr={2}>
        <Heading fontSize="lg">{submission.studentId}</Heading>
        <Text>Points: {submission.points}</Text>
        <BookmarkToggle
          onClick={() => handleOnBookmarkClick(submission)}
          bookmarked={bookmarked}
        ></BookmarkToggle>
      </HStack>
      <Divider />
      <Flex h={"full"} marginTop={4} direction={"column"}>
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

export const SubmissionsCarousel: React.FC<{
  submissions: SubmissionSsePayload[]
  testCaseSelection: Record<string, boolean> | null
  exactMatch: boolean
  bookmarks: Bookmark[] | null
  handleOnBookmarkClick: (submission: SubmissionSsePayload) => void
  openInEditor: (studentId: string) => Promise<void>
}> = ({
  submissions,
  testCaseSelection,
  exactMatch,
  handleOnBookmarkClick,
  openInEditor,
  bookmarks,
}) => {
  const sliderRef = useRef<HTMLDivElement | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [lastDisplayedSubmissionId, setLastDisplayedSubmissionId] = useState<
    number | null
  >(null)
  const slideCount = submissions ? submissions?.length : 0
  const filteredSubmissions = useMemo(() => {
    return getFilteredSubmissions(testCaseSelection, submissions, exactMatch)
  }, [exactMatch, testCaseSelection, submissions])

  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const slider = sliderRef.current
    if (!slider) return

    const handleScroll = () => {
      const index = Math.round(slider.scrollLeft / slider.offsetWidth)
      setCurrentIndex(index)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      // this is needed to still enable smooth scrolling via touch screen while keeping track of last selected submission
      scrollTimeoutRef.current = setTimeout(() => {
        setLastDisplayedSubmissionId(filteredSubmissions[index].submissionId)
      }, 500)
    }

    slider.addEventListener("scroll", handleScroll)
    return () => {
      slider.removeEventListener("scroll", handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [currentIndex, filteredSubmissions, submissions])

  const goToSlide = useCallback(
    (index: number, behavior?: ScrollBehavior) => {
      const slider = sliderRef.current
      if (slider) {
        const newIndex = Math.max(0, Math.min(index, slideCount - 1))
        slider.scrollTo({
          left: newIndex * slider.offsetWidth,
          behavior: behavior ?? "smooth",
        })
        setCurrentIndex(newIndex)
        setLastDisplayedSubmissionId(filteredSubmissions[newIndex].submissionId)
      }
    },
    [filteredSubmissions, slideCount],
  )
  useEffect(() => {
    if (!lastDisplayedSubmissionId) return

    const index = filteredSubmissions.findIndex(
      (submission) => submission.submissionId === lastDisplayedSubmissionId,
    )
    if (index !== -1) {
      goToSlide(index, "instant")
    } else {
      setLastDisplayedSubmissionId(filteredSubmissions[0]?.submissionId ?? null)
    }
  }, [lastDisplayedSubmissionId, filteredSubmissions, goToSlide])

  const showPrevButton = currentIndex !== 0
  const showNextButton =
    filteredSubmissions.length > 0 &&
    currentIndex < filteredSubmissions.length - 1

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
        <Flex className="slides" ref={sliderRef}>
          {filteredSubmissions?.map((submission, key) => (
            <Slide
              submission={submission}
              openInEditor={openInEditor}
              handleOnBookmarkClick={handleOnBookmarkClick}
              key={key}
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
      ) : null}
    </Flex>
  )
}
