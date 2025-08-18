import {
  Box,
  Button,
  Flex,
  HStack,
  Select,
  Switch,
  Text,
  VStack,
} from "@chakra-ui/react"
import { t } from "i18next"
import React, { SetStateAction, useCallback, useMemo, useState } from "react"

const CustomBar: React.FC<{
  name: string
  value: number
  testCaseSelection: Record<string, boolean> | null
  handleOnBarClick: (name: string) => void
}> = ({ name, value, testCaseSelection, handleOnBarClick }) => {
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
      <Text position={"absolute"} right={2} zIndex={1}>
        {value.toFixed()}%
      </Text>
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
  testCaseSelection: Record<string, boolean> | null
  handleOnBarClick: (name: string) => void
}> = ({ data, testCaseSelection, handleOnBarClick }) => {
  return (
    <VStack width={"full"} overflow={"auto"} align={"space-around"} gap={3}>
      {data.map((entry, i) => (
        <CustomBar
          name={entry.name}
          value={entry.value}
          testCaseSelection={testCaseSelection}
          handleOnBarClick={handleOnBarClick}
          key={i}
        />
      ))}
    </VStack>
  )
}

type Sortings = "default" | "ascending" | "descending"

export const TestCaseBarChart: React.FC<{
  passRatePerTestCase: Record<string, number>
  exactMatch: boolean
  testCaseSelection: Record<string, boolean> | null
  setTestCaseSelection: React.Dispatch<
    SetStateAction<Record<string, boolean> | null>
  >
  setExactMatch: React.Dispatch<SetStateAction<boolean>>
}> = ({
  passRatePerTestCase,
  exactMatch,
  testCaseSelection,
  setTestCaseSelection,
  setExactMatch,
}) => {
  const [sorting, setSorting] = useState<Sortings>("default")

  const data = useMemo(() => {
    return Object.entries(passRatePerTestCase).map(([name, value]) => ({
      name,
      value: value * 100,
    }))
  }, [passRatePerTestCase])

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    // TODO: type this properly
    setSorting(event.target.value as "default" | "ascending" | "descending")
  }

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

  const handleToggle = () => {
    setExactMatch((prev) => !prev)
  }

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

  const sortedData = useMemo(() => {
    if (sorting === "ascending") {
      return [...data].sort((a, b) => a.value - b.value)
    } else if (sorting === "descending") {
      return [...data].sort((a, b) => b.value - a.value)
    }
    return data
  }, [data, sorting])

  return (
    <VStack display={"flex"} width={"full"} p={0} flex={1}>
      <Flex
        width={"100%"}
        justifyContent={"space-between"}
        align={"center"}
        p={1}
        pt={0}
      >
        <Select maxW={150} onChange={handleChange} value={sorting} size={"md"}>
          <option value={"default"}>{t("Default")}</option>
          <option value={"ascending"}>{t("Ascending")}</option>
          <option value={"descending"}>{t("Descending")}</option>
        </Select>
        <HStack>
          <Text> Exact Match</Text>
          <Switch
            size={"md"}
            colorScheme="purple"
            isChecked={exactMatch}
            onChange={handleToggle}
          />
        </HStack>
      </Flex>

      <Box flex={1} minH={0} overflowY="auto" width={"full"}>
        <CustomBarChart
          data={sortedData}
          testCaseSelection={testCaseSelection}
          handleOnBarClick={handleOnBarClick}
        />
      </Box>

      <HStack justify={"space-between"} w={"full"} display={"flex"}>
        <Button borderRadius={"lg"} onClick={handleWorstSolutionClick}>
          Select Fail All
        </Button>
        <Button borderRadius={"lg"} onClick={handlePerfectSolutionClick}>
          Select Pass All
        </Button>
      </HStack>
    </VStack>
  )
}
