import {
  Center, Divider, Flex, Grid, GridItem, Heading, HStack, Icon, SimpleGrid, Stack, Tag, TagLabel, TagLeftIcon, Text,
  VStack, Wrap
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { AiOutlineTeam } from 'react-icons/ai'
import { BsCircleFill, BsFillCircleFill } from 'react-icons/bs'
import { FcAdvertising, FcGraduationCap, FcOrgUnit } from 'react-icons/fc'
import { FiSend } from 'react-icons/fi'
import { Link, useOutletContext } from 'react-router-dom'
import { Counter, Detail } from '../components/Buttons'
import { ScoreBar } from '../components/Statistics'
import { CourseAvatar } from '../components/Icons'
import { HiOutlineCalendarDays } from 'react-icons/hi2'

export default function Courses() {
  const { user } = useOutletContext<UserContext>()
  const { data: courses } = useQuery<CourseOverview[]>(['courses'])

  if (!courses)
    return <></>

  return (
      <Grid templateColumns='2fr 1fr' templateRows='auto 1fr' gap={6} m='auto'>
        <GridItem as={Stack} layerStyle='segment' colSpan={1} rowSpan={2} spacing={3}>
          <Heading pb={4} fontWeight={400} fontSize='2xl'>Welcome, <b>{user.given_name}</b>!</Heading>
          <HStack>
            <Icon as={FcGraduationCap} boxSize={6} />
            <Heading fontSize='xl'>My Courses</Heading>
            <Counter>{courses.length}</Counter>
          </HStack>
          <Divider borderColor='gray.300' />
          <Stack py={2} spacing={3} maxW='full'>
            {courses.map(course =>
                <SimpleGrid key={course.id} as={Link} to={course.url} templateRows='repeat(4, auto)'
                            columnGap={4} templateColumns='auto 1fr' layerStyle='card'>
                  <CourseAvatar src={course.avatar} gridRow='span 4' />
                  <HStack justify='space-between'>
                    <Heading fontSize='2xl' noOfLines={1}>{course.title}</Heading>
                    <Tag color='green.600' bg='green.50'>
                      <TagLeftIcon as={BsFillCircleFill} boxSize={2} />
                      <TagLabel whiteSpace='nowrap'>{course.onlineCount} Online</TagLabel>
                    </Tag>
                  </HStack>
                  <Wrap>
                    <Tag bg='purple.75'>{course.university}</Tag>
                    {course.supervisors.map(s => <Tag key={s.name}>{s.name}</Tag>)}
                  </Wrap>
                  <Wrap mt='auto' spacing={4}>
                    <Detail as={HiOutlineCalendarDays} title={course.duration} />
                    <Detail as={AiOutlineTeam} title={`${course.studentsCount} Students`} />
                  </Wrap>
                  <ScoreBar value={course.points} max={course.maxPoints} />
                </SimpleGrid>)}
            {!courses.length && <Center boxSize='full' color='gray.500'>No courses found.</Center>}
          </Stack>
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
                <Text lineHeight={1.2} fontWeight={500}>{'Welcome to the new version of ACCESS!'}</Text>
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
          <VStack justify='center' spacing={4} minH='xs' color='blackAlpha.400'>
            <Icon as={FiSend} boxSize={16} opacity={0.3} />
            <Text>More courses <br /> coming soon!</Text>
          </VStack>
        </GridItem>
      </Grid>
  )
}
