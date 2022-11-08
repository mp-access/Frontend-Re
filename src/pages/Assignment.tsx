import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Box, Button, Divider, Heading, Icon, SimpleGrid, Stack, Tag, TagLabel, Text } from '@chakra-ui/react'
import { AiOutlineClockCircle } from 'react-icons/ai'
import { formatDistance, parseISO } from 'date-fns'
import { ProgressBar } from '../components/Common'

export default function Assignment() {
  const { assignmentURL } = useParams()
  const { data: assignment } = useQuery<AssignmentProps>(['assignments', assignmentURL])

  if (!assignment)
    return <></>

  return (
      <Stack spacing={4}>
        <Box>
          <Text>ASSIGNMENT {assignment.ordinalNum}</Text>
          <Heading>{assignment.title}</Heading>
          <Tag gap={1} colorScheme='blackAlpha' my={2}>
            <Icon as={AiOutlineClockCircle} boxSize={4} color='purple.500' />
            <TagLabel>
              Due in {formatDistance(parseISO(assignment.endDate), new Date())}
            </TagLabel>
          </Tag>
          <Text flexGrow={1} fontSize='sm' minBlockSize={12}>{assignment.description}</Text>
        </Box>
        <Heading fontSize='2xl'>Tasks</Heading>
        <Divider borderColor='gray.300' />
        <SimpleGrid columns={3} w='container.md' gap={4} py={2}>
          {assignment.tasks.map(task =>
              <Stack key={task.id} layerStyle='card' p={5}>
                <Box>
                  <Text fontSize='xs'>TASK {task.ordinalNum}</Text>
                  <Heading fontSize='lg' noOfLines={1} wordBreak='break-all'>{task.title}</Heading>
                </Box>
                <Text fontSize='sm' noOfLines={4}>{task.instructions}</Text>
                <ProgressBar value={task.points} max={task.maxPoints} w='full' />
                <Button w='full' colorScheme='green' as={Link} to={`tasks/${task.url}`}>
                  Start
                </Button>
              </Stack>)}
        </SimpleGrid>
      </Stack>
  )
}