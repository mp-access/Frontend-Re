import { Center, Heading, VStack, Wrap } from '@chakra-ui/react'
import React from 'react'
import { useOutletContext } from 'react-router-dom'
import { useFetch } from 'use-http'
import { CourseCard } from '../components/Buttons'
import { NewCourseModal } from '../components/Modals'

export default function Courses() {
  const { isSupervisor } = useOutletContext<CourseContext>()
  const { data: courses } = useFetch<Array<CourseProps>>('/courses', [])

  return (
      <Center minH='90vh'>
        <VStack spacing={10} bg='white' rounded='3xl' zIndex={1}>
          <Heading fontSize='3xl'>My Courses</Heading>
          <Wrap spacing={12}>
            {courses && courses.map(course => <CourseCard key={course.url} course={course} />)}
            {isSupervisor && <NewCourseModal />}
          </Wrap>
        </VStack>
      </Center>
  )
}
