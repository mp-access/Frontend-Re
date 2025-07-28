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
import { t } from "i18next"
import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { FcAlarmClock, FcDocument } from "react-icons/fc"
import { useNavigate, useOutletContext } from "react-router-dom"
import { CountdownTimer } from "../components/CountdownTimer"
import {
  useExample,
  useGeneralExampleInformation,
  useSSE,
  useTimeframeFromSSE,
} from "../components/Hooks"
import { Markdown, Placeholder } from "../components/Panels"

export function PublicDashboard() {
  const { user } = useOutletContext<UserContext>()
  const { data: example } = useExample(user.email)
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const currentLanguage = i18n.language
  const { timeFrameFromEvent } = useTimeframeFromSSE()
  const { data: initialExampleInformation } = useGeneralExampleInformation()
  const [exampleInformation, setExampleInformation] =
    useState<ExampleInformation | null>(null)
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

  useSSE<ExampleInformation>("example-information", (data) => {
    setExampleInformation(data)
  })

  useEffect(() => {
    if (initialExampleInformation) {
      setExampleInformation(initialExampleInformation)
    }
  }, [initialExampleInformation])

  const submissionsProgress = useMemo(() => {
    if (
      !example ||
      !exampleInformation ||
      (exampleInformation.participantsOnline <= 0 &&
        exampleInformation.numberOfStudentsWhoSubmitted <= 0)
    ) {
      return 0
    }

    const { participantsOnline, numberOfStudentsWhoSubmitted } =
      exampleInformation

    if (
      (participantsOnline <= 0 && numberOfStudentsWhoSubmitted > 0) ||
      numberOfStudentsWhoSubmitted >= participantsOnline
    ) {
      return 100
    } else {
      return numberOfStudentsWhoSubmitted / participantsOnline
    }
  }, [example, exampleInformation])

  if (!example || !exampleInformation) {
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
            variant="circular"
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
          <CircularProgress
            size={175}
            value={submissionsProgress}
            color={"green.500"}
          >
            <CircularProgressLabel fontFamily={"monospace"}>
              {Math.round(submissionsProgress)}%
              <CircularProgressLabel insetY={12} fontSize={16}>
                {exampleInformation.numberOfStudentsWhoSubmitted}/
                {Math.max(
                  exampleInformation.numberOfStudentsWhoSubmitted,
                  exampleInformation.participantsOnline,
                )}
                {/* if participants online not correctly updated, UI should not break */}
              </CircularProgressLabel>
            </CircularProgressLabel>
          </CircularProgress>
        </Flex>
      </GridItem>
    </Grid>
  )
}
