import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { take } from 'lodash'
import {
  Box, Button, Divider, Grid, GridItem, Heading, HStack, Icon, SimpleGrid, Stack, Tag, TagLabel, Text
} from '@chakra-ui/react'
import { AiOutlineClockCircle } from 'react-icons/ai'
import { Link, useParams, useRouteLoaderData } from 'react-router-dom'
import { Calendar, ProgressBar } from '../components/Common'
import CourseController from './CourseController'
import { Carousel } from '../components/Panels'

export default function Course() {
  const { courseURL } = useParams()
  const { isSupervisor } = useRouteLoaderData('user') as UserContext
  const { data: course } = useQuery<CourseOverview>(['courses', courseURL])
  const { data: assignments } = useQuery<AssignmentOverview[]>(['assignments'])

  if (!course?.activeAssignments || !assignments)
    return <></>

  return (
      <Grid templateColumns='5fr 2fr' templateRows='auto 1fr' flexGrow={1}>
        <GridItem p={4} overflow='hidden'>
          <Carousel data={course.activeAssignments} />
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
            {take(assignments, 3).map(assignment =>
                <Stack key={assignment.id} layerStyle='card' p={5}>
                  <Box>
                    <Text fontSize='xs'>ASSIGNMENT {assignment.ordinalNum}</Text>
                    <Heading fontSize='lg' noOfLines={2}>{assignment.title}</Heading>
                  </Box>
                  <HStack align='start'>
                    {!assignment.published && <Tag colorScheme='red'>Draft</Tag>}
                    <Tag>{assignment.tasksCount} Tasks</Tag>
                    <Tag gap={1}>
                      <Icon as={AiOutlineClockCircle} boxSize={4} color='purple.500' />
                      <TagLabel>
                        {format(parseISO(assignment.endDate), 'dd-MM-yyyy')}
                      </TagLabel>
                    </Tag>
                  </HStack>
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
