import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Box, Button, Center, Flex, Grid, GridItem, Heading, HStack, Icon, Stack, Tag, TagLabel, TagLeftIcon, Text, VStack,
  Wrap
} from '@chakra-ui/react'
import { AiOutlineBook, AiOutlineCalendar, AiOutlineTeam } from 'react-icons/ai'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import CourseController from './CourseController'
import { ProgressScore, TasksOverview, TimeCountDown } from '../components/Statistics'
import { Feature, Underline } from '../components/Panels'
import { FcAlarmClock, FcBullish } from 'react-icons/fc'
import { Counter, GoToButton } from '../components/Buttons'
import { CourseIcon } from '../components/Icons'
import { BsFillCircleFill } from 'react-icons/bs'
import { formatISO, parseISO } from 'date-fns'
import { DayPicker } from 'react-day-picker'


export default function Course() {
  const { courseURL } = useParams()
  const { isSupervisor } = useOutletContext<UserContext>()
  const { data: course } = useQuery<CourseProps>(['courses', courseURL])
  const [feature, setFeature] = useState({ i: 0, r: 1 })
  const [[day, event], setSelectedDay] = useState<[Date, CourseEventProps?]>([new Date()])

  if (!course)
    return <></>

  const featured = course.activeAssignments[feature.i]
  const findEvent = (when: string) => course.events.find(e => when.startsWith(e.date))
  const collectEvents = (type: string) => course.events.filter(e => e.type === type).map(e => parseISO(e.date))

  return (
      <Grid templateColumns='5fr 2fr' templateRows='auto auto 1fr' gap={6} w='container.xl'>
        <GridItem as={Stack} layerStyle='segment'>
          <Flex>
            <Icon as={CourseIcon(0)} boxSize={16} mr={4} />
            <Stack>
              <Heading fontSize='2xl'>{course.title}</Heading>
              <Wrap>
                <Tag>
                  <TagLeftIcon as={AiOutlineCalendar} />
                  <TagLabel>{course.semester}</TagLabel>
                </Tag>
                <Tag>
                  <TagLeftIcon as={AiOutlineCalendar} />
                  <TagLabel>{course.startDate} ~ {course.endDate}</TagLabel>
                </Tag>
                <Tag>
                  <TagLeftIcon as={AiOutlineBook} />
                  <TagLabel>{course.assignmentsCount} Assignments</TagLabel>
                </Tag>
                <Tag>
                  <TagLeftIcon as={AiOutlineTeam} />
                  <TagLabel>5 Students</TagLabel>
                </Tag>
                <Tag color='green.600' bg='green.50'>
                  <TagLeftIcon as={BsFillCircleFill} boxSize={2} />
                  <TagLabel>5 Online</TagLabel>
                </Tag>
              </Wrap>
            </Stack>
          </Flex>
          <Text flexGrow={1} noOfLines={5} fontSize='sm'>{course.description}</Text>
        </GridItem>
        <GridItem as={VStack} colSpan={1} rowSpan={3} layerStyle='segment' fontSize='sm'>
          {isSupervisor && <CourseController />}
          <DayPicker mode='single' required selected={day} weekStartsOn={2} showOutsideDays
                     onSelect={(day) => day && setSelectedDay([day, findEvent(formatISO(day))])}
                     modifiersClassNames={{ published: 'cal-published', due: 'cal-due' }}
                     modifiersStyles={{ selected: { color: 'inherit' } }}
                     modifiers={{ published: collectEvents('published'), due: collectEvents('due') }}
                     footer={event &&
                       <HStack layerStyle='card' px={3} py={1} my={1} rounded='lg'>
                         <Box boxSize={2} className={'cal-' + event.type} bgPos={0} />
                         <Text>{event.description}</Text>
                         <Text flexGrow={1} color='blackAlpha.600' textAlign='end'>{event.time}</Text>
                       </HStack>} />
        </GridItem>
        <GridItem layerStyle='segment'>
          <HStack px={6} pb={4} justify='space-between'>
            <HStack>
              <Icon as={FcAlarmClock} boxSize={6} />
              <Heading fontSize='2xl'>Active Assignments</Heading>
              <Counter>{course.activeAssignments.length}</Counter>
              <Button pt={1} w={20} as={Link} to='assignments' variant='link' size='lg'>View All</Button>
            </HStack>
            <HStack spacing={4}>
              {course.activeAssignments.map((assignment, i) =>
                  <Underline key={i} onClick={() => setFeature({ i, r: feature.i < i ? -1 : 1 })}
                             isActive={feature.i === i} children={assignment.name} />)}
            </HStack>
          </HStack>
          <Flex h='xs'>
            {featured ?
                <Feature custom={feature} as={Link} to={`assignments/${featured.url}`}>
                  <Flex flexGrow={1} gap={4} pb={4} justify='space-between'>
                    <Box>
                      <Text fontSize='xs'>ASSIGNMENT {featured.ordinalNum}</Text>
                      <Heading whiteSpace='nowrap' fontSize='lg'>{featured.title}</Heading>
                      <Text fontSize='sm' noOfLines={2}>{featured.description}</Text>
                    </Box>
                    <HStack>
                      <Text color='blackAlpha.600' fontSize='xs' whiteSpace='nowrap'>DUE IN</Text>
                      <TimeCountDown values={featured.countDown} h={16} />
                    </HStack>
                  </Flex>
                  <Flex h={44}>
                    <TasksOverview data={featured.tasks} />
                    <VStack spacing={0} w='35%'>
                      <Text color='blackAlpha.500' fontSize='sm'>My Progress</Text>
                      <ProgressScore points={featured.points} max={featured.maxPoints}
                                     data={featured.tasks.filter(task => task.points)} />
                      <GoToButton pt={4} alignSelf='end'>
                        {featured.points ? 'Continue' : 'Start'}
                      </GoToButton>
                    </VStack>
                  </Flex>
                </Feature> :
                <Center layerStyle='card' bg='blackAlpha.50' color='blackAlpha.500' border='2px dashed'
                        borderColor='blackAlpha.300' children={'No active assignments.'} />}
          </Flex>
        </GridItem>
        <GridItem as={Stack} layerStyle='segment'>
          <HStack px={6} justify='space-between' align='end'>
            <HStack>
              <Icon as={FcBullish} boxSize={6} />
              <Heading fontSize='2xl'>My Progress</Heading>
            </HStack>
          </HStack>
        </GridItem>
      </Grid>
  )
}
