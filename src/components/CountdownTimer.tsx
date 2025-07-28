import { CircularProgress, CircularProgressLabel, Text } from "@chakra-ui/react"
import { useEffect, useMemo } from "react"
import { useCountdown } from "./Hooks"
import { formatSeconds } from "./Util"

const sizeMap = {
  small: 100,
  medium: 120,
  large: 175,
} as const

type SizeKey = keyof typeof sizeMap

export const CountdownTimer: React.FC<{
  startTime: number | null
  endTime: number | null
  size: SizeKey
  onTimeIsUp?: () => void
  variant: "circular" | "number-only"
}> = ({ startTime, endTime, size, onTimeIsUp, variant }) => {
  const { timeLeftInSeconds, circleValue } = useCountdown(startTime, endTime)

  useEffect(() => {
    if (
      onTimeIsUp &&
      startTime !== null &&
      endTime !== null &&
      timeLeftInSeconds == 0
    ) {
      onTimeIsUp()
    }
  }, [endTime, onTimeIsUp, startTime, timeLeftInSeconds])

  const totalTimeInSeconds = ((endTime ?? 0) - (startTime ?? 0)) / 1000
  const remainingTimeString = formatSeconds(timeLeftInSeconds ?? 0)
  const fontSize = size === "large" ? "4xl" : size === "medium" ? "3xl" : "md"
  const dynamicColor = useMemo(() => {
    if (timeLeftInSeconds === null) {
      return
    }
    if (timeLeftInSeconds > Math.min(totalTimeInSeconds / 3, 30)) {
      return "green.500"
    }
    if (timeLeftInSeconds > 10) {
      return "orange.200"
    }

    return "red.600"
  }, [timeLeftInSeconds, totalTimeInSeconds])

  if (variant == "number-only") {
    return (
      <Text fontSize={fontSize} fontFamily={"monospace"} color={dynamicColor}>
        {remainingTimeString}
      </Text>
    )
  }
  return (
    <CircularProgress
      size={sizeMap[size]}
      value={circleValue ?? 0}
      color={dynamicColor}
    >
      <CircularProgressLabel fontFamily={"monospace"} fontSize={fontSize}>
        {remainingTimeString}
      </CircularProgressLabel>
    </CircularProgress>
  )
}
