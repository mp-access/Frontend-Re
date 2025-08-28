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
  Text,
  Tr,
  useToast,
  VStack,
} from "@chakra-ui/react"
import { useQueryClient } from "@tanstack/react-query"
import { TFunction } from "i18next"
import { fork } from "radash"
import React, { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { AiOutlineGlobal, AiOutlineInfoCircle } from "react-icons/ai"
import { FcPlanner, FcTodoList } from "react-icons/fc"
import { GoChecklist } from "react-icons/go"
import { IconType } from "react-icons/lib"
import { Link, useOutletContext, useParams } from "react-router-dom"
import { useExamples, useSSE } from "../components/Hooks"
import { Placeholder } from "../components/Panels"
import { HScores } from "../components/Statistics"
import { formatDate } from "../components/Util"

export const ExamplesCard: React.FC<{
  examples: TaskOverview[]
  currentLanguage: string
  isAssistant: boolean
  t: TFunction<"translation", undefined>
  icon: IconType | null
  title: string
  published: boolean
}> = ({ examples, currentLanguage, isAssistant, t, icon, published }) => {
  const { courseSlug } = useParams()
  const title = published ? t("Published Examples") : t("Planned Examples")
  const queryClient = useQueryClient()
  const { isSupervisor } = useOutletContext<UserContext>()
  const [examplesWithSubmissionCount, setExamplesWithSubmissionCount] =
    useState<(TaskOverview & { submissionCount: number })[] | null>(null)
  useEffect(() => {
    if (!isSupervisor) {
      // nr of submissions fetchable by supervisor only
      return
    }

    const fetchNrOfSubmissions = async (exampleSlug: string) => {
      const queryKey = [
        "courses",
        courseSlug,
        "examples",
        exampleSlug,
        "information",
      ]

      const data = await queryClient.fetchQuery<ExampleInformation>({
        queryKey,
      })

      return data.numberOfReceivedSubmissions
    }

    const fetchAllSubmissionCounts = async () => {
      const extendedExamples = await Promise.all(
        examples.map(async (example) => {
          const submissionCount = await fetchNrOfSubmissions(example.slug)
          return { ...example, submissionCount }
        }),
      )
      setExamplesWithSubmissionCount(extendedExamples)
    }

    fetchAllSubmissionCounts()
  }, [courseSlug, examples, isSupervisor, queryClient])

  const derivedExamples = useMemo(() => {
    return (
      examplesWithSubmissionCount ??
      (examples as (TaskOverview & {
        submissionCount: number
      })[])
    )
  }, [examples, examplesWithSubmissionCount])

  if (!examples || examples.length === 0)
    return (
      <TableContainer layerStyle={"segment"}>
        <HStack>
          {icon ? <Icon as={icon} boxSize={6} /> : null}
          <Heading fontSize="2xl">{title}</Heading>
        </HStack>
        <Divider borderColor="gray.300" my={4} />
        <Flex justify={"center"}>
          <Text>There are no {title} yet.</Text>
        </Flex>
      </TableContainer>
    )

  return (
    <TableContainer layerStyle="segment">
      <HStack>
        {icon ? <Icon as={icon} boxSize={6} /> : null}
        <Heading fontSize="2xl">{title}</Heading>
      </HStack>
      <Divider borderColor="gray.300" my={4} />
      <Table>
        <Tbody>
          {derivedExamples
            .sort((a, b) => {
              if (a.start === null || b.start === null) {
                return a.ordinalNum - b.ordinalNum
              }
              return Date.parse(a.start) - Date.parse(b.start)
            })
            .map((example) => (
              <Tr key={example.id}>
                <Td>
                  <Heading fontSize="lg">
                    {example.information[currentLanguage]?.title ||
                      example.information["en"].title}
                  </Heading>
                </Td>
                {isAssistant ? (
                  <Td w="17em" maxW="17em">
                    <VStack>
                      {published ? (
                        <Tag bg="transparent">
                          <TagLeftIcon as={AiOutlineInfoCircle} />
                          <TagLabel>{example.status}</TagLabel>
                        </Tag>
                      ) : null}
                    </VStack>
                  </Td>
                ) : null}

                <Td>
                  {example.start ? (
                    <VStack>
                      <Tag bg="transparent">
                        <TagLeftIcon as={AiOutlineGlobal} />
                        <TagLabel>{formatDate(example.start)}</TagLabel>
                      </Tag>
                    </VStack>
                  ) : null}
                </Td>
                {!isAssistant ? (
                  <Td w="xs">
                    <HScores value={example.points} max={example.maxPoints} />
                  </Td>
                ) : published ? (
                  <Td w="17em" maxW="17em">
                    <Tag bg="transparent">
                      <TagLeftIcon as={GoChecklist} />
                      <TagLabel> {example?.submissionCount}</TagLabel>
                    </Tag>
                  </Td>
                ) : null}

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
  const toast = useToast()
  const currentLanguage = i18n.language
  const { isAssistant } = useOutletContext<UserContext>()
  const { data: examples, refetch, isLoading } = useExamples() //  TODO: only get TaskOverview, not TaskProps, once related backend problem is fixed

  useSSE<ExampleResetSsePayload>("example-reset", () => {
    refetch()
  })

  useSSE<string>("published", () => {
    refetch()
    toast({
      title: t("A new lecture example just has been published"),
      status: "info",
    })
  })

  useEffect(() => {
    // to ensure update of exmaple states when no manual termination was triggered
    const interval = setInterval(() => {
      refetch()
    }, 1000 * 10)

    return () => clearInterval(interval)
  }, [refetch])

  if (!examples || isLoading) return <Placeholder />

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
          published={true}
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
        published={false}
      />
      <ExamplesCard
        examples={publishedExamples}
        currentLanguage={currentLanguage}
        isAssistant={isAssistant}
        t={t}
        icon={FcTodoList}
        title="Published Examples"
        published={true}
      />
    </Stack>
  )
}
