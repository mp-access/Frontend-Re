import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { format, formatDistance, parseISO } from 'date-fns'
import { round, take } from 'lodash'
import {
  Box, Button, Center, Divider, Flex, Grid, GridItem, Heading, HStack, Icon, SimpleGrid, Stack, Tag, TagLabel, Text,
  Tooltip
} from '@chakra-ui/react'
import { Bar, Doughnut } from 'react-chartjs-2'
import { AiOutlineClockCircle } from 'react-icons/ai'
import { Link, useParams, useRouteLoaderData } from 'react-router-dom'
import { Calendar, ProgressBar } from '../components/Common'
import CourseController from '../components/CourseController'

export default function Course() {
  const { courseURL } = useParams()
  const { isSupervisor } = useRouteLoaderData('user') as UserContext
  const { data: course } = useQuery<CourseOverview>(['courses', courseURL])
  const { data: assignments } = useQuery<AssignmentOverview[]>(['assignments'])

  if (!course || !assignments)
    return <></>

  return (
      <Grid templateColumns='2fr 1fr' templateRows='25vh auto' gap={10} p={10} flexGrow={1}>
        <GridItem as={Flex} m={3} p={4} borderRightWidth={2} rounded='3xl' bg='purple.75'>
          <Box>
            <Text fontSize='xs'>ASSIGNMENT {course.activeAssignment.ordinalNum}</Text>
            <Heading fontSize='lg'>{course.activeAssignment.title}</Heading>
            <Tag gap={1} colorScheme='blackAlpha' my={2}>
              <Icon as={AiOutlineClockCircle} boxSize={4} color='purple.500' />
              <TagLabel>
                Due in {formatDistance(parseISO(course.activeAssignment.endDate), new Date())}
              </TagLabel>
            </Tag>
            <Text flexGrow={1} fontSize='sm'>{course.activeAssignment.description}</Text>
          </Box>
          <Box>
            <Bar options={{ scales: { y: { max: 100 }, x: { display: true } } }}
                 data={{
                   labels: course.activeAssignment.tasks.map(t => `Task ${t.ordinalNum}`),
                   datasets: [{ data: course.activeAssignment.tasks.map(t => t.points), label: 'Score' }]
                 }} />
          </Box>
          <Center w='3xs' position='relative'>
            <Doughnut data={{
              labels: ['Assignment Score', 'Total'], datasets: [{
                data: [course.activeAssignment.points, course.activeAssignment.maxPoints - course.activeAssignment.points],
                borderWidth: 0, backgroundColor: ['#9576ff', '#d4d0e5'],
                hoverBackgroundColor: ['#8147ff', '#d4d0e5']
              }]
            }} />
            <Text position='absolute' fontSize='xl' fontWeight={600}>
              {round(course.activeAssignment.points / course.activeAssignment.maxPoints * 100, 1)}%
            </Text>
          </Center>
        </GridItem>
        <GridItem>
          <Heading fontSize='2xl'>Live & Upcoming Classes</Heading>
          <Divider borderColor='gray.300' my={2} />
          <Stack layerStyle='card'>
          </Stack>
        </GridItem>
        <GridItem>
          <Flex justify='space-between' px={2}>
            <HStack spacing={4}>
              <Heading fontSize='2xl'>Assignments</Heading>
              <Button as={Link} to='assignments' variant='link' size='lg'>View All</Button>
            </HStack>
            {isSupervisor && <CourseController />}
          </Flex>
          <Divider borderColor='gray.300' my={2} />
          <SimpleGrid columns={3} py={4} px={2}>
            {take(assignments, 3).map(assignment =>
                <Stack key={assignment.id} layerStyle='card' p={5}>
                  <Box>
                    <Text fontSize='xs'>ASSIGNMENT {assignment.ordinalNum}</Text>
                    <Heading fontSize='lg' noOfLines={1} wordBreak='break-all'>{assignment.title}</Heading>
                  </Box>
                  <HStack>
                    {!assignment.published && <Tag colorScheme='red'>Draft</Tag>}
                    <Tag>{assignment.tasksCount} Tasks</Tag>
                    <Tag gap={1}>
                      <Icon as={AiOutlineClockCircle} boxSize={4} color='purple.500' />
                      <TagLabel>
                        {format(parseISO(assignment.endDate), 'dd-MM-yyyy')}
                      </TagLabel>
                    </Tag>
                  </HStack>
                  <Tooltip label={assignment.description}>
                    <Text flexGrow={1} py={2} fontSize='sm' noOfLines={5}>{assignment.description}</Text>
                  </Tooltip>
                  <ProgressBar value={assignment.points} max={assignment.maxPoints} w='full' />
                  <Button w='full' colorScheme='green' as={Link} to={`assignments/${assignment.url}`}>
                    Start
                  </Button>
                </Stack>)}
          </SimpleGrid>
        </GridItem>
        <GridItem>
          <Stack layerStyle='card'>
            <Calendar />
          </Stack>
        </GridItem>
      </Grid>
  )
}
