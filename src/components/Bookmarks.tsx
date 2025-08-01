import { HStack, Text, useToken, VStack } from "@chakra-ui/react"
import { useCallback } from "react"

const Bookmark: React.FC<{ bookmark: Bookmark }> = ({ bookmark }) => {
  const colors = [
    useToken("colors", "purple.300"),
    useToken("colors", "yellow.300"),
    useToken("colors", "teal.300"),
  ]

  const finalColors = colors

  // just for the time being until we have actual categories with colors
  const getRandomColor = useCallback(() => {
    const len = colors.length
    const index = Math.floor(Math.random() * len)
    return finalColors[index]
  }, [colors.length, finalColors])

  return (
    <HStack
      layerStyle={"segment"}
      border={"1px solid black"}
      borderRadius={"lg"}
      h={10}
      width={"full"}
      background={getRandomColor()}
    >
      <Text>{bookmark.studentId}</Text>
    </HStack>
  )
}

export const Bookmarks: React.FC<{ bookmarks: Bookmark[] | null }> = ({
  bookmarks,
}) => {
  if (!bookmarks) return null
  return (
    <VStack width={"full"} align={"start"}>
      {bookmarks.map((bookmark, key) => (
        <Bookmark key={key} bookmark={bookmark}></Bookmark>
      ))}
    </VStack>
  )
}
