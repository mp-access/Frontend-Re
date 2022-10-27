import { Center, Heading, HStack, Stack, Text, VStack } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { AiOutlinePlusCircle } from 'react-icons/ai'
import { useRouteLoaderData } from 'react-router-dom'
import { Card } from '../components/Common'

export default function Courses() {
  const { isCreator } = useRouteLoaderData('user') as UserContext
  const { data: courses } = useQuery<CourseOverview[]>(['courses'])

  return (
      <Center flexGrow={1}>
        <VStack spacing={10} bg='white' rounded='3xl' zIndex={1}>
          <Heading fontSize='3xl'>My Courses</Heading>
          <HStack p={4} spacing={6} h='sm'>
            {courses?.map(course =>
                <Card key={course.url} to={`courses/${course.url}`} p={6} w='2xs' borderColor='transparent'>
                  <Stack flexGrow={1} fontSize='xl' alignItems='start'>
                    <Heading mb={2} color='purple.500' fontSize='2xl' whiteSpace='break-spaces'>
                      {course.title}
                    </Heading>
                    <Text>{course.university}</Text>
                    <Text>{course.semester}</Text>
                  </Stack>
                  <Text>
                    {course.activeAssignmentsCount} Active Assignment{course.activeAssignmentsCount === 1 ? '' : 's'}
                  </Text>
                </Card>)}
            {isCreator &&
              <Card to='create' w='2xs' bg='white' borderColor='gray.200' borderStyle='dashed' color='purple.400'
                    gap={4} _hover={{ bg: 'gray.50' }}>
                <AiOutlinePlusCircle size='2rem' />
                <Text fontSize='xl' fontWeight={500}>Create Course</Text>
              </Card>}
          </HStack>
        </VStack>
      </Center>
  )
}
