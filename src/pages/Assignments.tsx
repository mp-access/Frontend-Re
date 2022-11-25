import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import {
  Button, Center, Divider, Grid, GridItem, Heading, HStack, Icon, Stack, Tag, TagLabel, TagLeftIcon, Text, VStack
} from '@chakra-ui/react'
import { FcAlarmClock, FcLock } from 'react-icons/fc'
import { AiOutlineCalendar, AiOutlineClockCircle } from 'react-icons/ai'
import { CountDown, ProgressBar } from '../components/Statistics'

export default function Assignments() {
  const { courseURL } = useParams()
  const { data: course } = useQuery<CourseProps>(['courses', courseURL])

  if (!course)
    return <></>

  return (
      <Stack spacing={4} p={2} maxW='container.lg' h='full'>
        <Stack layerStyle='segment'>
          <Heading>{course.title}</Heading>
          <Text flexGrow={1} fontSize='sm'>{course.description}</Text>
        </Stack>
        <HStack p={4} pb={0}>
          <Icon as={FcAlarmClock} boxSize={6} />
          <Heading fontSize='2xl'>Active Assignments</Heading>
        </HStack>
        <Divider borderColor='gray.300' />
        <Stack p={2}>
          {course.activeAssignments.map(assignment =>
              <Grid key={assignment.id} as={Center} templateColumns='4fr 3fr 2fr 1fr' layerStyle='card' gap={4}>
                <GridItem h='full'>
                  <Text fontSize='xs'>ASSIGNMENT {assignment.ordinalNum}</Text>
                  <Heading fontSize='lg' noOfLines={1} wordBreak='break-all'>{assignment.title}</Heading>
                  <Text wordBreak='break-all' fontSize='sm' noOfLines={4}>{assignment.description}</Text>
                </GridItem>
                <GridItem as={VStack}>
                  <Tag bg='transparent'>
                    <TagLeftIcon as={AiOutlineClockCircle} marginBottom={1} />
                    <TagLabel>{assignment.activeRange}</TagLabel>
                  </Tag>
                  <Text color='blackAlpha.600' fontSize='xs'>TIME REMAINING</Text>
                  <CountDown maxDays={assignment.activeDays} days={assignment.remainingDays}
                             hours={assignment.remainingHours} minutes={assignment.remainingMinutes} />
                </GridItem>
                <GridItem>
                  <HStack px={2}>
                    <Text whiteSpace='nowrap'>Score:</Text>
                    <Text fontSize='120%' fontWeight={600}>{assignment.points}</Text>
                    <Text whiteSpace='nowrap'>{` / ${assignment.maxPoints}`}</Text>
                  </HStack>
                  <ProgressBar value={assignment.points} max={assignment.maxPoints} />
                </GridItem>
                <GridItem>
                  <Button w='full' colorScheme='green' as={Link} to={assignment.url}>
                    View
                  </Button>
                </GridItem>
              </Grid>)}
        </Stack>
        <HStack p={4} pb={0}>
          <Icon as={FcLock} boxSize={6} />
          <Heading fontSize='2xl'>Closed Assignments</Heading>
        </HStack>
        <Divider borderColor='gray.300' />
        <Stack p={2}>
          {course.pastAssignments.map(assignment =>
              <Grid key={assignment.id} as={Center} templateColumns='4fr 2fr 2fr 1fr' layerStyle='card' gap={4}>
                <GridItem h='full'>
                  <Text fontSize='xs'>ASSIGNMENT {assignment.ordinalNum}</Text>
                  <Heading fontSize='lg' noOfLines={1} wordBreak='break-all'>{assignment.title}</Heading>
                  <Text wordBreak='break-all' fontSize='sm' noOfLines={4}>{assignment.description}</Text>
                </GridItem>
                <GridItem>
                  <Tag bg='transparent'>
                    <TagLeftIcon as={AiOutlineCalendar} />
                    <TagLabel fontWeight={400}>
                      Started: <b>{assignment.activeRange.split('~')[0]}</b>
                    </TagLabel>
                  </Tag>
                  <Tag bg='transparent'>
                    <TagLeftIcon as={AiOutlineCalendar} />
                    <TagLabel fontWeight={400}>
                      Ended: <b>{assignment.activeRange.split('~')[1]}</b>
                    </TagLabel>
                  </Tag>
                </GridItem>
                <GridItem>
                  <HStack px={2}>
                    <Text whiteSpace='nowrap'>Final Score:</Text>
                    <Text fontSize='120%' fontWeight={600}>{assignment.points}</Text>
                    <Text whiteSpace='nowrap'>{` / ${assignment.maxPoints}`}</Text>
                  </HStack>
                  <ProgressBar value={assignment.points} max={assignment.maxPoints} />
                </GridItem>
                <GridItem>
                  <Button w='full' colorScheme='green' as={Link} to={assignment.url}>
                    View
                  </Button>
                </GridItem>
              </Grid>)}
        </Stack>
      </Stack>
  )
}