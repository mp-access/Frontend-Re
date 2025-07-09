import { CircularProgress, CircularProgressLabel } from "@chakra-ui/react"
import { useCountdown } from "./Hooks"
import { formatSeconds } from "./Util"
import { useEffect, useMemo } from "react"

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
}> = ({ startTime, endTime, size, onTimeIsUp }) => {
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
  return (
    <CircularProgress
      size={sizeMap[size]}
      value={circleValue ?? 0}
      color={dynamicColor}
    >
      <CircularProgressLabel
        style={{
          fontVariantNumeric: "tabular-nums",
          fontFamily: "monospace",
        }}
        fontSize={size === "large" ? "3xl" : size === "medium" ? "2xl" : "md"}
      >
        {remainingTimeString}
      </CircularProgressLabel>
    </CircularProgress>
  )
}
