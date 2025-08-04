import { Button, Text, useToken, VStack } from "@chakra-ui/react"
import { useCallback } from "react"

const Bookmark: React.FC<{
  bookmark: Bookmark
  handleBookmarkSelection: (bookmark: Bookmark) => void
}> = ({ bookmark, handleBookmarkSelection }) => {
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
    <Button
      border={"1px solid black"}
      borderRadius={"lg"}
      h={10}
      width={"full"}
      background={getRandomColor()}
      onClick={() => handleBookmarkSelection(bookmark)}
    >
      <Text>{bookmark.studentId}</Text>
    </Button>
  )
}

export const BookmarkView: React.FC<{
  bookmarks: Bookmark[] | null
  handleBookmarkSelection: (bookmark: Bookmark) => void
}> = ({ bookmarks, handleBookmarkSelection }) => {
  if (!bookmarks) return null
  return (
    <VStack width={"full"} align={"start"}>
      {bookmarks.map((bookmark, key) => (
        <Bookmark
          key={key}
          bookmark={bookmark}
          handleBookmarkSelection={handleBookmarkSelection}
        ></Bookmark>
      ))}
    </VStack>
  )
}
