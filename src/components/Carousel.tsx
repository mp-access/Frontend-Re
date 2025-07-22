import { Button, Divider, Flex, Heading } from "@chakra-ui/react"
import "./Carousel.css"

import React, { useEffect, useRef, useState } from "react"
import { Editor } from "@monaco-editor/react"
const code = `
import math

class Circle:
    def __init__(self, radius):
        self.radius = radius

    def area(self):
        return math.pi * self.radius ** 2

    def scale(self, factor):
        self.radius *= factor


    def __repr__(self):
        return f"Circle({self.radius})"`

const codeLong = `
import math

class Circle:
    def __init__(self, radius):
        self.radius = radius

    def area(self):
        return math.pi * self.radius ** 2

    def scale(self, factor):
        self.radius *= factor

    def __str__(self):
        return f"A circle with radius {self.radius}"

    def __repr__(self):
        return f"Circle({self.radius})"

class Square:
    pass

class Rect:
    pass

# when you've implemented all three, this function should work:
def do():
    shapes = [Square(10), Square(5), Rect(5, 100), Circle(25)]
    print([shape.area() for shape in shapes])
    print([type(shape) for shape in shapes])
    for shape in shapes:
        shape.scale(3)
    print(shapes)            # uses __repr__
    for shape in shapes:
        print(shape)         # uses __str__

# uncomment to try the function:
#do()
`

const Slide = () => {
  return (
    <Flex direction={"column"} p={4}>
      <Heading fontSize="lg">{"{Student Username}"}</Heading>
      <Divider />
      <Editor
        defaultValue={code}
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
