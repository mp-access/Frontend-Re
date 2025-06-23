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
import { Markdown } from "../components/Panels"
import { FcAlarmClock, FcDocument } from "react-icons/fc"
import { t } from "i18next"
import { useOutletContext } from "react-router-dom"
import { useExample } from "../components/Hooks"
import { useTranslation } from "react-i18next"

export function PublicDashboard() {
  const { user } = useOutletContext<UserContext>()
  const { data: example } = useExample(user.email)
  const { i18n } = useTranslation()

  const currentLanguage = i18n.language
  const instructionFile =
    example?.information[currentLanguage]?.instructionsFile ||
    example?.information["en"].instructionsFile
  const instructionsContent = example?.files.filter(
    (file) => file.path === `/${instructionFile}`,
  )[0]?.template
  const title =
    example?.information[currentLanguage]?.title ||
    example?.information["en"]?.title

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
        <Markdown children={instructionsContent ?? "Placeholder"}></Markdown>
      </GridItem>
      <GridItem layerStyle={"card"} p={3} maxHeight={450}>
        <HStack>
          <Icon as={FcAlarmClock} boxSize={6} />
          <Heading fontSize="xl">{t("Remaining Time")}</Heading>
        </HStack>
        <Divider />
        <Spacer height={1} />
        <Flex justify={"center"} align={"center"} flex={1} h={"100%"}>
          <CircularProgress size={175} value={80} color="green.500">
            <CircularProgressLabel>2:30</CircularProgressLabel>
          </CircularProgress>
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
