import { Flex, Select, Text, useToken, VStack } from "@chakra-ui/react"
import { useMemo, useState } from "react"
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

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    // TODO: type this properly
    setSorting(event.target.value as "default" | "ascending" | "descending")
  }

  const sortedData = useMemo(() => {
    if (sorting === "ascending") {
      return [...data].sort((a, b) => a.value - b.value)
    } else if (sorting === "descending") {
      return [...data].sort((a, b) => b.value - a.value)
    }
    return data
  }, [data, sorting])

  const [chakraColor] = useToken("colors", ["purple.500"])
  console.log("chakraColor", chakraColor)
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
        <Select maxW={150} onChange={handleChange} value={sorting}>
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
          <XAxis type="number" domain={[0, 100]} tick={{ fill: "#666" }} />
          <YAxis type="category" dataKey="name" hide={true} />
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <Bar dataKey="value" radius={[6, 6, 6, 6]}>
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={chakraColor} />
            ))}
            <LabelList dataKey="name" content={CustomNameLabel} />
            <LabelList dataKey="value" content={CustomValueLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </VStack>
  )
}
