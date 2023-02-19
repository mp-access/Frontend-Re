import {
  Button, Center, Divider, Heading, HStack, Icon, Stack, Table, TableCaption, TableContainer, Tag, TagLabel,
  TagLeftIcon, Tbody, Td, Tr, VStack
} from '@chakra-ui/react'
import React from 'react'
import { AiOutlineCalendar, AiOutlineClockCircle } from 'react-icons/ai'
import { FcAlarmClock, FcLock, FcPlanner } from 'react-icons/fc'
import { Link } from 'react-router-dom'
import { ScoreBar, TimeCountDown } from '../components/Statistics'
import { fork } from 'radash'
import { useCourse } from '../components/Hooks'

export default function Assignments() {
  const { data: course } = useCourse()

  if (!course)
    return <></>

  const [publishedAssignments, upcomingAssignments] = fork(course.assignments, a => a.published)
  const [activeAssignments, pastAssignments] = fork(publishedAssignments, a => a.active)

  return (
      <Stack layerStyle='container' spacing={4}>
        {!!upcomingAssignments.length &&
          <TableContainer layerStyle='segment'>
            <HStack>
              <Icon as={FcPlanner} boxSize={6} />
              <Heading fontSize='2xl'>Upcoming Assignments</Heading>
            </HStack>
            <Divider borderColor='gray.300' my={4} />
            <Table>
              <Tbody>
                {upcomingAssignments.map(assignment =>
                    <Tr key={assignment.id}>
                      <Td p={0} whiteSpace='nowrap' fontSize='sm'>{assignment.ordinalNum}</Td>
                      <Td>
                        <Heading fontSize='lg'>{assignment.title}</Heading>
                      </Td>
                      <Td>
                        <VStack>
                          <Tag bg='transparent'>
                            <TagLeftIcon as={AiOutlineClockCircle} marginBottom={1} />
                            <TagLabel>{assignment.duration}</TagLabel>
                          </Tag>
                        </VStack>
                      </Td>
                      <Td maxW='3xs'>
                        <ScoreBar value={assignment.points} max={assignment.maxPoints} />
                      </Td>
                      <Td>
                        <Button w='full' colorScheme='green' as={Link} to={assignment.url}>
                          {assignment.points ? 'Continue' : 'Start'}
                        </Button>
                      </Td>
                    </Tr>)}
              </Tbody>
            </Table>
          </TableContainer>}
        <TableContainer layerStyle='segment'>
          <HStack>
            <Icon as={FcAlarmClock} boxSize={6} />
            <Heading fontSize='2xl'>Active Assignments</Heading>
          </HStack>
          <Divider borderColor='gray.300' my={4} />
          <Table>
            <Tbody>
              {activeAssignments.map(assignment =>
                  <Tr key={assignment.id}>
                    <Td p={0} whiteSpace='nowrap' fontSize='sm'>{assignment.ordinalNum}</Td>
                    <Td>
                      <Heading fontSize='lg'>{assignment.title}</Heading>
                    </Td>
                    <Td>
                      <VStack>
                        <Tag bg='transparent'>
                          <TagLeftIcon as={AiOutlineClockCircle} marginBottom={1} />
                          <TagLabel>{assignment.duration}</TagLabel>
                        </Tag>
                        <TimeCountDown values={assignment.countDown} />
                      </VStack>
                    </Td>
                    <Td maxW='3xs'>
                      <ScoreBar value={assignment.points} max={assignment.maxPoints} />
                    </Td>
                    <Td>
                      <Button w='full' colorScheme='green' as={Link} to={assignment.url}>
                        {assignment.points ? 'Continue' : 'Start'}
                      </Button>
                    </Td>
                  </Tr>)}
            </Tbody>
            <TableCaption>
              {!activeAssignments.length && <Center minH={28} color='gray.400'>No active assignments found.</Center>}
            </TableCaption>
          </Table>
        </TableContainer>
        <TableContainer layerStyle='segment'>
          <HStack>
            <Icon as={FcLock} boxSize={6} />
            <Heading fontSize='2xl'>Closed Assignments</Heading>
          </HStack>
          <Divider borderColor='gray.300' my={4} />
          <Table>
            <Tbody>
              {pastAssignments.map(assignment =>
                  <Tr key={assignment.id}>
                    <Td p={0} whiteSpace='nowrap' fontSize='sm'>{assignment.ordinalNum}</Td>
                    <Td>
                      <Heading fontSize='lg'>{assignment.title}</Heading>
                    </Td>
                    <Td>
                      <Stack>
                        <Tag bg='transparent'>
                          <TagLeftIcon as={AiOutlineCalendar} />
                          <TagLabel fontWeight={400}>
                            Started: <b>{assignment.duration.split('~')[0]}</b>
                          </TagLabel>
                        </Tag>
                        <Tag bg='transparent'>
                          <TagLeftIcon as={AiOutlineCalendar} />
                          <TagLabel fontWeight={400}>
                            Ended: <b>{assignment.duration.split('~')[1]}</b>
                          </TagLabel>
                        </Tag>
                      </Stack>
                    </Td>
                    <Td maxW='3xs'>
                      <ScoreBar value={assignment.points} max={assignment.maxPoints} />
                    </Td>
                    <Td>
                      <Button w='full' as={Link} to={assignment.url}>
                        View
                      </Button>
                    </Td>
                  </Tr>)}
            </Tbody>
            <TableCaption>
              {!pastAssignments.length && <Center minH={28} color='gray.400'>No closed assignments found.</Center>}
            </TableCaption>
          </Table>
        </TableContainer>
      </Stack>
  )
}