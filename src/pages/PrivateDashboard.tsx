import {
  Button,
  ButtonGroup,
  Flex,
  Heading,
  HStack,
  VStack,
} from "@chakra-ui/react"
import { Markdown } from "../components/Panels"

const someExampleMarkdownTaskDescription = `Transform the following mathematical expression into a Python program to be able to calculate the
result for arbitrary values of a, b, c, and d defined in the source code:

\`a - (b^2 / (c - d * (a + b)))\`

Implement it in a function \`calculate\` where it should be returned.

Please make sure that your solution is self-contained within the \`calculate\` function. In other words, only change the body of the function, not the code outside the function.

Transform the following mathematical expression into a Python program to be able to calculate the
result for arbitrary values of a, b, c, and d defined in the source code:

\`a - (b^2 / (c - d * (a + b)))\`

Implement it in a function \`calculate\` where it should be returned.

Please make sure that your solution is self-contained within the \`calculate\` function. In other words, only change the body of the function, not the code outside the function.`

export function PrivateDashboard() {
  return (
    <Flex boxSize="full">
      <ButtonGroup
        layerStyle="float"
        pos="absolute"
        variant="ghost"
        top={2}
        right={210}
        isAttached
        zIndex={2}
      >
        <Button name="Publish" color="gray.600" isLoading={false}>
          Publish
        </Button>
      </ButtonGroup>

      <Flex
        w="full"
        pos="relative"
        overflow="hidden"
        bg="base"
        borderTopWidth={1}
        justifyContent={"space-between"}
        padding={10}
        gap={4}
      >
        <VStack
          overflow={"auto"}
          padding={4}
          border={"1px solid"}
          borderColor={"gray.200"}
          borderRadius={"md"}
          minW={"sm"}
          align={"start "}
        >
          <Heading fontSize="lg">Testcases</Heading>
          <div> Placeholder</div>
        </VStack>
        <VStack>
          <HStack w={"full"} padding={4} direction={"column"} justify={"end"}>
            <Button isLoading={false}>Publish</Button>
          </HStack>
          <Flex
            overflow={"auto"}
            border={"1px solid"}
            borderColor={"gray.200"}
            borderRadius={"md"}
            direction={"column"}
            p={"4"}
          >
            <Markdown children={someExampleMarkdownTaskDescription}></Markdown>
          </Flex>
        </VStack>
      </Flex>
    </Flex>
  )
}
