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
      <Grid layerStyle='container' templateColumns='2fr 1fr' gap={6}>
        <GridItem as={Stack} layerStyle='segment'>
          <Heading pb={2} fontWeight={400} fontSize='2xl'>Welcome, <b>{user.given_name}</b>!</Heading>
          <HStack justify='space-between' align='end'>
            <HStack>
              <Icon as={FcGraduationCap} boxSize={6} />
              <Heading fontSize='xl'>My Courses</Heading>
              <Counter>{enrolled.length}</Counter>
            </HStack>
            {isCreator &&
              <Button as={Link} to='create' variant='gradient' leftIcon={<AddIcon />}>
                Create Course
              </Button>}
          </HStack>
          <Divider borderColor='gray.300' />
          <SimpleGrid columns={1} templateRows='1fr 1fr' maxH='lg' py={2} gap={3}>
            {enrolled.map((course, i) =>
                <Flex key={course.id} as={Link} to={`courses/${course.url}`} layerStyle='card' gap={4}>
                  <Stack w='full'>
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
                            <TagLabel>{course.studentsCount} Students</TagLabel>
                          </Tag>
                          <Tag color='green.600' bg='green.50'>
                            <TagLeftIcon as={BsFillCircleFill} boxSize={2} />
                            <TagLabel>{course.onlineCount} Online</TagLabel>
                          </Tag>
                        </Wrap>
                      </Stack>
                    </Flex>
                    <Text noOfLines={5} fontSize='sm'>{course.description}</Text>
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
        <GridItem as={Stack} layerStyle='segment'>
          <HStack>
            <Icon as={FcOrgUnit} boxSize={5} />
            <Heading fontSize='xl'>Explore</Heading>
            <Heading pt={1} fontSize='2xl' fontWeight={400} fontFamily='"Courier Prime", monospace'>ACCESS</Heading>
          </HStack>
          <Divider borderColor='gray.300' />
          <SimpleGrid columns={1} templateRows='1fr 1fr' gap={4}>
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
                    <Button w='full' variant='gradient-solid' leftIcon={<Icon as={GoMortarBoard} />}
                            onClick={() => enroll([course.url, 'students', user.email])} isLoading={isLoading}>
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
