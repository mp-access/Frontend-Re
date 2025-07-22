import { Button, Divider, Flex, Heading } from "@chakra-ui/react"
import "./Carousel.css"

import React, { useEffect, useRef, useState } from "react"
import { Editor } from "@monaco-editor/react"

const Slide: React.FC<{ submission: SubmissionSsePayload }> = ({
  submission,
}) => {
  return (
    <Flex direction={"column"} p={4}>
      <Heading fontSize="lg">{submission.studentId}</Heading>
      <Divider />
      <Editor
        defaultValue={submission.content}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
        }}
        language="python"
      ></Editor>
    </Flex>
  )
}

export const SubmissionsCarousel: React.FC<{
  submissions: SubmissionSsePayload[] | null
}> = ({ submissions }) => {
  const sliderRef = useRef<HTMLDivElement | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const slideCount = submissions ? submissions?.length : 0

  useEffect(() => {
    const slider = sliderRef.current
    if (!slider) return

    const handleScroll = () => {
      const index = Math.round(slider.scrollLeft / slider.offsetWidth)
      setCurrentIndex(index)
    }

    slider.addEventListener("scroll", handleScroll)
    return () => slider.removeEventListener("scroll", handleScroll)
  }, [])

  // Scroll to a specific slide
  const goToSlide = (index: number) => {
    const slider = sliderRef.current
    if (slider) {
      const newIndex = Math.max(0, Math.min(index, slideCount - 1))
      slider.scrollTo({
        left: newIndex * slider.offsetWidth,
        behavior: "smooth",
      })
      setCurrentIndex(newIndex)
    }
  }

  return (
    // Animations in Carosel.css
    <Flex
      position={"relative"}
      display={"flex"}
      p={0}
      background={"transparent"}
      height={"full"}
    >
      <Flex className="slider" width={"full"} borderRadius={"2xl"}>
        <Flex className="slides" ref={sliderRef}>
          {submissions?.map((submission) => (
            <Slide submission={submission}></Slide>
          ))}
        </Flex>
      </Flex>
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
