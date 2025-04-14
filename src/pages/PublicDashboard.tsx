import {
  CircularProgress,
  CircularProgressLabel,
  Container,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Spacer,
} from "@chakra-ui/react"
import { Markdown } from "../components/Panels"
import { FcAlarmClock, FcDocument } from "react-icons/fc"

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

export function PublicDashboard() {
  return (
    <Grid
      layerStyle={"container"}
      templateColumns="2fr  1fr"
      templateRows={"1fr 1fr"}
      gap={2}
      h={"full"}
    >
      <GridItem
        layerStyle={"card"}
        gap={4}
        rowStart={1}
        rowEnd={-1}
        colStart={1}
        colEnd={2}
        p={3}
      >
        <Heading fontSize="xl">Some Title</Heading>
        <Divider />
        <Spacer height={1} />
        <Markdown children={someExampleMarkdownTaskDescription}></Markdown>
      </GridItem>
      <GridItem layerStyle={"card"} p={3}>
        <HStack>
          <Icon as={FcAlarmClock} boxSize={6} />
          <Heading fontSize="xl">Remaining Time</Heading>
        </HStack>
        <Divider />
        <Spacer height={1} />
        <Flex justify={"center"} align={"center"} flex={1} h={"100%"}>
          <CircularProgress size={175} value={80} color="green.500">
            <CircularProgressLabel>2:30</CircularProgressLabel>
          </CircularProgress>
        </Flex>
      </GridItem>
      <GridItem layerStyle={"card"} p={3}>
        <HStack>
          <Icon as={FcDocument} boxSize={6} />
          <Heading fontSize="xl">Submissions</Heading>
        </HStack>
        <Divider />
        <Spacer height={1} />
        <Flex justify={"center"} align={"center"} flex={1} h={"100%"}>
          <CircularProgress size={175} value={75} color={"green.500"}>
            <CircularProgressLabel>
              75%
              <CircularProgressLabel insetY={12} fontSize={12}>
                150/200
              </CircularProgressLabel>
            </CircularProgressLabel>
          </CircularProgress>
        </Flex>
      </GridItem>
    </Grid>
  )
}
