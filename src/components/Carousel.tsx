import { Button, Flex } from "@chakra-ui/react"
import "./Carousel.css"

import React, { useEffect, useRef, useState } from "react"

export const Carousel = () => {
  const sliderRef = useRef<HTMLDivElement | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const slideCount = 3 // Or dynamically set this from children.length
  const slideWidth = sliderRef.current?.offsetWidth || 0

  // Scroll event listener to update current index
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
    <Flex position={"relative"} display={"flex"}>
      <div className="slider">
        <div className="slides" ref={sliderRef}>
          <div>Slide 1</div>
          <div>Slide 2</div>
          <div>Slide 3</div>
          {/* Add more slides as needed */}
        </div>
      </div>
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
