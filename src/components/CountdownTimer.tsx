import { CircularProgress, CircularProgressLabel } from "@chakra-ui/react"
import { useCountdown } from "./Hooks"
import { formatSeconds } from "./Util"

export const CountdownTimer: React.FC<{
  startTime: number
  endTime: number
}> = ({ startTime, endTime }) => {
  const { timeLeftInSeconds } = useCountdown(startTime, endTime)
  const totalTimeInSeconds = (endTime - startTime) / 1000
  const remainingTimeString = formatSeconds(timeLeftInSeconds)

  return (
    <CircularProgress
      size={175}
      value={(timeLeftInSeconds / totalTimeInSeconds) * 100}
      color="green.500"
    >
      <CircularProgressLabel>{remainingTimeString}</CircularProgressLabel>
    </CircularProgress>
  )
}
