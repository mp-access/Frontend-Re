import {
  Button,
  Center,
  Divider,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Tr,
} from "@chakra-ui/react"
import { range } from "lodash"
import React from "react"
import { FcTodoList } from "react-icons/fc"
import { Link, useOutletContext } from "react-router-dom"
import { HScores } from "../components/Statistics"
import { useTranslation } from "react-i18next"
import { useExamples } from "../components/Hooks"

export default function Examples() {
  const { i18n, t } = useTranslation()
  const currentLanguage = i18n.language
  const { isAssistant } = useOutletContext<UserContext>()
  const { data: examples } = useExamples() //  TODO: only get TaskOverview, not TaskProps, once related backend problem is fixed

  if (!examples) return <></>

  return (
    <Stack layerStyle="container" spacing={4}>
      <TableContainer layerStyle="segment">
        <HStack>
          <Icon as={FcTodoList} boxSize={6} />
          <Heading fontSize="2xl">{t("Examples")}</Heading>
        </HStack>
        <Divider borderColor="gray.300" my={4} />
        <Table>
          <Tbody>
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
                  {(example.active && (
                    <Td>
                      <SimpleGrid columns={5} gap={1} w="fit-content">
                        {range(Math.min(example.maxAttempts, 10)).map((i) => (
                          <Center
                            key={i}
                            rounded="full"
                            boxSize={5}
                            borderWidth={2}
                            borderColor="purple.500"
                            bg={
                              isAssistant || i < example.remainingAttempts
                                ? "purple.500"
                                : "transparent"
                            }
                          />
                        ))}
                      </SimpleGrid>
                      <Text fontSize="sm">
                        {t("Submissions left", {
                          count: isAssistant ? 99 : example.remainingAttempts,
                          max: example.maxAttempts,
                        })}
                      </Text>
                    </Td>
                  )) || <Td>{t("Submission Closed")}</Td>}
                  <Td w="xs">
                    <HScores value={example.points} max={example.maxPoints} />
                  </Td>
                  <Td>
                    <HStack spacing={2} justify={"flex-end"}>
                      {isAssistant ? (
                        <>
                          <Button
                            as={Link}
                            to={`example/${example.slug}/private-dashboard`}
                          >
                            {t("Private Dashboard")}
                          </Button>
                          <Button
                            as={Link}
                            to={`example/${example.slug}/public-dashboard`}
                          >
                            {t("Public Dashboard")}
                          </Button>
                        </>
                      ) : null}

                      <Button as={Link} to={`example/${example.slug}`}>
                        {t("View")}
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Stack>
  )
}
