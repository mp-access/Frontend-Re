import { ChevronRightIcon } from '@chakra-ui/icons'
import { Box, Button, Center, Flex, Heading, HStack, Icon, Stack, Tag, TagLabel, Text, Tooltip } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { divide, take } from 'lodash'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import React from 'react'
import { AiOutlineClockCircle } from 'react-icons/ai'
import { useNavigate, useParams, useRouteLoaderData } from 'react-router-dom'
import { Card, ProgressBar, ScoreProgress } from '../components/Common'
import CourseController from '../components/CourseController'
import { StarIcon } from '../components/Icons'

export default function Course() {
  const { courseURL } = useParams()
  const { isSupervisor } = useRouteLoaderData('user') as UserContext
  const { data: course } = useQuery<CourseOverview>(['courses', courseURL])
  const { data: assignments } = useQuery<AssignmentOverview[]>(['assignments'])
  const navigate = useNavigate()

  return (
      <Stack w='fit-content' spacing={6} p={4} bg='white'>
        <HStack justifyContent='space-between'>
          <Heading>{course?.title}</Heading>
          {isSupervisor && <CourseController />}
        </HStack>
        <Heading fontSize='xl'>Latest Assignments</Heading>
        <HStack spacing={6} h='xs'>
          {take(assignments, 3).map(assignment =>
              <Card key={assignment.id} to={`assignments/${assignment.url}/tasks/${assignment.defaultTaskURL}`}
                    w='2xs' p={4} alignItems='start' gap={2} borderColor='gray.200'>
                <Box>
                  <Text fontSize='xs'>ASSIGNMENT {assignment.ordinalNum}</Text>
                  <Heading fontSize='lg' minBlockSize={12} noOfLines={2}>{assignment.title}</Heading>
                </Box>
                <Flex>
                  {!assignment.published && <Tag colorScheme='red'>Draft</Tag>}
                  <Tag>{assignment.tasksCount} Tasks</Tag>
                  <Tag gap={1}>
                    <Icon as={AiOutlineClockCircle} boxSize={4} color='purple.500' />
                    <TagLabel>
                      {format(parseISO(assignment.endDate), 'dd-MM-yyyy')}
                    </TagLabel>
                  </Tag>
                </Flex>
                <Tooltip label={assignment.description}>
                  <Text flexGrow={1} fontSize='sm' noOfLines={5}>{assignment.description}</Text>
                </Tooltip>
                <ScoreProgress value={assignment.points} max={assignment.maxPoints} />
                <Button w='full' colorScheme='green'>Start</Button>
              </Card>)}
        </HStack>
        <DataTable value={assignments} rowHover paginator rows={3}
                   onRowClick={({ data }) => navigate(`assignments/${data.url}/tasks/${data.defaultTaskURL}`)}
                   header={() => <Heading mb={1} mt={4} fontSize='xl'>All Assignments</Heading>}>
          <Column field='ordinalNum' header='#' sortable
                  bodyStyle={{ borderRadius: '10px 0 0 10px', paddingRight: 0 }}
                  body={assignment => <Center fontWeight={500} color='gray.500'>{assignment.ordinalNum}</Center>} />
          <Column field='title' header='Assignment' sortable
                  body={assignment =>
                      <Stack w='2xs' h='7rem' justify='center'>
                        <Heading fontSize='lg'>{assignment.title}</Heading>
                        <Tooltip label={assignment.description}>
                          <Text noOfLines={3} fontSize='sm'>{assignment.description}</Text>
                        </Tooltip>
                      </Stack>} />
          <Column field='startDate' header='Publish Date' sortable body={assignment =>
              <Text fontSize='sm'>{format(parseISO(assignment.startDate), 'dd-MM-yyyy')}</Text>} />
          <Column field='endDate' header='Due Date' sortable body={assignment =>
              <Text fontSize='sm'>{format(parseISO(assignment.endDate), 'dd-MM-yyyy')}</Text>} />
          <Column field='points' header='EXP' sortable body={assignment =>
              <Box w='7rem'>
                <Tag size='sm' rounded='xl' borderWidth={2} boxShadow='base' gap={1}>
                  <Icon as={StarIcon} boxSize='1rem' />
                  <TagLabel fontWeight={700}>{assignment.points} / {assignment.maxPoints} EXP</TagLabel>
                </Tag>
              </Box>} />
          <Column field='progress' header='Progress' bodyStyle={{ borderRadius: '0 10px 10px 0' }}
                  body={assignment =>
                      <HStack>
                        <ProgressBar value={divide(assignment.points, assignment.maxPoints || 1)} />
                        <ChevronRightIcon boxSize='1.5rem' />
                      </HStack>} />
        </DataTable>
      </Stack>
  )
}
