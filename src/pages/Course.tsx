import {
  Box, Button, Center, Flex, Grid, GridItem, Heading, HStack, Icon, Stack, Tag, TagLabel, TagLeftIcon, Text, VStack,
  Wrap
} from '@chakra-ui/react'
import { fork, mapEntries, objectify } from 'radash'
import React, { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { AiOutlineTeam } from 'react-icons/ai'
import { BsFillCircleFill } from 'react-icons/bs'
import { FcAlarmClock, FcBullish, FcCollaboration } from 'react-icons/fc'
import { Link, useOutletContext } from 'react-router-dom'
import { Counter, Detail, EventBox, RankingInfo } from '../components/Buttons'
import { CourseAvatar } from '../components/Icons'
import { Feature, Underline } from '../components/Panels'
import { ScorePie, ScoresPie, ScoreTimeline, TimeCountDown } from '../components/Statistics'
import { useCourse } from '../components/Hooks'
import { get, groupBy, keys, omit } from 'lodash'
import { format, parseISO } from 'date-fns'
import { SupervisorZone } from './Supervisor'
import { HiOutlineCalendarDays } from 'react-icons/hi2'

export default function Course() {
  const { data: course } = useCourse()
  const { user, isAssistant } = useOutletContext<UserContext>()
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
        <GridItem as={Flex} gap={4} layerStyle='segment' p={2}>
          <CourseAvatar src={course.avatar} />
          <Stack flexGrow={1}>
            <HStack justify='space-between'>
              <Heading fontSize='2xl' noOfLines={1}>{course.title}</Heading>
              <Tag color='green.600' bg='green.50'>
                <TagLeftIcon as={BsFillCircleFill} boxSize={2} />
                <TagLabel>{course.onlineCount} Online</TagLabel>
              </Tag>
            </HStack>
            <Wrap>
              <Tag bg='purple.75'>{course.university}</Tag>
              {course.supervisors.map(s => <Tag key={s.name}>{s.name}</Tag>)}
            </Wrap>
            <Wrap mt='auto' spacing={4}>
              <Detail as={HiOutlineCalendarDays} title={course.duration} />
              <Detail as={AiOutlineTeam} title={`${course.studentsCount} Students`} />
            </Wrap>
            <Text noOfLines={2} fontSize='sm'>{course.description}</Text>
          </Stack>
        </GridItem>
        <GridItem rowSpan={3} layerStyle='segment' p={0} fontSize='sm' display='grid' alignContent='space-between'>
          {isAssistant ? <SupervisorZone />
              : '' /* <VStack>
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
              </VStack>*/ }
          <VStack>
            <DayPicker mode='single' required selected={selectedDay} showOutsideDays weekStartsOn={1} fixedWeeks
                       onSelect={(_, day) => setSelectedDay(day)} modifiersStyles={{ selected: { color: 'inherit' } }}
                       modifiersClassNames={{ published: 'cal-published', due: 'cal-due' }}
                       footer={<EventBox selected={format(selectedDay, 'yyyy-MM-dd')} events={events} />}
                       modifiers={mapEntries(events, (key, value) => [key, keys(value).map(k => parseISO(k))])} />
          </VStack>
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
                <Feature custom={feature} to={`assignments/${featured.url}`} columnGap={4} templateRows='auto 1fr'
                         templateColumns='1fr auto'>
                  <Box>
                    <Tag bg='purple.75'>Assignment {featured.ordinalNum}</Tag>
                    <Heading pb={2} whiteSpace='nowrap' fontSize='xl'>{featured.title}</Heading>
                    <Text fontSize='sm' noOfLines={1}>{featured.description}</Text>
                  </Box>
                  <TimeCountDown values={featured.countDown} />
                  <Flex gridColumn='span 2' gap={4} p={2}>
                    {featured.tasks.map(task =>
                        <VStack key={task.id} flexGrow={1} py={5} spacing={0} fontSize='sm'>
                          <Text>{`Task ${task.ordinalNum}`}</Text>
                          <ScoresPie key={task.id} value={task.points} max={task.maxPoints} avg={task.avgPoints} />
                        </VStack>)}
                    <VStack flexGrow={1}>
                      <Text fontSize='sm'>Assignment</Text>
                      <ScorePie value={featured.points} max={featured.maxPoints} />
                    </VStack>
                  </Flex>
                </Feature> :
                <Center layerStyle='segment' flexGrow={1} color='blackAlpha.500' border='2px dashed'
                        borderColor='blackAlpha.300' children={'No active assignments.'} />}
          </Flex>
        </GridItem>
        <GridItem as={Stack} layerStyle='segment' overflow='auto' minH='2xs'>
          <HStack whiteSpace='nowrap' px={2}>
            <Icon as={FcBullish} boxSize={6} />
            <Heading fontSize='xl'>My Progress</Heading>
          </HStack>
          <ScoreTimeline values={course.assignments} />
        </GridItem>
      </Grid>
  )
}
