import { Button, Flex, Text, VStack } from "@chakra-ui/react"

const Bookmark: React.FC<{
  bookmark: Bookmark
  handleBookmarkSelection: (bookmark: Bookmark) => void
  color: string
}> = ({ bookmark, handleBookmarkSelection, color }) => {
  const nameOnly = bookmark.studentId.split("@")[0]
  const testsPassed = bookmark.testsPassed.reduce(
    (accumulator, currentVal) => (accumulator += currentVal),
  )
  return (
    <Button
      borderRadius={"lg"}
      h={10}
      width={"full"}
      colorScheme={color}
      bg={`${color}.500`}
      color={"white"}
      onClick={() => handleBookmarkSelection(bookmark)}
    >
      <Flex flex={1}>
        <Text flex={1} align={"start"}>
          {nameOnly}
        </Text>
        <Text flex={1} align={"start"}>
          Tests Passed: {testsPassed}/{bookmark.testsPassed.length}
        </Text>
      </Flex>
    </Button>
  )
}

export const BookmarkView: React.FC<{
  bookmarks: Bookmark[] | null
  getSubmissionColor: (submissionId: number) => string
  handleBookmarkSelection: (bookmark: Bookmark) => void
}> = ({ bookmarks, handleBookmarkSelection, getSubmissionColor }) => {
  if (!bookmarks)
    return (
      <Flex justify={"center"} flex={1}>
        <Text> There are no Bookmarks yet.</Text>
      </Flex>
    )

  return (
    <VStack width={"full"} align={"start"}>
      {bookmarks.map((bookmark, key) => (
        <Bookmark
          key={key}
          bookmark={bookmark}
          handleBookmarkSelection={handleBookmarkSelection}
          color={getSubmissionColor(bookmark.submissionId)}
        />
      ))}
    </VStack>
  )
}
