import { Button, Divider, Flex, Heading, HStack, Text } from "@chakra-ui/react"
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

const Slide: React.FC<{
  submission: SubmissionSsePayload
  openInEditor: (studentId: string) => Promise<void>
}> = ({ submission, openInEditor }) => {
  return (
    <Flex direction={"column"} p={2}>
      <HStack justify={"space-between"} pl={2} pr={2}>
        <Heading fontSize="lg">
          {submission.studentId} SubmissionId{submission.submissionId}
        </Heading>
        <Text>Points: {submission.points}</Text>
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
  openInEditor: (studentId: string) => Promise<void>
}> = ({ submissions, testCaseSelection, exactMatch, openInEditor }) => {
  const sliderRef = useRef<HTMLDivElement | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [lastDisplayedSubmissionId, setLastDisplayedSubmissionId] = useState<
    number | null
  >(null)
  const slideCount = submissions ? submissions?.length : 0

  const filteredSubmissions = useMemo(() => {
    return getFilteredSubmissions(testCaseSelection, submissions, exactMatch)
  }, [exactMatch, testCaseSelection, submissions])

  useEffect(() => {
    const slider = sliderRef.current
    if (!slider) return
    const handleScroll = () => {
      const index = Math.round(slider.scrollLeft / slider.offsetWidth)
      setCurrentIndex(index)
    }

    slider.addEventListener("scroll", handleScroll)
    return () => slider.removeEventListener("scroll", handleScroll)
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
          {filteredSubmissions?.map((submission) => (
            <Slide submission={submission} openInEditor={openInEditor}></Slide>
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
