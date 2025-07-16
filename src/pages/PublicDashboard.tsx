import {
  CircularProgress,
  CircularProgressLabel,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Spacer,
} from "@chakra-ui/react"
import { Markdown, Placeholder } from "../components/Panels"
import { FcAlarmClock, FcDocument } from "react-icons/fc"
import { t } from "i18next"
import { useNavigate, useOutletContext } from "react-router-dom"
import { useExample, useSSE, useTimeframeFromSSE } from "../components/Hooks"
import { useTranslation } from "react-i18next"
import { CountdownTimer } from "../components/CountdownTimer"
import { useMemo } from "react"

export function PublicDashboard() {
  const { user } = useOutletContext<UserContext>()
  const { data: example } = useExample(user.email)
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const currentLanguage = i18n.language
  const { timeFrameFromEvent } = useTimeframeFromSSE()
  const [derivedStartDate, derivedEndDate] = useMemo(() => {
    if (!example) {
      return [null, null]
    }

    if (timeFrameFromEvent) {
      return timeFrameFromEvent
    }

    if (!example.start || !example.end) {
      return [null, null]
    }

    return [Date.parse(example.start), Date.parse(example.end)]
  }, [example, timeFrameFromEvent])

  useSSE<string>("inspect", (editorURL) => {
    if (!editorURL) {
      return
    }

    navigate(editorURL)
  })

  if (!example) {
    return <Placeholder />
  }
  const instructionFile =
    example.information[currentLanguage]?.instructionsFile ||
    example.information["en"].instructionsFile
  const instructionsContent = example?.files.filter(
    (file) => file.path === `/${instructionFile}`,
  )[0]?.template
  const title =
    example.information[currentLanguage]?.title ||
    example.information["en"]?.title

  return (
    <Grid
      layerStyle={"container"}
      templateColumns="2fr  1fr"
      templateRows={"1fr 1fr"}
      gap={2}
      h={"full"}
      maxH={900}
    >
      <GridItem
        layerStyle={"card"}
        gap={4}
        rowStart={1}
        rowEnd={-1}
        colStart={1}
        colEnd={2}
        p={3}
      >
        <Heading fontSize="xl">{title}</Heading>
        <Divider />
        <Spacer height={1} />
        <Markdown children={instructionsContent}></Markdown>
      </GridItem>
      <GridItem layerStyle={"card"} p={3} maxHeight={450}>
        <HStack>
          <Icon as={FcAlarmClock} boxSize={6} />
          <Heading fontSize="xl">{t("Remaining Time")}</Heading>
        </HStack>
        <Divider />
        <Spacer height={1} />
        <Flex justify={"center"} align={"center"} flex={1} h={"100%"}>
          <CountdownTimer
            startTime={derivedStartDate}
            endTime={derivedEndDate}
            size="large"
          />
        </Flex>
      </GridItem>
      <GridItem layerStyle={"card"} p={3} maxHeight={450}>
        <HStack>
          <Icon as={FcDocument} boxSize={6} />
          <Heading fontSize="xl">{t("Submissions")}</Heading>
        </HStack>
        <Divider />
        <Spacer height={1} />
        <Flex justify={"center"} align={"center"} flex={1} h={"100%"}>
          <CircularProgress size={175} value={75} color={"green.500"}>
            <CircularProgressLabel>
              75%
              <CircularProgressLabel insetY={12} fontSize={12}>
                150/200
              </CircularProgressLabel>
            </CircularProgressLabel>
          </CircularProgress>
        </Flex>
      </GridItem>
    </Grid>
  )
}
