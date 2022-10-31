import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { take } from 'lodash'
import {
  Box, Button, Flex, Heading, HStack, Icon, SimpleGrid, Stack, Tag, TagLabel, Text, Tooltip
} from '@chakra-ui/react'
import { AiOutlineClockCircle } from 'react-icons/ai'
import { Link, useRouteLoaderData } from 'react-router-dom'
import { Calendar, ProgressBar } from '../components/Common'
import CourseController from '../components/CourseController'
import { StarIcon } from '../components/Icons'

export default function Course() {
  const { isSupervisor } = useRouteLoaderData('user') as UserContext
  const { data: assignments } = useQuery<AssignmentOverview[]>(['assignments'])

  if (!assignments)
    return <></>

  return (
      <Flex py={4} w='85%' gap={6}>
        <Stack spacing={4}>
          <Flex justify='space-between' align='end' px={4}>
            <Heading fontSize='xl'>Active Assignments</Heading>
            {isSupervisor && <CourseController />}
          </Flex>
          <SimpleGrid columns={3} gap={6}>
            {take(assignments, 3).map(assignment =>
                <Stack key={assignment.id} layerStyle='card' p={5}>
                  <Box>
                    <Text fontSize='xs'>ASSIGNMENT {assignment.ordinalNum}</Text>
                    <Heading fontSize='lg' noOfLines={1} wordBreak='break-all'>{assignment.title}</Heading>
                  </Box>
                  <HStack>
                    {!assignment.published && <Tag colorScheme='red'>Draft</Tag>}
                    <Tag colorScheme='blackAlpha'>{assignment.tasksCount} Tasks</Tag>
                    <Tag colorScheme='blackAlpha' gap={1}>
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
                  <Button w='full' colorScheme='green' as={Link}
                          to={`assignments/${assignment.url}/tasks/${assignment.defaultTaskURL}`}>Start</Button>
                </Stack>)}
          </SimpleGrid>
          <Heading p={4} pb={0} fontSize='xl'>All Assignments</Heading>
          <Stack maxH='45vh' overflow='auto'>
            {assignments.map(assignment =>
                <HStack key={assignment.id} justify='space-between' layerStyle='card' p={4}>
                  <Box w='sm'>
                    <Text fontSize='xs'>ASSIGNMENT {assignment.ordinalNum}</Text>
                    <Heading mb={1} fontSize='lg' noOfLines={1}>{assignment.title}</Heading>
                    <Tooltip label={assignment.description}>
                      <Text noOfLines={2} minBlockSize={10} fontSize='sm'>{assignment.description}</Text>
                    </Tooltip>
                  </Box>
                  <Tag colorScheme='blackAlpha' gap={1}>
                    {format(parseISO(assignment.startDate), 'dd-MM-yyyy')}
                  </Tag>
                  <Tag colorScheme='blackAlpha' gap={1}>
                    {format(parseISO(assignment.endDate), 'dd-MM-yyyy')}
                  </Tag>
                  <Tag size='sm' rounded='xl' borderWidth={2} boxShadow='base' gap={1}>
                    <Icon as={StarIcon} boxSize='1rem' />
                    <TagLabel fontWeight={700}>{assignment.points} / {assignment.maxPoints} EXP</TagLabel>
                  </Tag>
                  <ProgressBar value={assignment.points} max={assignment.maxPoints} w='10rem' />
                  <Button as={Link} to={`assignments/${assignment.url}/tasks/${assignment.defaultTaskURL}`}>
                    View
                  </Button>
                </HStack>)}
          </Stack>
        </Stack>
        <Stack spacing={4} minW='30%'>
          <Heading px={4} fontSize='xl'>Live & Upcoming Classes</Heading>
          <Stack layerStyle='card'>
          </Stack>
          <Stack layerStyle='card'>
            <Calendar />
          </Stack>
        </Stack>
      </Flex>
  )
}
