import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import {
  Button, Center, Divider, Grid, GridItem, Heading, Stack, Tag, TagLabel, TagLeftIcon, Text
} from '@chakra-ui/react'
import { StarIcon } from '../components/Icons'
import { AiOutlineCalendar, AiOutlineClockCircle } from 'react-icons/ai'
import { ProgressBar } from '../components/Statistics'

export default function Assignments() {
  const { courseURL } = useParams()
  const { data: course } = useQuery<CourseProps>(['courses', courseURL])

  if (!course?.assignments)
    return <></>

  return (
      <Stack spacing={4} maxW='container.lg'>
        <Stack layerStyle='segment'>
          <Heading>{course.title}</Heading>
          <Text flexGrow={1} fontSize='sm'>{course.description}</Text>
        </Stack>
        <Heading p={4} pb={0} fontSize='2xl'>Assignments</Heading>
        <Divider borderColor='gray.300' />
        <Stack p={2}>
          {course.assignments.map(assignment =>
              <Grid as={Center} key={assignment.id} templateColumns='4fr 2fr 2fr auto 3fr 1fr' layerStyle='card'
                    gap={4}>
                <GridItem>
                  <Text fontSize='xs'>ASSIGNMENT {assignment.ordinalNum}</Text>
                  <Heading fontSize='lg' noOfLines={1} wordBreak='break-all'>{assignment.title}</Heading>
                  <Text fontSize='sm' noOfLines={3}>{assignment.description}</Text>
                </GridItem>
                <GridItem>
                  <Tag mb={2}>
                    <TagLeftIcon as={AiOutlineCalendar} />
                    <TagLabel>{assignment.startDate}</TagLabel>
                  </Tag>
                  <Tag>
                    <TagLeftIcon as={AiOutlineClockCircle} />
                    <TagLabel>{assignment.startTime}</TagLabel>
                  </Tag>
                </GridItem>
                <GridItem>
                  <Tag mb={2}>
                    <TagLeftIcon as={AiOutlineCalendar} />
                    <TagLabel>{assignment.endDate}</TagLabel>
                  </Tag>
                  <Tag>
                    <TagLeftIcon as={AiOutlineClockCircle} />
                    <TagLabel>{assignment.endTime}</TagLabel>
                  </Tag>
                </GridItem>
                <GridItem>
                  <Tag>
                    <TagLeftIcon as={StarIcon} />
                    <TagLabel>{assignment.points} / {assignment.maxPoints}</TagLabel>
                  </Tag>
                </GridItem>
                <GridItem>
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