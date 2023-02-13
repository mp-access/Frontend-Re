import { Button, ButtonGroup, Center, Heading, HStack, Icon, Stack, Tag, Text, Wrap } from '@chakra-ui/react'
import React from 'react'
import { Link } from 'react-router-dom'
import { AddIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'
import { EditButton, ImportButton, NavButton } from '../components/Buttons'
import { useCourse } from '../components/Hooks'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { FcOvertime } from 'react-icons/fc'
import { range } from 'lodash'

export default function Planner() {
  const { data: course } = useCourse()

  if (!course)
    return <></>

  return (
      <Stack layerStyle='segment' p={0} m='auto' minW='container.sm' maxW='container.xl'
             sx={{ '.slick-arrow::before': { color: 'purple.500' } }}>
        <ButtonGroup variant='ghost' alignItems='center' px={6} pt={4}>
          <Icon as={FcOvertime} boxSize={8} />
          <Heading fontSize='2xl'>Course Planner</Heading>
          <Button as={Link} to='assignments' leftIcon={<AddIcon />}>Assignment</Button>
          <ImportButton />
        </ButtonGroup>
        <Slider dots infinite={false} slidesToShow={3} slidesToScroll={3}>
          {course.assignments.map(assignment =>
              <Stack key={assignment.id} p={4}>
                <Stack layerStyle='feature' p={2} w='sm' h='2xl'>
                  <HStack justify='space-between'>
                    <Wrap>
                      <Tag bg='purple.75'>Assignment {assignment.ordinalNum}</Tag>
                      {assignment.published ?
                          <Tag bg='green.100'>Published</Tag> : <Tag bg='red.100'>Upcoming</Tag>}
                    </Wrap>
                    <ButtonGroup isAttached size='sm'>
                      <EditButton to={`assignments/${assignment.url}`} variant='ghost' />
                      <Button leftIcon={<AddIcon />} variant='ghost' as={Link}
                              to={`assignments/${assignment.url}/tasks`} children='Task' />
                    </ButtonGroup>
                  </HStack>
                  <Heading p={1} whiteSpace='nowrap' fontSize='xl'>{assignment.title}</Heading>
                  <Stack pos='relative' justify='end' flexGrow={1}>
                    <Stack bg='bg' px={2} py={1} rounded='2xl'>
                      <Slider vertical verticalSwiping slidesToShow={4}
                              slidesToScroll={4} infinite={false}
                              nextArrow={<NavButton icon={<ChevronDownIcon boxSize='full' />} right='39%' />}
                              prevArrow={<NavButton icon={<ChevronUpIcon boxSize='full' />} left='39%' />}>
                        {assignment.tasks.map(task =>
                            <Stack key={task.id} layerStyle='feature' spacing={0} h={28} my={1}>
                              <HStack justify='space-between'>
                                <Wrap>
                                  <Tag bg='purple.75' size='sm'>Task {task.ordinalNum}</Tag>
                                  <Tag size='sm'>{task.maxAttempts} Attempts</Tag>
                                  <Tag size='sm'>{task.maxPoints} Points</Tag>
                                </Wrap>
                                <EditButton to={`assignments/${assignment.url}/tasks/${task.url}`} variant='ghost' />
                              </HStack>
                              <Text px={1} whiteSpace='nowrap' fontSize='lg'>{task.title}</Text>
                            </Stack>)}
                        <Button h={28} my={1} variant='outline' rounded='2xl' borderStyle='dashed' as={Link}
                                to={`assignments/${assignment.url}/tasks`} textAlign='center'>
                          <AddIcon bg='base' rounded='full' p={3} boxSize={10} boxShadow='md' mt={10} />
                        </Button>
                        {range(Math.max(0, 4 - assignment.tasks.length)).map(i => <Stack key={i} h={28} my={1} />)}
                      </Slider>
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>)}
          {range(Math.max(0, 3 - course.assignments.length)).map(i => <Stack key={i} h={28} my={1} w='md' />)}
        </Slider>
        {!course.assignments.length && <Center fontSize='sm' minH={12} color='gray.400'>No assignments yet.</Center>}
      </Stack>
  )
}