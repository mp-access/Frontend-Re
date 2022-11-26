import {
  Button, ButtonGroup, Center, Divider, Flex, Grid, GridItem, Heading, HStack, Icon, SimpleGrid, Stack, Tag, TagLabel,
  TagLeftIcon, Text, VStack, Wrap
} from '@chakra-ui/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import React from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { AiOutlineBook, AiOutlineCalendar, AiOutlineTeam } from 'react-icons/ai'
import { ProgressScore } from '../components/Statistics'
import { AddIcon } from '@chakra-ui/icons'
import { BsCheck2, BsFillCircleFill } from 'react-icons/bs'
import { FcGraduationCap, FcOrgUnit } from 'react-icons/fc'
import { CourseIcon } from '../components/Icons'
import { Counter, GoToButton } from '../components/Buttons'
import { GoMortarBoard } from 'react-icons/go'
import { FiSend } from 'react-icons/fi'

export default function Courses() {
  const { isCreator, user } = useOutletContext<UserContext>()
  const { data: enrolled } = useQuery<CourseOverview[]>(['courses'])
  const { data: featured } = useQuery<CourseFeature[]>(['courses', 'featured'])
  const { mutate: enroll, isLoading } = useMutation<any, any, string[]>(['enroll'],
      { onSuccess: () => window.location.reload() })

  if (!enrolled || !featured)
    return <></>

  return (
      <Grid templateColumns='2fr 1fr' gap={6} w='container.xl'>
        <GridItem as={Stack} spacing={4} layerStyle='segment'>
          <Heading fontWeight={400} fontSize='3xl'>Welcome, <b>{user.given_name}</b>!</Heading>
          <HStack justify='space-between' p={2} pb={0} align='end'>
            <Flex gap={2}>
              <Icon as={FcGraduationCap} boxSize={7} />
              <Heading fontSize='2xl'>My Courses</Heading>
              <Counter>{enrolled.length}</Counter>
            </Flex>
            {isCreator &&
              <Button as={Link} to='create' variant='gradient' leftIcon={<AddIcon />}>
                Create Course
              </Button>}
          </HStack>
          <Divider borderColor='gray.300' />
          <SimpleGrid columns={1} templateRows='auto auto' h='lg' p={2} gap={6}>
            {enrolled.map((course, i) =>
                <Flex key={course.id} as={Link} to={`courses/${course.url}`} layerStyle='card'>
                  <Stack p={2}>
                    <Flex>
                      <Icon as={CourseIcon(i)} boxSize={16} mr={4} />
                      <Stack>
                        <Heading fontSize='2xl'>{course.title}</Heading>
                        <Wrap>
                          <Tag>
                            <TagLeftIcon as={AiOutlineCalendar} />
                            <TagLabel>{course.semester}</TagLabel>
                          </Tag>
                          <Tag>
                            <TagLeftIcon as={AiOutlineCalendar} />
                            <TagLabel>{course.startDate} ~ {course.endDate}</TagLabel>
                          </Tag>
                          <Tag>
                            <TagLeftIcon as={AiOutlineBook} />
                            <TagLabel>{course.assignmentsCount} Assignments</TagLabel>
                          </Tag>
                          <Tag>
                            <TagLeftIcon as={AiOutlineTeam} />
                            <TagLabel>5 Students</TagLabel>
                          </Tag>
                          <Tag color='green.600' bg='green.50'>
                            <TagLeftIcon as={BsFillCircleFill} boxSize={2} />
                            <TagLabel>5 Online</TagLabel>
                          </Tag>
                        </Wrap>
                      </Stack>
                    </Flex>
                    <Text flexGrow={1} noOfLines={5} fontSize='sm'>{course.description}</Text>
                    <GoToButton>Go To Course</GoToButton>
                  </Stack>
                  <Stack w='2xs' spacing={0}>
                    <HStack w='full' justify='end' mb={5}>
                      <Tag colorScheme='purple'>
                        <TagLeftIcon as={BsCheck2} />
                        <TagLabel>Enrolled</TagLabel>
                      </Tag>
                    </HStack>
                    <Text w='full' textAlign='center' color='blackAlpha.500' fontSize='sm'>My Progress</Text>
                    <ProgressScore data={[{ points: course.points, name: 'My Score' }]}
                                   points={course.points} max={course.maxPoints} />
                  </Stack>
                </Flex>)}
            {!enrolled.length && <Center boxSize='full' color='gray.500'>No courses found.</Center>}
          </SimpleGrid>
        </GridItem>
        <GridItem layerStyle='segment'>
          <HStack p={2}>
            <Icon as={FcOrgUnit} boxSize={5} />
            <Heading fontSize='xl'>Explore</Heading>
            <Heading pt={1} fontSize='2xl' fontWeight={400} fontFamily='"Courier Prime", monospace'>ACCESS</Heading>
          </HStack>
          <Divider borderColor='gray.300' />
          <SimpleGrid columns={1} templateRows='auto auto' h='xl' p={2} pt={4} gap={4}>
            {featured.map(course =>
                <Stack key={course.id} layerStyle='card'>
                  <Heading fontSize='xl'>{course.title}</Heading>
                  <Wrap>
                    <Tag>
                      <TagLeftIcon as={AiOutlineCalendar} />
                      <TagLabel>{course.startDate} ~ {course.endDate}</TagLabel>
                    </Tag>
                    <Tag>
                      <TagLeftIcon as={AiOutlineCalendar} />
                      <TagLabel>{course.semester}</TagLabel>
                    </Tag>
                    <Tag>
                      <TagLeftIcon as={AiOutlineCalendar} />
                      <TagLabel>{course.university}</TagLabel>
                    </Tag>
                    <Tag>
                      <TagLeftIcon as={AiOutlineTeam} />
                      <TagLabel>5 Students</TagLabel>
                    </Tag>
                  </Wrap>
                  <Text flexGrow={1} noOfLines={4} fontSize='sm'>{course.description}</Text>
                  <Divider borderColor='gray.300' />
                  <ButtonGroup>
                    <Button w='full' variant='ghost'>Read More</Button>
                    <Button w='full' variant='nav' leftIcon={<Icon as={GoMortarBoard} />}
                            onClick={() => enroll([course.url, 'enroll'])} isLoading={isLoading}>
                      Enroll
                    </Button>
                  </ButtonGroup>
                </Stack>)}
            {!featured.length &&
              <VStack justify='center' spacing={4} color='blackAlpha.400'>
                <Icon as={FiSend} boxSize={16} opacity={0.3} />
                <Text>More courses <br /> coming soon!</Text>
              </VStack>}
          </SimpleGrid>
        </GridItem>
      </Grid>
  )
}
