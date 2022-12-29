import {
  Center, Divider, Flex, Grid, GridItem, Heading, HStack, Icon, SimpleGrid, Stack, Tag, TagLabel, TagLeftIcon, Text,
  VStack, Wrap
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { AiOutlineCalendar, AiOutlineTeam } from 'react-icons/ai'
import { BsCircleFill, BsFillCircleFill } from 'react-icons/bs'
import { FcAdvertising, FcGraduationCap, FcOrgUnit } from 'react-icons/fc'
import { FiSend } from 'react-icons/fi'
import { Link, useOutletContext } from 'react-router-dom'
import { Counter } from '../components/Buttons'
import { ScoreBar } from '../components/Statistics'
import { CourseAvatar } from '../components/Icons'

export default function Courses() {
  const { user } = useOutletContext<UserContext>()
  const { data: courses } = useQuery<CourseOverview[]>(['courses'])

  if (!courses)
    return <></>

  return (
      <Grid layerStyle='container' templateColumns='2fr 1fr' templateRows='auto 1fr' gap={6}>
        <GridItem as={Stack} layerStyle='segment' colSpan={1} rowSpan={2} spacing={3}>
          <Heading pb={4} fontWeight={400} fontSize='2xl'>Welcome, <b>{user.given_name}</b>!</Heading>
          <HStack>
            <Icon as={FcGraduationCap} boxSize={6} />
            <Heading fontSize='xl'>My Courses</Heading>
            <Counter>{courses.length}</Counter>
          </HStack>
          <Divider borderColor='gray.300' />
          <SimpleGrid columns={1} maxH='lg' py={2} gap={3}>
            {courses.map(course =>
                <Flex key={course.id} as={Link} to={course.url} layerStyle='card' gap={4}>
                  <CourseAvatar src={course.avatar} />
                  <Stack>
                    <Heading fontSize='2xl'>{course.title}</Heading>
                    <Wrap>
                      <Tag>
                        <TagLeftIcon as={AiOutlineCalendar} />
                        <TagLabel>{course.semester}</TagLabel>
                      </Tag>
                      <Tag>
                        <TagLeftIcon as={AiOutlineCalendar} />
                        <TagLabel>{course.duration}</TagLabel>
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
                    <ScoreBar value={course.points} max={course.maxPoints} />
                  </Stack>
                </Flex>)}
            {!courses.length && <Center boxSize='full' color='gray.500'>No courses found.</Center>}
          </SimpleGrid>
        </GridItem>
        <GridItem as={Stack} layerStyle='segment'>
          <HStack>
            <Icon as={FcAdvertising} boxSize={5} />
            <Heading fontSize='xl'>Notice Board</Heading>
          </HStack>
          <Divider borderColor='gray.300' />
          <Stack py={2}>
            <Flex gap={2} fontSize='sm'>
              <VStack>
                <Icon as={BsCircleFill} mx={2} mt={1} boxSize={2} color='purple.500' />
                <Divider orientation='vertical' borderColor='gray.500' />
              </VStack>
              <Stack mb={8}>
                <Text lineHeight={1.2} fontWeight={500}>Welcome to the new version of ACCESS!</Text>
                <Text>Check the course Informatics 1 (Demo) and submit your solutions to the available tasks.</Text>
              </Stack>
            </Flex>
          </Stack>
        </GridItem>
        <GridItem as={Stack} layerStyle='segment'>
          <HStack>
            <Icon as={FcOrgUnit} boxSize={5} />
            <Heading fontSize='xl'>Explore</Heading>
            <Heading pt={1} fontSize='2xl' fontWeight={400} fontFamily='monospace'>ACCESS</Heading>
          </HStack>
          <Divider borderColor='gray.300' />
          <VStack justify='center' spacing={4} pt={6} color='blackAlpha.400'>
            <Icon as={FiSend} boxSize={16} opacity={0.3} />
            <Text>More courses <br /> coming soon!</Text>
          </VStack>
        </GridItem>
      </Grid>
  )
}
