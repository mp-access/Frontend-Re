import React from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Box, Button, Center, Divider, Flex, Grid, GridItem, Heading, HStack, Icon, Stack, Tag, TagLabel, TagLeftIcon, Text,
  VStack, Wrap, WrapItem
} from '@chakra-ui/react'
import { AiOutlineCalendar } from 'react-icons/ai'
import { CgInfinity } from 'react-icons/cg'
import { ProgressBar, TimeCountDown } from '../components/Statistics'
import { range } from 'lodash'
import { FcTodoList } from 'react-icons/fc'
import { Counter } from '../components/Buttons'

export default function Assignment() {
  const { assignmentURL } = useParams()
  const { isAssistant } = useOutletContext<UserContext>()
  const { data: assignment } = useQuery<AssignmentProps>(['assignments', assignmentURL])

  if (!assignment)
    return <></>

  return (
      <Stack spacing={4} maxW='container.lg'>
        <Stack layerStyle='segment'>
          <Flex justify='space-between'>
            <Box>
              <Text>ASSIGNMENT {assignment.ordinalNum}</Text>
              <Heading>{assignment.title}</Heading>
              <Wrap my={2}>
                {!assignment.published && <Tag colorScheme='red'>Draft</Tag>}
                <Tag>{assignment.tasksCount} Tasks</Tag>
                <Tag>
                  <TagLeftIcon as={AiOutlineCalendar} />
                  <TagLabel>{assignment.activeRange}</TagLabel>
                </Tag>
                <Tag colorScheme={assignment.active ? 'green' : 'purple'}>
                  Submission {assignment.active ? 'Open' : 'Closed'}
                </Tag>
              </Wrap>
            </Box>
            {assignment.active &&
              <VStack>
                <Text color='blackAlpha.600' fontSize='xs'>TIME REMAINING</Text>
                <TimeCountDown values={assignment.countDown} />
              </VStack>}
          </Flex>
          <Text flexGrow={1} fontSize='sm'>{assignment.description}</Text>
        </Stack>
        <HStack p={4} pb={0}>
          <Icon as={FcTodoList} boxSize={6} />
          <Heading fontSize='2xl'>Tasks</Heading>
          <Counter>{assignment.tasks.length}</Counter>
        </HStack>
        <Divider borderColor='gray.300' />
        <Stack px={2}>
          {assignment.tasks.map(task =>
              <Grid as={Center} key={task.id} templateColumns='3fr 2fr 2fr 1fr' layerStyle='card' gap={4}>
                <GridItem>
                  <Text fontSize='xs'>TASK {task.ordinalNum}</Text>
                  <Heading fontSize='lg' noOfLines={1} wordBreak='break-all'>{task.title}</Heading>
                  <Text fontSize='sm' noOfLines={3}>{task.instructions}</Text>
                </GridItem>
                <GridItem>
                  <Wrap my={2} maxW={44} maxH={12} overflow='hidden'>
                    {range(Math.min(task.maxAttempts, 12)).map(i =>
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
                  <HStack px={2}>
                    <Text whiteSpace='nowrap'>Best Score:</Text>
                    <Text fontSize='120%' fontWeight={600}>{task.points}</Text>
                    <Text whiteSpace='nowrap'>{` / ${task.maxPoints}`}</Text>
                  </HStack>
                  <ProgressBar value={task.points} max={task.maxPoints} />
                </GridItem>
                <GridItem>
                  <Button w='full' colorScheme='green' as={Link} to={`tasks/${task.url}`}>
                    {task.points ? 'Continue' : 'Start'}
                  </Button>
                </GridItem>
              </Grid>)}
        </Stack>
      </Stack>
  )
}