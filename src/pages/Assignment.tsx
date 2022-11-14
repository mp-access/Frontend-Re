import React from 'react'
import { Link, useParams, useRouteLoaderData } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Box, Button, Center, Divider, Grid, GridItem, Heading, HStack, Icon, Stack, Tag, TagLabel, Text, Wrap, WrapItem
} from '@chakra-ui/react'
import { AiOutlineClockCircle } from 'react-icons/ai'
import { formatDistance, parseISO } from 'date-fns'
import { ProgressBar } from '../components/Common'
import { StarIcon } from '../components/Icons'
import { CgInfinity } from 'react-icons/cg'

export default function Assignment() {
  const { assignmentURL } = useParams()
  const { isAssistant } = useRouteLoaderData('user') as UserContext
  const { data: assignment } = useQuery<AssignmentProps>(['assignments', assignmentURL])

  if (!assignment)
    return <></>

  return (
      <Stack spacing={4}>
        <Stack layerStyle='segment'>
          <Box>
            <Text>ASSIGNMENT {assignment.ordinalNum}</Text>
            <Heading>{assignment.title}</Heading>
            <Tag my={2} gap={1} colorScheme='blackAlpha'>
              <Icon as={AiOutlineClockCircle} boxSize={4} color='purple.500' />
              <TagLabel lineHeight={1}>
                Due in {formatDistance(parseISO(assignment.endDate), new Date())}
              </TagLabel>
            </Tag>
          </Box>
          <Text flexGrow={1} fontSize='sm'>{assignment.description}</Text>
        </Stack>
        <Heading p={4} pb={0} fontSize='2xl'>Tasks</Heading>
        <Divider borderColor='gray.300' />
        <Stack maxW='container.lg' p={2}>
          {assignment.tasks.map(task =>
              <Grid as={Center} key={task.id} templateColumns='3fr 2fr 1fr 2fr 1fr' layerStyle='card' gap={4} p={5}>
                <GridItem>
                  <Text fontSize='xs'>TASK {task.ordinalNum}</Text>
                  <Heading fontSize='lg' noOfLines={1} wordBreak='break-all'>{task.title}</Heading>
                  <Text fontSize='sm' noOfLines={3}>{task.instructions}</Text>
                </GridItem>
                <GridItem>
                  <Wrap my={2}>
                    {[...Array(task.maxAttempts).keys()].map(i =>
                        <WrapItem key={i} rounded='full' boxSize={5} borderWidth={2} borderColor='purple.500'
                                  bg={(isAssistant || i <= task.remainingAttempts) ? 'purple.500' : 'transparent'} />)}
                  </Wrap>
                  <HStack>
                    <Text fontSize='120%' fontWeight={600}>
                      {isAssistant ? <CgInfinity /> : task.remainingAttempts}
                    </Text>
                    <Text noOfLines={1}>/ {task.maxAttempts} Submissions left</Text>
                  </HStack>
                </GridItem>
                <GridItem>
                  <Tag gap={1} colorScheme='blackAlpha' my={2}>
                    <Icon as={StarIcon} boxSize={4} />
                    <TagLabel lineHeight={1}>
                      {task.points} / {task.maxPoints}
                    </TagLabel>
                  </Tag>
                </GridItem>
                <GridItem>
                  <ProgressBar value={task.points} max={task.maxPoints} />
                </GridItem>
                <GridItem>
                  <Button w='full' colorScheme='green' as={Link} to={`tasks/${task.url}`}>
                    Start
                  </Button>
                </GridItem>
              </Grid>)}
        </Stack>
      </Stack>
  )
}