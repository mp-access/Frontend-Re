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
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react"
import { t } from "i18next"
import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { FcAlarmClock, FcDocument } from "react-icons/fc"
import { useNavigate, useOutletContext, useParams } from "react-router-dom"
import {
  Bar,
  BarChart,
  Label,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"
import { CountdownTimer } from "../components/CountdownTimer"
import {
  useCountdown,
  useExample,
  useExamplePointDistribution,
  useGeneralExampleInformation,
  useSSE,
  useTimeframeFromSSE,
} from "../components/Hooks"
import { Markdown, Placeholder } from "../components/Panels"

const PointsHistogram: React.FC<{
  data: PointDistribution | undefined
  isFetching: boolean
}> = ({ data, isFetching }) => {
  const mappedPointDistribution = useMemo(() => {
    if (!data || !Array.isArray(data.pointDistribution)) return []

    const total = data.pointDistribution.reduce(
      (sum, curr) => sum + curr.numberOfSubmissions,
      0,
    )

    return data.pointDistribution.map((elem, idx) => {
      const isLast = idx === data.pointDistribution.length - 1
      const count = elem.numberOfSubmissions
      const percentage = total > 0 ? ((count / total) * 100).toFixed(0) : "0"
      return {
        bin: !isLast
          ? `[${elem.lowerBoundary}-${elem.upperBoundary})`
          : `[${elem.lowerBoundary}-${elem.upperBoundary}]`,
        count,
        percentage,
      }
    })
  }, [data])

  if (isFetching) {
    return (
      <VStack w={"full"} h={"full"} justify={"center"} align={"center"}>
        <Text> Waiting for the evalutation to finalize...</Text>
        <Spinner speed="1s" />
      </VStack>
    )
  }
  return (
    <ResponsiveContainer width="100%">
      <BarChart
        data={mappedPointDistribution}
        margin={{ left: 4, top: 50, bottom: 8 }}
      >
        <XAxis dataKey="bin">
          <Label
            value={"Points"}
            position={"insideBottom"}
            offset={-8}
            fontSize={18}
          />
        </XAxis>
        <YAxis>
          <Label
            value={"Submissions"}
            position={"insideLeft"}
            angle={-90}
            fontSize={18}
            dy={55}
          />
        </YAxis>

        <Bar dataKey="count" fill="#8884d8">
          <LabelList
            dataKey="percentage"
            position="top"
            fill="black"
            fontSize={18}
            formatter={(val: string) => `${val}%`}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function PublicDashboard() {
  const { user } = useOutletContext<UserContext>()
  const { data: example, refetch: refetchExample } = useExample(user.email)
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const currentLanguage = i18n.language
  const { timeFrameFromEvent } = useTimeframeFromSSE()
  const { exampleSlug } = useParams()
  const {
    data: initialExampleInformation,
    refetch: refetchInitialExampleInformation,
  } = useGeneralExampleInformation()
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

  const { timeLeftInSeconds } = useCountdown(derivedStartDate, derivedEndDate)
  const { data: pointsDistribution, isFetching: isFetchingDistrib } =
    useExamplePointDistribution({
      enabled: timeLeftInSeconds === 0,
    })
  const showHistogram = useMemo(() => {
    if (
      timeLeftInSeconds === null ||
      exampleInformation?.numberOfReceivedSubmissions == 0
    )
      return false
    return !timeLeftInSeconds
  }, [exampleInformation?.numberOfReceivedSubmissions, timeLeftInSeconds])

  useSSE<string>("inspect", (editorURL) => {
    if (!editorURL) {
      return
    }

    const splitUrl = editorURL.split("/")
    const idxOfExamples = splitUrl.indexOf("examples")
    const urlExampleSlug =
      idxOfExamples !== -1 ? splitUrl[idxOfExamples + 1] : null

    // only navigate if event comes from same example
    if (urlExampleSlug && urlExampleSlug === exampleSlug) {
      navigate(editorURL)
    }
  })

  useSSE<ExampleInformation>("example-information", (data) => {
    setExampleInformation(data)
  })

  useSSE<string>("example-reset", async () => {
    const refetchedInfo = await refetchInitialExampleInformation()
    if (refetchedInfo.data !== undefined) {
      setExampleInformation(refetchedInfo.data)
    }
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
        exampleInformation.numberOfReceivedSubmissions <= 0)
    ) {
      return 0
    }

    const { participantsOnline, numberOfReceivedSubmissions } =
      exampleInformation

    if (
      (participantsOnline <= 0 && numberOfReceivedSubmissions > 0) ||
      numberOfReceivedSubmissions >= participantsOnline
    ) {
      return 100
    } else {
      return (numberOfReceivedSubmissions / participantsOnline) * 100
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
        gap={2}
        rowStart={1}
        rowEnd={-1}
        colStart={1}
        colEnd={2}
        p={0}
        display={"flex"}
        flexDirection={"column"}
      >
        <Flex
          direction={"column"}
          layerStyle={"segment"}
          flex={1}
          m={0}
          overflow={"auto"}
        >
          <Heading fontSize="xl">{title}</Heading>
          <Divider />
          <Flex pt={2} direction={"column"}>
            <Markdown children={instructionsContent} />
          </Flex>
        </Flex>
        {showHistogram ? (
          <Flex flex={1} layerStyle={"segment"} direction={"column"}>
            <PointsHistogram
              data={pointsDistribution}
              isFetching={isFetchingDistrib}
            />
          </Flex>
        ) : null}
      </GridItem>
      <GridItem layerStyle={"segment"} p={3} maxHeight={450}>
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
      <GridItem layerStyle={"segment"} p={3} maxHeight={450}>
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
                {exampleInformation.numberOfReceivedSubmissions}/
                {Math.max(
                  exampleInformation.numberOfReceivedSubmissions,
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
