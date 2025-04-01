import {
  Box,
  Button,
  Center,
  Divider,
  Flex,
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
import { Counter } from "../components/Buttons"
import { HScores } from "../components/Statistics"
import { useExample } from "../components/Hooks"
import { useTranslation } from "react-i18next"

export default function Examples() {
  const { i18n, t } = useTranslation()
  const currentLanguage = i18n.language
  const { isAssistant } = useOutletContext<UserContext>()
  const { data: example } = useExample() // replace this by useExample

  if (!example) return <></>

  return (
    <Stack layerStyle="container" spacing={4}>
      <Stack layerStyle="segment">
        <Flex justify="space-between">
          <Box>
            <Heading>
              {t("Lecture Examples") || example.information["en"].title}
            </Heading>
          </Box>
          <Center pr="1em">
            {/* {example.active && <TimeCountDown values={example.countDown} />} */}
          </Center>
        </Flex>
      </Stack>
      <TableContainer layerStyle="segment">
        <HStack>
          <Icon as={FcTodoList} boxSize={6} />
          <Heading fontSize="2xl">{t("Examples")}</Heading>
          <Counter>{example.tasks.length}</Counter>
        </HStack>
        <Divider borderColor="gray.300" my={4} />
        <Table>
          <Tbody>
            {example.tasks
              .sort((a, b) => a.ordinalNum - b.ordinalNum)
              .map((task) => (
                <Tr key={task.id}>
                  <Td p={0} whiteSpace="nowrap" fontSize="sm">
                    {task.ordinalNum}
                  </Td>
                  <Td>
                    <Heading fontSize="lg">
                      {task.information[currentLanguage]?.title ||
                        task.information["en"].title}
                    </Heading>
                  </Td>
                  {(example.active && (
                    <Td>
                      <SimpleGrid columns={5} gap={1} w="fit-content">
                        {range(Math.min(task.maxAttempts, 10)).map((i) => (
                          <Center
                            key={i}
                            rounded="full"
                            boxSize={5}
                            borderWidth={2}
                            borderColor="purple.500"
                            bg={
                              isAssistant || i < task.remainingAttempts
                                ? "purple.500"
                                : "transparent"
                            }
                          />
                        ))}
                      </SimpleGrid>
                      <Text fontSize="sm">
                        {t("Submissions left", {
                          count: isAssistant ? 99 : task.remainingAttempts,
                          max: task.maxAttempts,
                        })}
                      </Text>
                    </Td>
                  )) || <Td>{t("Submission Closed")}</Td>}
                  <Td w="xs">
                    <HScores value={task.points} max={task.maxPoints} />
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

                      <Button as={Link} to={`tasks/${task.slug}`}>
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
