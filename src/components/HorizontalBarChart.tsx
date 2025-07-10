import { Flex, Select, Text, useToken, VStack } from "@chakra-ui/react"
import { indexOf } from "lodash"
import { useCallback, useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  LabelProps,
  ResponsiveContainer,
  XAxis,
  XAxisProps,
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

export const HorizontalBarChart: React.FC<{
  passRatePerTestCase: Record<string, number>
}> = ({ passRatePerTestCase }) => {
  const [sorting, setSorting] = useState<
    "default" | "ascending" | "descending"
  >("default")

  const data = Object.entries(passRatePerTestCase).map(([name, value]) => ({
    name,
    value: value * 100,
  }))

  const [selectedTests, setSelectedTests] = useState<string[]>([])
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    // TODO: type this properly
    setSorting(event.target.value as "default" | "ascending" | "descending")
  }

  const handleOnBarClick = useCallback((name: string) => {
    setSelectedTests((oldSelectedTest) => {
      if (oldSelectedTest.includes(name)) {
        return oldSelectedTest.filter((testName) => testName !== name)
      }
      return [...oldSelectedTest, name]
    })
  }, [])

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
    return sortedData.map((entry) => (
      <Cell
        key={`cell-${entry.name}`}
        fill={
          selectedTests.includes(entry.name) ? selectedColor : unselectedColor
        }
        onClick={() => handleOnBarClick(entry.name)}
      />
    ))
  }, [
    sortedData,
    selectedTests,
    selectedColor,
    unselectedColor,
    handleOnBarClick,
  ])

  return (
    <VStack height={"100%"}>
      <Flex
        width={"100%"}
        justifyContent={"space-between"}
        align={"center"}
        pt={2}
        height={"5%"}
      >
        <Text> Sorted by: </Text>
        <Select maxW={150} onChange={handleChange} value={sorting} size={"md"}>
          <option value={"default"}>Default</option>
          <option value={"ascending"}>Ascending</option>
          <option value={"descending"}>Descending</option>
        </Select>
      </Flex>
      <ResponsiveContainer width="100%" height="95%">
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
          barSize={BAR_HEIGHT}
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
    </VStack>
  )
}
