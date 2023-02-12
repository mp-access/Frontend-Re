import {
  Box, Button, Center, Divider, Flex, Heading, HStack, Icon, SimpleGrid, Stack, Table, TableContainer, Tag, TagLabel,
  TagLeftIcon, Tbody, Td, Text, Tr, Wrap
} from '@chakra-ui/react'
import { range } from 'lodash'
import React from 'react'
import { AiOutlineCalendar } from 'react-icons/ai'
import { FcTodoList } from 'react-icons/fc'
import { Link, useOutletContext } from 'react-router-dom'
import { Counter } from '../components/Buttons'
import { HScores, TimeCountDown } from '../components/Statistics'
import { useAssignment } from '../components/Hooks'

export default function Assignment() {
  const { isAssistant } = useOutletContext<UserContext>()
  const { data: assignment } = useAssignment()

  if (!assignment)
    return <></>

  return (
      <Stack layerStyle='container' spacing={4}>
        <Stack layerStyle='segment'>
          <Flex justify='space-between'>
            <Box>
              <Text>ASSIGNMENT {assignment.ordinalNum}</Text>
              <Heading>{assignment.title}</Heading>
              <Wrap my={2}>
                {!assignment.published && <Tag colorScheme='red'>Draft</Tag>}
                <Tag>{assignment.tasks.length} Tasks</Tag>
                <Tag>
                  <TagLeftIcon as={AiOutlineCalendar} />
                  <TagLabel>{assignment.duration}</TagLabel>
                </Tag>
                <Tag colorScheme={assignment.active ? 'green' : 'purple'}>
                  Submission {assignment.active ? 'Open' : 'Closed'}
                </Tag>
              </Wrap>
            </Box>
            {assignment.active && <TimeCountDown values={assignment.countDown} />}
          </Flex>
          <Text flexGrow={1} noOfLines={2} fontSize='sm'>{assignment.description}</Text>
        </Stack>
        <TableContainer layerStyle='segment'>
          <HStack>
            <Icon as={FcTodoList} boxSize={6} />
            <Heading fontSize='2xl'>Tasks</Heading>
            <Counter>{assignment.tasks.length}</Counter>
          </HStack>
          <Divider borderColor='gray.300' my={4} />
          <Table>
            <Tbody>
              {assignment.tasks.map(task =>
                  <Tr key={task.id}>
                    <Td p={0} whiteSpace='nowrap' fontSize='sm'>{task.ordinalNum}</Td>
                    <Td>
                      <Heading fontSize='lg'>{task.title}</Heading>
                    </Td>
                    <Td>
                      <SimpleGrid columns={5} gap={1} w='fit-content'>
                        {range(Math.min(task.maxAttempts, 10)).map(i =>
                            <Center key={i} rounded='full' boxSize={5} borderWidth={2} borderColor='purple.500'
                                    bg={(isAssistant || i < task.remainingAttempts) ? 'purple.500' : 'transparent'} />)}
                      </SimpleGrid>
                      <Text fontSize='sm'>
                        <b>{isAssistant ? '∞' : task.remainingAttempts}</b> {task.maxAttempts} Submissions left
                      </Text>
                    </Td>
                    <Td w='xs'>
                      <HScores value={task.points} max={task.maxPoints} avg={task.avgPoints} />
                    </Td>
                    <Td>
                      <Button w='full' colorScheme='green' as={Link} to={`tasks/${task.url}`}>
                        {task.points ? 'Continue' : 'Start'}
                      </Button>
                    </Td>
                  </Tr>)}
            </Tbody>
          </Table>
        </TableContainer>
      </Stack>
  )
}