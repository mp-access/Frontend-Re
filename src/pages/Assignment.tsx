import React from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Box, Button, Center, Divider, Grid, GridItem, Heading, HStack, Stack, Tag, TagLabel, TagLeftIcon, Text, Wrap, WrapItem
} from '@chakra-ui/react'
import { AiOutlineCalendar } from 'react-icons/ai'
import { StarIcon } from '../components/Icons'
import { CgInfinity } from 'react-icons/cg'
import { ProgressBar } from '../components/Statistics'
import { range } from 'lodash'

export default function Assignment() {
  const { assignmentURL } = useParams()
  const { isAssistant } = useOutletContext<UserContext>()
  const { data: assignment } = useQuery<AssignmentProps>(['assignments', assignmentURL])

  if (!assignment)
    return <></>

  return (
      <Stack spacing={4} maxW='container.lg'>
        <Stack layerStyle='segment'>
          <Box>
            <Text>ASSIGNMENT {assignment.ordinalNum}</Text>
            <Heading>{assignment.title}</Heading>
            <Wrap my={2}>
              {!assignment.published && <Tag colorScheme='red'>Draft</Tag>}
              <Tag>{assignment.tasksCount} Tasks</Tag>
              <Tag>
                <TagLeftIcon as={AiOutlineCalendar} />
                <TagLabel>{assignment.startDate} ~ {assignment.endDate}</TagLabel>
              </Tag>
              <Tag colorScheme={assignment.active ? 'green' : 'purple'}>
                Submission {assignment.active ? 'Open' : 'Closed'}
              </Tag>
            </Wrap>
          </Box>
          <Text flexGrow={1} fontSize='sm'>{assignment.description}</Text>
        </Stack>
        <Heading p={4} pb={0} fontSize='2xl'>Tasks</Heading>
        <Divider borderColor='gray.300' />
        <Stack p={2}>
          {assignment.tasks.map(task =>
              <Grid as={Center} key={task.id} templateColumns='3fr 2fr 1fr 2fr 1fr' layerStyle='card' gap={4}>
                <GridItem>
                  <Text fontSize='xs'>TASK {task.ordinalNum}</Text>
                  <Heading fontSize='lg' noOfLines={1} wordBreak='break-all'>{task.title}</Heading>
                  <Text fontSize='sm' noOfLines={3}>{task.instructions}</Text>
                </GridItem>
                <GridItem>
                  <Wrap my={2} maxH={12} overflow='hidden'>
                    {range(task.maxAttempts).map(i =>
                        <WrapItem key={i} rounded='full' boxSize={5} borderWidth={2} borderColor='purple.500'
                                  bg={(isAssistant || i < task.remainingAttempts) ? 'purple.500' : 'transparent'} />)}
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
                    <TagLeftIcon as={StarIcon} />
                    <TagLabel>
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