import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Box, Button, Center, Flex, Grid, GridItem, Heading, HStack, Icon, Stack, Tag, TagLabel, TagLeftIcon, Text, Tooltip,
  VStack, Wrap
} from '@chakra-ui/react'
import { AiOutlineBook, AiOutlineCalendar, AiOutlineTeam } from 'react-icons/ai'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import CourseController from './CourseController'
import { ProgressScore, TasksOverview, TimeCountDown } from '../components/Statistics'
import { Feature, Underline } from '../components/Panels'
import { FcAlarmClock, FcCalendar, FcCollaboration, FcIdea } from 'react-icons/fc'
import { Counter, GoToButton } from '../components/Buttons'
import { CourseIcon } from '../components/Icons'
import { BsFillCircleFill } from 'react-icons/bs'
import { formatISO, parseISO } from 'date-fns'
import { DayPicker } from 'react-day-picker'
import { ExternalLinkIcon, InfoOutlineIcon } from '@chakra-ui/icons'

export default function Course() {
  const { courseURL } = useParams()
  const { isSupervisor, user } = useOutletContext<UserContext>()
  const { data: course } = useQuery<CourseProps>(['courses', courseURL])
  const [feature, setFeature] = useState({ i: 0, r: 1 })
  const [[day, event], setSelectedDay] = useState<[Date, CourseEventProps?]>([new Date()])

  if (!course)
    return <></>

  const featured = course.activeAssignments[feature.i]
  const findEvent = (when: string) => course.events.find(e => when.startsWith(e.date))
  const collectEvents = (type: string) => course.events.filter(e => e.type === type).map(e => parseISO(e.date))

  return (
      <Grid layerStyle='container' templateColumns='5fr 2fr' templateRows='auto auto 1fr' gap={6}>
        <GridItem as={Stack} layerStyle='segment'>
          <Flex>
            <Icon as={CourseIcon(0)} boxSize={16} mr={4} />
            <Stack>
              <Heading fontSize='xl'>{course.title}</Heading>
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
                  <TagLabel>{course.studentsCount} Students</TagLabel>
                </Tag>
                <Tag color='green.600' bg='green.50'>
                  <TagLeftIcon as={BsFillCircleFill} boxSize={2} />
                  <TagLabel>{course.onlineCount} Online</TagLabel>
                </Tag>
              </Wrap>
            </Stack>
          </Flex>
          <Text flexGrow={1} noOfLines={5} fontSize='sm'>{course.description}</Text>
        </GridItem>
        <GridItem as={VStack} p={3} colSpan={1} rowSpan={3} layerStyle='segment' fontSize='sm'>
          {isSupervisor && <CourseController />}
          <VStack flexGrow={1}>
            <HStack py={3}>
              <Icon as={FcCollaboration} boxSize={6} />
              <Heading fontSize={{ base: 'lg', xl: 'xl' }}>Class Rank</Heading>
            </HStack>
            <Text><b>{user.given_name}</b>, your rank is</Text>
            <Center h={16}>
              <Heading color={course.rank ? 'inherit' : 'blackAlpha.300'}>{course.rank || '?'}</Heading>
            </Center>
            <HStack spacing={1}>
              <Text>out of {course.studentsCount} students.</Text>
              <Tooltip label={'Ranking is based on your course score and reflects the results of all your submissions.'
                  + ' You will receive a rank once you submit a solution to an active task.'} placement='bottom-end'>
                <InfoOutlineIcon />
              </Tooltip>
            </HStack>
          </VStack>
          <DayPicker mode='single' required selected={day} showOutsideDays weekStartsOn={1}
                     onSelect={(day) => day && setSelectedDay([day, findEvent(formatISO(day))])}
                     modifiersClassNames={{ published: 'cal-published', due: 'cal-due' }}
                     modifiersStyles={{ selected: { color: 'inherit' } }}
                     modifiers={{ published: collectEvents('published'), due: collectEvents('due') }}
                     footer={
                       <Stack p={2}>
                         <HStack>
                           <Icon as={FcCalendar} />
                           <Text fontWeight={500}>Events Today</Text>
                         </HStack>
                         {!event && <Text p={1} fontSize='sm' color='blackAlpha.500'>No events planned.</Text>}
                         {event &&
                           <HStack py={1} rounded='lg' justify='space-between'>
                             <Flex>
                               <Box boxSize={5} className={'cal-' + event.type} bgPos={0} />
                               <Text>{event.description}</Text>
                             </Flex>
                             <Text color='blackAlpha.600' textAlign='end'>{event.time}</Text>
                           </HStack>}
                       </Stack>} />
        </GridItem>
        <GridItem layerStyle='segment' p={1}>
          <HStack p={4} pl={6} pb={0} justify='space-between'>
            <HStack whiteSpace='nowrap'>
              <Icon as={FcAlarmClock} boxSize={6} />
              <Heading fontSize={{ base: 'lg', xl: 'xl' }}>
                Active Assignments
              </Heading>
              <Counter>{course.activeAssignments.length}</Counter>
              <Button as={Link} to='assignments' variant='link'>View All</Button>
            </HStack>
            <HStack spacing={4}>
              {course.activeAssignments.map((assignment, i) =>
                  <Underline key={i} onClick={() => setFeature({ i, r: feature.i < i ? -1 : 1 })}
                             isActive={feature.i === i} children={assignment.name} />)}
            </HStack>
          </HStack>
          <Flex h='xs' w='full' p={3} overflow='hidden' pos='relative'>
            {featured ?
                <Feature custom={feature} as={Link} to={`assignments/${featured.url}`}>
                  <Flex flexGrow={1} gap={4} pb={4} justify='space-between'>
                    <Box>
                      <Text fontSize='xs'>ASSIGNMENT {featured.ordinalNum}</Text>
                      <Heading wordBreak='break-all' fontSize='lg' noOfLines={1}>{featured.title}</Heading>
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
                      <GoToButton py={4} alignSelf='end'>
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
          <HStack justify='space-between'>
            <HStack>
              <Icon as={FcIdea} boxSize={6} />
              <Heading fontSize='xl'>Tell us what you think about ACCESS!</Heading>
            </HStack>
            <Button as='a' href={course.feedback} variant='gradient-solid' size='lg'
                    leftIcon={<ExternalLinkIcon />} target='_blank'>
              Feedback Form
            </Button>
          </HStack>
        </GridItem>
      </Grid>
  )
}
