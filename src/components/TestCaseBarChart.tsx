import {
  Button,
  Flex,
  HStack,
  Select,
  Switch,
  Text,
  useToken,
  VStack,
} from "@chakra-ui/react"
import { t } from "i18next"
import React, { SetStateAction, useCallback, useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  LabelProps,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"

const BAR_HEIGHT = 40

const CustomNameLabel = (props: LabelProps) => {
  const { x, y, value } = props

  if (typeof x !== "number" || typeof y !== "number") return null

  return (
    // must use html <text>, as recharts LabelList does not support custom rendering
    <text
      x={x + 8}
      y={y + BAR_HEIGHT / 2}
      dominantBaseline="middle"
      fill="#000"
      fontWeight="500"
      style={{ pointerEvents: "none", whiteSpace: "nowrap" }}
    >
      {value}
    </text>
  )
}

const CustomValueLabel = ({ x, y, width, value }: LabelProps) => {
  const estimateTextWidth = (text: string) => text.length * 20

  const label = `${Math.round(Number(value))}%`
  const padding = 16
  const estimatedTextWidth = estimateTextWidth(label)
  const shouldRender =
    typeof width === "number" && width > estimatedTextWidth + padding

  if (!shouldRender || typeof x !== "number" || typeof y !== "number")
    return null

  return (
    <text
      x={x + width - 8}
      y={y + BAR_HEIGHT / 2}
      dominantBaseline="middle"
      textAnchor="end"
      fill="white"
      fontWeight="bold"
      style={{ pointerEvents: "none", whiteSpace: "nowrap" }}
    >
      {label}
    </text>
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

  const data = Object.entries(passRatePerTestCase).map(([name, value]) => ({
    name,
    value: Math.max(value * 100, 1),
  }))

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

  const [selectedColor] = useToken("colors", ["purple.500"])
  const [unselectedColor] = useToken("colors", ["purple.200"])

  const barCells = useMemo(() => {
    if (!testCaseSelection) return
    return sortedData.map((entry) => (
      <Cell
        key={`cell-${entry.name}`}
        fill={testCaseSelection[entry.name] ? selectedColor : unselectedColor}
        onClick={() => handleOnBarClick(entry.name)}
      />
    ))
  }, [
    testCaseSelection,
    sortedData,
    selectedColor,
    unselectedColor,
    handleOnBarClick,
  ])

  return (
    <VStack display={"flex"} width={"full"} p={0}>
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

      <Flex flex={1} width={"100%"}>
        <ResponsiveContainer>
          <BarChart
            style={{
              width: "100%",
              height: "100%",
            }}
            data={sortedData}
            layout="vertical"
            barSize={BAR_HEIGHT}
            margin={{ top: 4, right: 14, left: 14, bottom: 0 }}
          >
            <XAxis type="number" domain={[0, 100]} interval={0} />
            <YAxis type="category" dataKey="name" hide={true} />
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <Bar dataKey="value" radius={[6, 6, 6, 6]} animationDuration={0}>
              {barCells}
              <LabelList dataKey="name" content={CustomNameLabel} />
              <LabelList dataKey="value" content={CustomValueLabel} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Flex>

      <HStack justify={"space-between"} w={"full"} display={"flex"}>
        <Button borderRadius={"lg"} onClick={handleWorstSolutionClick}>
          Failing All Tests
        </Button>
        <Button borderRadius={"lg"} onClick={handlePerfectSolutionClick}>
          Passing All Tests
        </Button>
      </HStack>
    </VStack>
  )
}
