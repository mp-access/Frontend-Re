import {
  Button,
  Divider,
  Flex,
  Heading,
  HStack,
  Icon,
  Stack,
  Table,
  TableContainer,
  Tag,
  TagLabel,
  TagLeftIcon,
  Tbody,
  Td,
  Tr,
  VStack,
  Text,
} from "@chakra-ui/react"
import React from "react"
import { FcPlanner, FcTodoList } from "react-icons/fc"
import { Link, useOutletContext } from "react-router-dom"
import { HScores } from "../components/Statistics"
import { useTranslation } from "react-i18next"
import { useExamples } from "../components/Hooks"
import { fork } from "radash"
import { AiOutlineClockCircle } from "react-icons/ai"
import { TFunction } from "i18next"
import { IconType } from "react-icons/lib"

export const ExamplesCard: React.FC<{
  examples: TaskOverview[]
  currentLanguage: string
  isAssistant: boolean
  t: TFunction<"translation", undefined>
  icon: IconType | null
  title: string
}> = ({ examples, currentLanguage, isAssistant, t, icon, title }) => {
  if (!examples || examples.length === 0)
    return (
      <TableContainer layerStyle={"segment"}>
        <HStack>
          {icon ? <Icon as={icon} boxSize={6} /> : null}
          <Heading fontSize="2xl">{t(title)}</Heading>
        </HStack>
        <Divider borderColor="gray.300" my={4} />
        <Flex justify={"center"}>
          <Text>There are no {title.toLowerCase()} yet.</Text>
        </Flex>
      </TableContainer>
    )

  return (
    <TableContainer layerStyle="segment">
      <HStack>
        {icon ? <Icon as={icon} boxSize={6} /> : null}
        <Heading fontSize="2xl">{t(title)}</Heading>
      </HStack>
      <Divider borderColor="gray.300" my={4} />
      <Table>
        <Tbody>
          {/* change this to unpublishedExmaples later */}
          {examples
            .sort((a, b) => a.ordinalNum - b.ordinalNum)
            .map((example) => (
              <Tr key={example.id}>
                <Td p={0} whiteSpace="nowrap" fontSize="sm">
                  {example.ordinalNum}
                </Td>
                <Td>
                  <Heading fontSize="lg">
                    {example.information[currentLanguage]?.title ||
                      example.information["en"].title}
                  </Heading>
                </Td>
                <Td w="17em" maxW="17em">
                  <VStack>
                    <Tag bg="transparent">
                      <TagLeftIcon as={AiOutlineClockCircle} marginBottom={1} />
                      <TagLabel>{example.status}</TagLabel>
                    </Tag>
                  </VStack>
                </Td>
                <Td w="xs">
                  <HScores value={example.points} max={example.maxPoints} />
                </Td>
                <Td>
                  <HStack spacing={2} justify={"flex-end"}>
                    {isAssistant ? (
                      <>
                        <Button
                          as={Link}
                          to={`${example.slug}/private-dashboard`}
                        >
                          {t("Private Dashboard")}
                        </Button>
                        <Button
                          as={Link}
                          to={`${example.slug}/public-dashboard`}
                        >
                          {t("Public Dashboard")}
                        </Button>
                      </>
                    ) : null}

                    <Button as={Link} to={`${example.slug}`}>
                      {t("View")}
                    </Button>
                  </HStack>
                </Td>
              </Tr>
            ))}
        </Tbody>
      </Table>
    </TableContainer>
  )
}

export default function Examples() {
  const { i18n, t } = useTranslation()
  const currentLanguage = i18n.language
  const { isAssistant } = useOutletContext<UserContext>()
  const { data: examples } = useExamples() //  TODO: only get TaskOverview, not TaskProps, once related backend problem is fixed

  if (!examples) return <></>

  const [unpublishedExaples, publishedExamples] = fork(
    examples,
    (example) => example.status === "Planned",
  )

  if (!isAssistant) {
    return (
      <Stack layerStyle="container" spacing={4}>
        <ExamplesCard
          examples={publishedExamples}
          currentLanguage={currentLanguage}
          isAssistant={isAssistant}
          t={t}
          icon={FcTodoList}
          title="Examples"
        />
      </Stack>
    )
  }
  return (
    <Stack layerStyle="container" spacing={4}>
      <ExamplesCard
        examples={unpublishedExaples}
        currentLanguage={currentLanguage}
        isAssistant={isAssistant}
        t={t}
        icon={FcPlanner}
        title="Planned Examples"
      />
      <ExamplesCard
        examples={publishedExamples}
        currentLanguage={currentLanguage}
        isAssistant={isAssistant}
        t={t}
        icon={FcTodoList}
        title="Published Examples"
      />
    </Stack>
  )
}
