import { CircularProgress, CircularProgressLabel } from "@chakra-ui/react"
import { useCountdown } from "./Hooks"
import { formatSeconds } from "./Util"
import { useCallback, useMemo } from "react"

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
}> = ({ startTime, endTime, size }) => {
  const { timeLeftInSeconds } = useCountdown(startTime ?? 0, endTime ?? 0)
  const totalTimeInSeconds = ((endTime ?? 0) - (startTime ?? 0)) / 1000
  const remainingTimeString = formatSeconds(timeLeftInSeconds)

  const circleValue = useMemo(() => {
    if (totalTimeInSeconds <= 0) {
      return 0
    }
    return (timeLeftInSeconds / totalTimeInSeconds) * 100
  }, [timeLeftInSeconds, totalTimeInSeconds])

  const dynamicColor = useMemo(() => {
    if (timeLeftInSeconds > totalTimeInSeconds / 3) {
      return "green.500"
    }
    if (timeLeftInSeconds > totalTimeInSeconds / 10) {
      return "yellow.500"
    }

    return "red.500"
  }, [timeLeftInSeconds, totalTimeInSeconds])

  return (
    <CircularProgress
      size={sizeMap[size]}
      value={circleValue}
      color={dynamicColor}
    >
      <CircularProgressLabel>{remainingTimeString}</CircularProgressLabel>
    </CircularProgress>
  )
}
