import { Button, Divider, Flex, Heading, HStack, Text } from "@chakra-ui/react"
import { MdOutlineScreenShare } from "react-icons/md"
import "./Carousel.css"

import { Editor } from "@monaco-editor/react"
import React, {
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

const Slide: React.FC<{
  submission: SubmissionSsePayload
  categoryColor: string
  currentIndex: number
  totalSubmissions: number
  openInEditor: (studentId: string) => Promise<void>
}> = ({
  submission,
  currentIndex,
  totalSubmissions,
  categoryColor,
  openInEditor,
}) => {
  return (
    <Flex direction={"column"}>
      <HStack
        justify={"space-between"}
        px={3}
        py={2}
        bg={`${categoryColor}.200`}
      >
        <Heading fontSize="lg">
          {submission.studentId}{" "}
          <Text fontSize={"sm"} fontWeight={400} display={"inline"}>
            ({currentIndex + 1}/{totalSubmissions})
          </Text>
        </Heading>
        <Text>Points: {submission.points}</Text>
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

export const SubmissionsCarousel: React.FC<{
  submissions: SubmissionSsePayload[]
  openInEditor: (studentId: string) => Promise<void>
  getSubmissionColor: (submissionId: number) => string
}> = ({ submissions, openInEditor, getSubmissionColor }) => {
  const sliderRef = useRef<HTMLDivElement | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [lastDisplayedSubmissionId, setLastDisplayedSubmissionId] = useState<
    number | null
  >(null)
  const slideCount = useMemo(
    () => (submissions ? submissions?.length : 0),
    [submissions],
  )
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useLayoutEffect(() => {
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
  }, [submissions])

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
        setLastDisplayedSubmissionId(submissions[newIndex].submissionId)
      }
    },
    [slideCount, submissions],
  )
  useEffect(() => {
    if (!lastDisplayedSubmissionId) return

    const index = submissions.findIndex(
      (submission) => submission.submissionId === lastDisplayedSubmissionId,
    )
    if (index !== -1) {
      goToSlide(index, "instant")
    } else {
      setLastDisplayedSubmissionId(submissions[0]?.submissionId ?? null)
    }
  }, [lastDisplayedSubmissionId, goToSlide, submissions])

  const showPrevButton = currentIndex !== 0

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
          {submissions?.map((submission, i) => (
            <Slide
              submission={submission}
              categoryColor={getSubmissionColor(submission.submissionId)}
              currentIndex={i}
              totalSubmissions={submissions.length}
              openInEditor={openInEditor}
              key={submission.submissionId}
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
