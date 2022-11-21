import {
  Box, Button, Center, Divider, Flex, Grid, GridItem, Heading, HStack, Stack, Tag, TagLabel, TagLeftIcon, Text
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { AiOutlineBook, AiOutlineCalendar, AiOutlineTeam } from 'react-icons/ai'
import { CourseScore } from '../components/Statistics'
import { AddIcon } from '@chakra-ui/icons'

export default function Courses() {
  const { isCreator, user } = useOutletContext<UserContext>()
  const { data: courses } = useQuery<CourseOverview[]>(['courses'])

  if (!courses)
    return <></>

  return (
      <Grid templateColumns='1fr 2fr' gap={6}>
        <GridItem layerStyle='segment'>
          <Heading fontWeight={400} fontSize='3xl'>Welcome, <b>{user.given_name}</b>!</Heading>
        </GridItem>
        <GridItem as={Stack} layerStyle='segment' maxW='container.md'>
          <HStack justify='space-between' px={2} align='end'>
            <Heading fontSize='2xl'>My Courses</Heading>
            {isCreator &&
              <Button as={Link} to='create' variant='gradient' leftIcon={<AddIcon />}>
                Create Course
              </Button>}
          </HStack>
          <Divider borderColor='gray.300' />
          <Stack p={2}>
            {courses.map(course =>
                <Flex key={course.id} as={Link} to={`courses/${course.url}`} layerStyle='feature' h='2xs'>
                  <Box pos='absolute' bg='gradients.405' w='full' h='4xl' rounded='full' left='15%' bottom={5} />
                  <Stack p={4} zIndex={1} align='start' w='full'>
                    <Heading fontSize='2xl'>{course.title}</Heading>
                    <Tag colorScheme='whiteAlpha' color='white'>
                      <TagLeftIcon as={AiOutlineCalendar} />
                      <TagLabel>{course.startDate} ~ {course.endDate}</TagLabel>
                    </Tag>
                    <Tag colorScheme='whiteAlpha' color='white'>
                      <TagLeftIcon as={AiOutlineTeam} />
                      <TagLabel>5 Students</TagLabel>
                    </Tag>
                    <Tag colorScheme='whiteAlpha' color='white'>
                      <TagLeftIcon as={AiOutlineBook} />
                      <TagLabel>{course.assignmentsCount} Assignments</TagLabel>
                    </Tag>
                    <Text noOfLines={3} fontSize='sm'>{course.description}</Text>
                  </Stack>
                  <CourseScore points={course.points} maxPoints={course.maxPoints} />
                </Flex>)}
            {!courses.length && <Center h='25vh' color='gray.500'>No courses found.</Center>}
          </Stack>
        </GridItem>
      </Grid>
  )
}
