import {
  Button, Center, Flex, Grid, GridItem, Heading, HStack, Icon, Stack, Tag, TagLabel, TagLeftIcon, Text, VStack, Wrap
} from '@chakra-ui/react'
import { fork, mapEntries, objectify } from 'radash'
import React, { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { AiOutlineBook, AiOutlineCalendar, AiOutlineTeam } from 'react-icons/ai'
import { BsFillCircleFill } from 'react-icons/bs'
import { FcAlarmClock, FcBullish, FcCollaboration } from 'react-icons/fc'
import { Link, useOutletContext } from 'react-router-dom'
import { Counter, Detail, EditButton, EventBox, GoToButton, RankingInfo } from '../components/Buttons'
import { CourseAvatar } from '../components/Icons'
import { Feature, Underline } from '../components/Panels'
import { ScorePie, Scores, TimeCountDown } from '../components/Statistics'
import { useCourse } from '../components/Hooks'
import { get, groupBy, keys, omit } from 'lodash'
import { format, parseISO } from 'date-fns'

export default function Course() {
  const { data: course } = useCourse()
  const { user, isSupervisor } = useOutletContext<UserContext>()
  const [feature, setFeature] = useState({ i: 0, r: 1 })
  const [selectedDay, setSelectedDay] = useState(new Date())

  if (!course)
    return <></>

  const [activeAssignments, pastAssignments] = fork(course.assignments, a => a.active)
  const featured = activeAssignments[feature.i]
  const collectEvents = (prop: string) => groupBy(omit(course.assignments, 'tasks'), a => get(a, prop + 'Date'))
  const events = objectify(['published', 'due'], key => key, key => collectEvents(key))

  return (
      <Grid layerStyle='container' templateColumns='5fr 2fr' templateRows='auto auto 1fr' gap={6}>
        <GridItem as={Flex} gap={4} layerStyle='segment'>
          <CourseAvatar src={course.avatar} />
          <Stack>
            <HStack h={8}>
              <Heading fontSize='2xl'>{course.title}</Heading>
              {isSupervisor && <EditButton to='supervisor/edit' />}
            </HStack>
            <Wrap>
              <Detail as={AiOutlineCalendar} name={course.semester} />
              <Detail as={AiOutlineCalendar} name={course.duration} />
              <Detail as={AiOutlineBook} name={`${course.assignments.length} Assignments`} />
              <Detail as={AiOutlineTeam} name={`${course.studentsCount} Students`} />
              <Tag color='green.600' bg='green.50'>
                <TagLeftIcon as={BsFillCircleFill} boxSize={2} />
                <TagLabel>{course.onlineCount} Online</TagLabel>
              </Tag>
            </Wrap>
            <Text noOfLines={3} fontSize='sm'>{course.description}</Text>
          </Stack>
        </GridItem>
        <GridItem rowSpan={3} layerStyle='segment' fontSize='sm' display='grid' alignContent='space-between'>
          {isSupervisor ?
              <Stack w='full' layerStyle='segment' borderStyle='dashed' borderWidth={2}>
                <Heading fontSize='lg' textAlign='center'>Supervisor Zone</Heading>
                <Button as={Link} to='supervisor' variant='gradient'>Course Planner</Button>
                <Button as={Link} to='supervisor/students' variant='gradient'>Students</Button>
              </Stack>
              : <VStack>
                <HStack py={3}>
                  <Icon as={FcCollaboration} boxSize={6} />
                  <Heading fontSize='xl'>Class Rank</Heading>
                </HStack>
                <Text><b>{user.given_name}</b>, your rank is</Text>
                <Center h={16}>
                  <Heading color={course.rank ? 'inherit' : 'blackAlpha.300'}>{course.rank || '?'}</Heading>
                </Center>
                <HStack spacing={1}>
                  <Text>{`out of ${course.studentsCount} students.`}</Text>
                  <RankingInfo />
                </HStack>
              </VStack>}
          <DayPicker mode='single' required selected={selectedDay} showOutsideDays weekStartsOn={1} fixedWeeks
                     onSelect={(_, day) => setSelectedDay(day)} modifiersStyles={{ selected: { color: 'inherit' } }}
                     modifiersClassNames={{ published: 'cal-published', due: 'cal-due' }}
                     footer={<EventBox selected={format(selectedDay, 'yyyy-MM-dd')} events={events} />}
                     modifiers={mapEntries(events, (key, value) => [key, keys(value).map(k => parseISO(k))])} />

        </GridItem>
        <GridItem as={Stack} layerStyle='segment' p={0} spacing={0}>
          <HStack justify='space-between' p={4} pb={0}>
            <HStack whiteSpace='nowrap' px={2}>
              <Icon as={FcAlarmClock} boxSize={6} />
              <Heading fontSize='xl'>Active Assignments</Heading>
              <Counter>{activeAssignments.length}</Counter>
              <Button as={Link} to='assignments' variant='link'>View All</Button>
            </HStack>
            <HStack spacing={4}>
              {activeAssignments.map((assignment, i) =>
                  <Underline key={assignment.id} onClick={() => setFeature({ i, r: feature.i < i ? -1 : 1 })}
                             isActive={feature.i === i} children={`Assignment ${assignment.ordinalNum}`} />)}
            </HStack>
          </HStack>
          <Flex w='full' h='xs' p={4} overflow='hidden' pos='relative'>
            {featured ?
                <Feature custom={feature} as={Link} to={`assignments/${featured.url}`}>
                  <Flex justify='space-between'>
                    <Heading whiteSpace='nowrap' fontSize='xl'>{featured.ordinalNum} {featured.title}</Heading>
                    <TimeCountDown values={featured.countDown} />
                  </Flex>
                  <Flex flexGrow={1}>
                    {featured.tasks.map(task => <Scores key={task.id} value={task.points} max={task.maxPoints}
                                                        avg={task.avgPoints} name={`Task ${task.ordinalNum}`} />)}
                    <ScorePie value={featured.points} max={featured.maxPoints} />
                  </Flex>
                  <GoToButton>
                    {featured.points ? 'Continue' : 'Start'}
                  </GoToButton>
                </Feature> :
                <Center layerStyle='segment' flexGrow={1} color='blackAlpha.500' border='2px dashed'
                        borderColor='blackAlpha.300' children={'No active assignments.'} />}
          </Flex>
        </GridItem>
        <GridItem as={Stack} layerStyle='segment'>
          <HStack whiteSpace='nowrap' px={2}>
            <Icon as={FcBullish} boxSize={6} />
            <Heading fontSize='xl'>My Progress</Heading>
            <Counter>{pastAssignments.length}</Counter>
          </HStack>
        </GridItem>
      </Grid>
  )
}
