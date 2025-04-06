import {
  Button,
  Flex,
  Heading,
  HStack,
  useRadioGroup,
  VStack,
  TagLeftIcon,
  Tag,
  TagLabel,
} from "@chakra-ui/react"
import { Markdown } from "../components/Panels"
import { RadioCard } from "../components/RadioCard"
import { BsFillCircleFill } from "react-icons/bs"

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
  const options = ["2min", "3min", "4min"] // replace with non-hardcoded values once object available

  const isOngoing = false

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: "duration",
    defaultValue: "3min", // use default default duration of example
    onChange: console.log,
  })

  const group = getRootProps()

  return (
    <Flex boxSize="full">
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
        {isOngoing ? (
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
            <div> ...</div>
          </VStack>
        ) : null}

        <VStack>
          <HStack
            w={"full"}
            padding={2}
            paddingRight={0}
            direction={"column"}
            justify={"end"}
          >
            <Tag color="green.600" bg="green.50">
              <TagLeftIcon as={BsFillCircleFill} boxSize={2} />
              <TagLabel>112/399 Active Users</TagLabel>
            </Tag>
            <Flex flex={1}></Flex>

            {/* TODO: factor this out into two components -> one for during example, one for before */}
            {isOngoing ? null : (
              <>
                <HStack {...group}>
                  {options.map((value) => {
                    const radio = getRadioProps({ value })
                    return (
                      <RadioCard key={value} {...radio}>
                        {value}
                      </RadioCard>
                    )
                  })}
                </HStack>
                <Button>Publish</Button>
              </>
            )}
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
