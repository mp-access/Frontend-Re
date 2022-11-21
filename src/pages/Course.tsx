import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { take } from 'lodash'
import {
  Box, Button, Center, Divider, Flex, Grid, GridItem, Heading, HStack, SimpleGrid, Stack, Tag, TagLabel, TagLeftIcon,
  Text, VStack, Wrap
} from '@chakra-ui/react'
import { AiOutlineCalendar } from 'react-icons/ai'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { Calendar } from '../components/Common'
import CourseController from './CourseController'
import { AssignmentScore, ProgressBar, TasksOverview } from '../components/Statistics'
import { Feature, Underline } from '../components/Panels'

export default function Course() {
  const { courseURL } = useParams()
  const { isSupervisor } = useOutletContext<UserContext>()
  const { data: course } = useQuery<CourseProps>(['courses', courseURL])
  const [feature, setFeature] = useState({ i: 0, r: 1 })

  if (!course?.assignments)
    return <></>

  const featuredAssignment = course.activeAssignments[feature.i]

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
                  <Underline key={i} onClick={() => setFeature({ i, r: feature.i < i ? -1 : 1 })}
                             isActive={feature.i === i}>
                    {`Assignment ${assignment.ordinalNum}`}
                  </Underline>)}
            </HStack>
          </HStack>
          {featuredAssignment ?
              <Feature custom={feature} h='35vh' as={Link} to={`assignments/${featuredAssignment.url}`}>
                <Box pos='absolute' bg='gradients.405' w='full' h='4xl' rounded='full' left='15%' bottom={5} />
                <Flex zIndex={1} gap={4}>
                  <Box whiteSpace='nowrap'>
                    <Text fontSize='xs'>ASSIGNMENT {featuredAssignment.ordinalNum}</Text>
                    <Heading fontSize='lg'>{featuredAssignment.title}</Heading>
                  </Box>
                  <Text fontSize='sm' noOfLines={2}>{featuredAssignment.description}</Text>
                </Flex>
                <Flex zIndex={1} flexGrow={1} pt={5}>
                  <TasksOverview data={featuredAssignment.tasks} />
                  <VStack w='full'>
                    <Heading fontSize='md'>Assignment Score</Heading>
                    <AssignmentScore data={featuredAssignment} />
                  </VStack>
                </Flex>
              </Feature> :
              <Center layerStyle='feature' bg='blackAlpha.50' color='blackAlpha.500' border='2px dashed'
                      borderColor='blackAlpha.300' children={'No active assignments.'} />}
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
        <GridItem as={Stack} px={4}>
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
                <Stack key={assignment.id} layerStyle='card' h='35vh'>
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
                  <Box flexGrow={1}>
                    <Text noOfLines={6} fontSize='sm'>{assignment.description}</Text>
                  </Box>
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
