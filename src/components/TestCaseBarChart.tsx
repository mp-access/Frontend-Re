import { Box, Button, Flex, HStack, Text, VStack } from "@chakra-ui/react"
import React, { SetStateAction, useCallback, useMemo, useState } from "react"
import { FiCheckCircle, FiXCircle } from "react-icons/fi"
import { PiCrosshairSimpleFill, PiCrosshairSimpleLight } from "react-icons/pi"
import { TbSpy, TbSpyOff } from "react-icons/tb"

const CustomBar: React.FC<{
  name: string
  value: number
  testCaseSelection: Record<string, boolean> | null
  failedForCurrentImplementation: boolean | null
  handleOnBarClick: (name: string) => void
}> = ({
  name,
  value,
  testCaseSelection,
  failedForCurrentImplementation,
  handleOnBarClick,
}) => {
  const selectedColor = "purple.500"
  const unselectedColor = "purple.200"

  if (!testCaseSelection) {
    return null
  }

  return (
    <HStack
      justify={"start"}
      width={"100%"}
      onClick={() => handleOnBarClick(name)}
      position={"relative"}
      background={"gray.100"}
      borderRadius={"lg"}
      cursor={"pointer"}
      _hover={{ background: "gray.200" }}
    >
      <Text justifyContent={"center"} pl={2} position={"absolute"} zIndex={1}>
        {name}
      </Text>
      <Flex position={"absolute"} right={2} zIndex={1} align={"center"} gap={2}>
        <Text>{value.toFixed()}%</Text>
        {failedForCurrentImplementation !== null ? (
          <Box
            height={2}
            width={2}
            borderRadius={"full"}
            background={
              failedForCurrentImplementation ? "red.500" : "green.500"
            }
          />
        ) : null}
      </Flex>
      <Flex
        flex={Math.max(value, 1)}
        height={10}
        borderRadius={"lg"}
        align={"center"}
        background={testCaseSelection[name] ? selectedColor : unselectedColor}
        position={"relative"}
      />
      {value < 100 && <Flex flex={100 - Math.max(value, 1)} />}
    </HStack>
  )
}

type BarChartData = {
  name: string
  value: number
}

const CustomBarChart: React.FC<{
  data: BarChartData[]
  showPassRate: boolean
  testCaseSelection: Record<string, boolean> | null
  namedTestsPassedCurrentSubmission: Record<string, boolean> | null
  handleOnBarClick: (name: string) => void
}> = ({
  data,
  showPassRate,
  testCaseSelection,
  namedTestsPassedCurrentSubmission,
  handleOnBarClick,
}) => {
  return (
    <VStack width={"full"} overflow={"auto"} align={"space-around"} gap={3}>
      {data.map((entry, i) => (
        <CustomBar
          name={entry.name}
          value={showPassRate ? entry.value : 100 - entry.value}
          testCaseSelection={testCaseSelection}
          handleOnBarClick={handleOnBarClick}
          failedForCurrentImplementation={
            namedTestsPassedCurrentSubmission
              ? !namedTestsPassedCurrentSubmission[entry.name]
              : null
          }
          key={i}
        />
      ))}
    </VStack>
  )
}

export const TestCaseBarChart: React.FC<{
  passRatePerTestCase: Record<string, number>
  exactMatch: boolean
  hideStudentInfo: boolean
  testCaseSelection: Record<string, boolean> | null
  namedTestsPassedCurrentSubmission: Record<string, boolean> | null

  setTestCaseSelection: React.Dispatch<
    SetStateAction<Record<string, boolean> | null>
  >
  setExactMatch: React.Dispatch<SetStateAction<boolean>>
  setHideStudentInfo: React.Dispatch<SetStateAction<boolean>>
}> = ({
  passRatePerTestCase,
  exactMatch,
  hideStudentInfo,
  testCaseSelection,
  namedTestsPassedCurrentSubmission,
  setTestCaseSelection,
  setExactMatch,
  setHideStudentInfo,
}) => {
  const [showPassRate, setShowPassRate] = useState(true)

  const data = useMemo(() => {
    return Object.entries(passRatePerTestCase).map(([name, value]) => ({
      name,
      value: value * 100,
    }))
  }, [passRatePerTestCase])

  const handleOnBarClick = useCallback(
    (name: string) => {
      setTestCaseSelection((prev) => {
        if (!prev) return null
        return {
          ...prev,
          [name]: !prev[name],
        }
      })
    },
    [setTestCaseSelection],
  )

  const handleWorstSolutionClick = useCallback(() => {
    if (!testCaseSelection) return

    setTestCaseSelection(
      Object.fromEntries(
        Object.keys(testCaseSelection).map((key) => [key, true]),
      ),
    )
  }, [setTestCaseSelection, testCaseSelection])

  const handlePerfectSolutionClick = useCallback(() => {
    if (!testCaseSelection) return

    setExactMatch(true)
    setTestCaseSelection(
      Object.fromEntries(
        Object.keys(testCaseSelection).map((key) => [key, false]),
      ),
    )
  }, [setExactMatch, setTestCaseSelection, testCaseSelection])

  return (
    <VStack display={"flex"} width={"full"} p={0} flex={1}>
      <Flex
        width={"100%"}
        height={10}
        justifyContent={"space-between"}
        align={"center"}
        gap={4}
      >
        <Button
          flex={1}
          height={"full"}
          borderRadius={"md"}
          fontSize={"sm"}
          colorScheme={showPassRate ? "green" : "red"}
          backgroundColor={showPassRate ? "green.500" : "red.600"}
          onClick={() => setShowPassRate((prev) => !prev)}
        >
          {showPassRate ? <FiCheckCircle size={20} /> : <FiXCircle size={20} />}
        </Button>

        <Button
          flex={1}
          height={"full"}
          borderRadius={"md"}
          fontSize={"sm"}
          backgroundColor={"purple.500"}
          onClick={() => setExactMatch((prev) => !prev)}
        >
          {exactMatch ? (
            <PiCrosshairSimpleFill size={24} />
          ) : (
            <PiCrosshairSimpleLight size={24} />
          )}
        </Button>

        <Button
          flex={1}
          height={"full"}
          borderRadius={"md"}
          fontSize={"sm"}
          colorScheme={"gray"}
          backgroundColor={"gray.500"}
          onClick={() => setHideStudentInfo((prev) => !prev)}
        >
          {hideStudentInfo ? <TbSpy size={20} /> : <TbSpyOff size={20} />}
        </Button>

        <Button
          flex={1}
          height={"full"}
          borderRadius={"md"}
          fontSize={"sm"}
          colorScheme={"red"}
          backgroundColor={"red.600"}
          onClick={handleWorstSolutionClick}
        >
          0%
        </Button>

        <Button
          flex={1}
          height={"full"}
          borderRadius={"md"}
          fontSize={"sm"}
          colorScheme={"green"}
          backgroundColor={"green.500"}
          onClick={handlePerfectSolutionClick}
        >
          100%
        </Button>
      </Flex>

      <Box flex={1} minH={0} overflowY="auto" width={"full"}>
        <CustomBarChart
          data={data}
          showPassRate={showPassRate}
          testCaseSelection={testCaseSelection}
          handleOnBarClick={handleOnBarClick}
          namedTestsPassedCurrentSubmission={namedTestsPassedCurrentSubmission}
        />
      </Box>
    </VStack>
  )
}
