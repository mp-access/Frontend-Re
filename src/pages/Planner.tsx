import {
  Button, ButtonGroup, Center, Flex, Heading, HStack, Icon, SimpleGrid, Stack, Tag, Text
} from '@chakra-ui/react'
import React from 'react'
import { Link, Navigate, useOutletContext } from 'react-router-dom'
import { AddIcon } from '@chakra-ui/icons'
import { EditButton, ImportButton } from '../components/Buttons'
import { useCourse } from '../components/Hooks'
import { FcOvertime } from 'react-icons/fc'
import { Placeholder } from '../components/Panels'

export default function Planner() {
  const { isAssistant } = useOutletContext<UserContext>()
  const { data: course } = useCourse()

  if (!isAssistant)
    return <Navigate to='/courses' />

  if (!course)
    return <Placeholder />

  return (
      <Center layerStyle='container'>
        <Stack layerStyle='segment' boxSize='full' minH='xl' spacing={4}>
          <ButtonGroup variant='ghost' alignItems='center'>
            <Icon as={FcOvertime} boxSize={8} />
            <Heading fontSize='2xl'>Course Planner</Heading>
            <Button as={Link} to='assignments' leftIcon={<AddIcon />}>Assignment</Button>
            <ImportButton />
          </ButtonGroup>
          {course.assignments.map(assignment =>
              <Flex key={assignment.id} layerStyle='feature' p={2} gap={2}>
                <Stack w='xs'>
                  <HStack justify='space-between'>
                    <HStack>
                      <Tag whiteSpace='nowrap' bg='purple.75'>Assignment {assignment.ordinalNum}</Tag>
                      {assignment.published ?
                          <Tag bg='green.100'>Published</Tag> : <Tag bg='red.100'>Upcoming</Tag>}
                    </HStack>
                    <EditButton to={`assignments/${assignment.url}`} />
                  </HStack>
                  <Heading fontSize='xl'>{assignment.title}</Heading>
                </Stack>
                <SimpleGrid columns={{ base: 2, xl: 3 }} gap={2} flexGrow={1}>
                  {assignment.tasks.map(task =>
                      <Stack key={task.id} layerStyle='feature' spacing={0}>
                        <HStack justify='space-between'>
                          <HStack>
                            <Tag whiteSpace='nowrap' bg='purple.75' size='sm'>Task {task.ordinalNum}</Tag>
                            <Tag whiteSpace='nowrap' size='sm'>{task.maxAttempts} Attempts</Tag>
                            <Tag whiteSpace='nowrap' size='sm'>{task.maxPoints} Points</Tag>
                          </HStack>
                          <EditButton to={`assignments/${assignment.url}/tasks/${task.url}`} />
                        </HStack>
                        <Text px={1} whiteSpace='nowrap' fontSize='lg'>{task.title}</Text>
                      </Stack>)}
                  <Button variant='outline' rounded='2xl' borderStyle='dashed' as={Link} h='full' minH={24}
                          to={`assignments/${assignment.url}/tasks`} textAlign='center'>
                    <AddIcon bg='base' rounded='full' p={3} boxSize={10} boxShadow='md' />
                  </Button>
                </SimpleGrid>
              </Flex>)}
          {!course.assignments.length &&
            <Center fontSize='sm' flexGrow={1} color='gray.400'>No assignments yet.</Center>}
        </Stack>
      </Center>
  )
}