import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { formatDistance, parseISO } from 'date-fns'
import { take } from 'lodash'
import {
  Box, Button, Center, Divider, Grid, GridItem, Heading, HStack, SimpleGrid, Stack, Tag, TagLabel, TagLeftIcon, Text,
  Wrap
} from '@chakra-ui/react'
import { AiOutlineCalendar, AiOutlineClockCircle } from 'react-icons/ai'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { Calendar } from '../components/Common'
import CourseController from './CourseController'
import { ProgressBar, Score, TasksOverview } from '../components/Statistics'
import { Feature, Underline } from '../components/Panels'

export default function Course() {
  const { courseURL } = useParams()
  const { isSupervisor } = useOutletContext<UserContext>()
  const { data: course } = useQuery<CourseProps>(['courses', courseURL])
  const [feature, setFeature] = useState({ to: 0, from: 0 })

  if (!course?.assignments)
    return <></>

  const featuredAssignment = course.activeAssignments[feature.to]

  return (
      <Grid templateColumns='5fr 2fr' templateRows='auto 1fr' flexGrow={1}>
        <GridItem m={4} overflow='hidden' layerStyle='segment'>
          <HStack px={4} justify='space-between' mb={4}>
            <HStack>
              <Heading fontSize='xl'>Active Assignments</Heading>
              <Center rounded='md' bg='purple.100' p={0.5} w={6} color='purple.600' fontWeight={600}>
                {course.activeAssignments.length}
              </Center>
            </HStack>
            <HStack spacing={4}>
              {course.activeAssignments.map((assignment, i) =>
                  <Underline key={i} onClick={() => setFeature({ to: i, from: feature.to })}
                             isActive={feature.to === i}>
                    {`Assignment ${assignment.ordinalNum}`}
                  </Underline>)}
            </HStack>
          </HStack>
          {featuredAssignment ?
              <Feature custom={feature}>
                <Box pos='absolute' bg='gradients.405' w='full' h='4xl' rounded='full' left='15%' bottom={5} />
                <Box p={4} zIndex={1}>
                  <Text fontSize='xs'>ASSIGNMENT {featuredAssignment.ordinalNum}</Text>
                  <Heading fontSize='lg'>{featuredAssignment.title}</Heading>
                  <Tag colorScheme='whiteAlpha' my={2}>
                    <TagLeftIcon as={AiOutlineClockCircle} />
                    <TagLabel>
                      Due in {formatDistance(new Date(), parseISO(featuredAssignment.endDate))}
                    </TagLabel>
                  </Tag>
                  <Text noOfLines={3} fontSize='sm'>{featuredAssignment.description}</Text>
                </Box>
                <TasksOverview data={featuredAssignment.tasks} />
                <Score points={featuredAssignment.points} maxPoints={featuredAssignment.maxPoints} />
              </Feature> :
              <Center layerStyle='feature' bg='blackAlpha.50' color='blackAlpha.500' border='2px dashed'
                      borderColor='blackAlpha.300'>
                No active assignments.
              </Center>}
        </GridItem>
        <GridItem as={Stack} colSpan={1} rowSpan={2} bg='base' boxShadow='md' borderLeftWidth={1} p={8}>
          <Heading fontSize='xl'>Notice Board</Heading>
          <Divider borderColor='gray.300' />
          <Heading fontSize='xl'>Leaderboard</Heading>
          <Divider borderColor='gray.300' />
          <Stack fontSize='sm'>
            <Calendar />
          </Stack>
        </GridItem>
        <GridItem as={Stack} p={4}>
          <HStack justify='space-between' px={2} align='end'>
            <HStack spacing={6}>
              <Heading fontSize='xl'>Latest Assignments</Heading>
              <Button as={Link} to='assignments' variant='link' size='lg'>View All</Button>
            </HStack>
            {isSupervisor && <CourseController />}
          </HStack>
          <Divider borderColor='gray.300' />
          <SimpleGrid columns={3} p={2} gap={6} flexGrow={1}>
            {take(course.assignments, 3).map(assignment =>
                <Stack key={assignment.id} layerStyle='card'>
                  <Box>
                    <Text fontSize='xs'>ASSIGNMENT {assignment.ordinalNum}</Text>
                    <Heading fontSize='lg' noOfLines={2}>{assignment.title}</Heading>
                  </Box>
                  <Wrap>
                    {!assignment.published && <Tag colorScheme='red'>Draft</Tag>}
                    <Tag>{assignment.tasksCount} Tasks</Tag>
                    <Tag colorScheme={assignment.active ? 'green' : 'purple'}>
                      Submission {assignment.active ? 'Open' : 'Closed'}
                    </Tag>
                    <Tag>
                      <TagLeftIcon as={AiOutlineCalendar} />
                      <TagLabel>{assignment.startDate} ~ {assignment.endDate}</TagLabel>
                    </Tag>
                  </Wrap>
                  <Text flexGrow={1} py={2} fontSize='sm' noOfLines={5}>{assignment.description}</Text>
                  <ProgressBar value={assignment.points} max={assignment.maxPoints} w='full' />
                  <Button w='full' colorScheme='green' as={Link} to={`assignments/${assignment.url}`}>
                    Start
                  </Button>
                </Stack>)}
          </SimpleGrid>
        </GridItem>
      </Grid>
  )
}
