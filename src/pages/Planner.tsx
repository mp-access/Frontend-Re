import {
  Box, Button, ButtonGroup, Center, Divider, Heading, HStack, SimpleGrid, Stack, Tag, TagLabel, TagLeftIcon, Text
} from '@chakra-ui/react'
import React from 'react'
import { Link } from 'react-router-dom'
import { AddIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'
import { AiOutlineCalendar } from 'react-icons/ai'
import { EditButton, ImportButton, NavButton } from '../components/Buttons'
import { useCourse } from '../components/Hooks'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

export default function Planner() {
  const { data: course } = useCourse()

  if (!course)
    return <></>

  return (
      <Stack my={4} layerStyle='segment' p={0} maxW='container.lg' h='container.md'>
        <ButtonGroup variant='ghost' w='full' p={8} pb={2}>
          <Heading m={2} mt={0} fontSize='3xl'>Course Planner</Heading>
          <Button as={Link} to='assignments' leftIcon={<AddIcon />}>Assignment</Button>
          <Box flexGrow={1} />
          <ImportButton />
        </ButtonGroup>
        <Divider mb={2} />
        <Stack p={10} pt={0} sx={{ '.slick-arrow::before': { color: 'purple.500' } }}>
          <Slider dots slidesToShow={3} infinite={false}>
            {course.assignments.map(assignment =>
                <SimpleGrid columns={1} key={assignment.id} px={3}>
                  <HStack px={2} h={12} justify='space-between'>
                    <Text fontSize='sm' textTransform='uppercase' color='blackAlpha.600' fontWeight={600}>
                      {`Assignment ${assignment.ordinalNum}`}
                    </Text>
                    <ButtonGroup isAttached size='sm'>
                      <EditButton to={`assignments/${assignment.url}`} textTransform='capitalize' />
                      <Button leftIcon={<AddIcon />} variant='ghost' as={Link} size='sm'
                              to={`assignments/${assignment.url}/tasks`} children='Task' />
                    </ButtonGroup>
                  </HStack>
                  <Divider mb={2} />
                  <Text px={2} h={8} fontWeight={500}>{assignment.title}</Text>
                  <Divider />
                  <Stack py={2} spacing={0} justify='center'>
                    <Tag bg='transparent'>
                      <TagLeftIcon as={AiOutlineCalendar} />
                      <TagLabel fontWeight={400}>
                        Start: <b>{assignment.duration.split('~')[0]}</b>
                      </TagLabel>
                    </Tag>
                    <Tag bg='transparent'>
                      <TagLeftIcon as={AiOutlineCalendar} />
                      <TagLabel fontWeight={400}>
                        End: <b>{assignment.duration.split('~')[1]}</b>
                      </TagLabel>
                    </Tag>
                  </Stack>
                  <Divider mb={2} />
                  <Stack maxH='md' spacing={0}>
                    <Slider vertical verticalSwiping slidesToShow={4} infinite={false}
                            nextArrow={<NavButton icon={<ChevronDownIcon boxSize='full' />} right='39%' />}
                            prevArrow={<NavButton icon={<ChevronUpIcon boxSize='full' />} left='39%' />}>
                      {assignment.tasks.map(task =>
                          <Stack key={task.id} layerStyle='card' fontSize='sm' rounded='lg' spacing={1}>
                            <HStack>
                              <Text>{task.ordinalNum}</Text>
                              <Text overflow='hidden' textOverflow='ellipsis' fontSize='md'>{task.title}</Text>
                            </HStack>
                            <HStack justify='space-between'>
                              <Tag>{task.maxAttempts} Attempts</Tag>
                              <Tag>{task.maxPoints} Points</Tag>
                              <EditButton to={`assignments/${assignment.url}/tasks/${task.url}`} />
                            </HStack>
                          </Stack>)}
                    </Slider>
                  </Stack>
                  {!assignment.tasks.length && <Center fontSize='sm' minH={12} color='gray.400'>No tasks yet.</Center>}
                </SimpleGrid>)}
          </Slider>
        </Stack>
        {!course.assignments.length && <Center fontSize='sm' minH={12} color='gray.400'>No assignments yet.</Center>}
      </Stack>
  )
}