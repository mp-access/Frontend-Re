import { Button, Divider, Flex, Heading } from "@chakra-ui/react"
import "./Carousel.css"

import React, { useEffect, useRef, useState } from "react"
import { Markdown } from "./Panels"

const Slide = () => {
  return (
    <Flex direction={"column"} p={4}>
      <Heading fontSize="lg">{"{Student Username}"}</Heading>
      <Divider />
      <Markdown children={"Hello World"}></Markdown>
    </Flex>
  )
}

export const Carousel = () => {
  const sliderRef = useRef<HTMLDivElement | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const slideCount = 3 // Or dynamically set this from children.length

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
          <Slide />
          <Slide />
          <Slide />
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
