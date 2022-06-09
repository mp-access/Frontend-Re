import { ChevronRightIcon } from '@chakra-ui/icons'
import { Box, Center, Flex, Heading, HStack, Icon, Progress, Text } from '@chakra-ui/react'
import React, { ComponentProps } from 'react'
import { BsCircleFill } from 'react-icons/bs'
import { CgInfinity } from 'react-icons/cg'
import { useOutletContext } from 'react-router-dom'

type ScoreProgressProps = Required<{ points: number, max: number }> & ComponentProps<any>

const pointsToProgress = (points: number, max: number) => points ? Math.round(points * 100 / max) : 0

export function ScoreProgress({ points, max, ...props }: ScoreProgressProps) {
  const progress = pointsToProgress(points, max)
  return (
      <HStack {...props}>
        <Progress value={progress} size='sm' w='full' colorScheme='green' bg='gray.200'/>
        <Text fontWeight={400} fontSize='0.7rem'>{progress}%</Text>
      </HStack>
  )
}

export function TaskScore({ points, max }: { points: number, max: number }) {
  return (
      <HStack spacing={5}>
        <Icon as={BsCircleFill} boxSize={1} color='gray.300' />
        <HStack position='relative' spacing={0}>
          <Text fontSize='sm' pr={2}>Best Score:</Text>
          <ScoreProgress points={points} max={max} position='absolute' bottom={-3} left={0} w='full' />
          <HStack spacing={1}>
            <Text fontWeight={600} fontSize='xl' lineHeight={1.2}>{points}</Text>
            <Text fontSize='lg'>/ {max}</Text>
          </HStack>
        </HStack>
      </HStack>
  )
}

export function AssignmentScore({ points, max }: { points: number, max: number }) {
  const progress = pointsToProgress(points, max)
  return (
      <HStack>
        <Progress w='8rem' value={progress} size='sm' colorScheme='green' bg='gray.200' />
        <Text flexGrow={1} fontSize='sm'>{progress}%</Text>
        <ChevronRightIcon boxSize='1.5rem' />
      </HStack>
  )
}

export function TaskTitle({ title, ordinalNum }: { title: string, ordinalNum: number }) {
  return (
      <Box>
        <Heading fontSize='sm'>TASK {ordinalNum}</Heading>
        <Heading fontSize={title.length < 25 ? 'xl' : 'lg'}>{title}</Heading>
      </Box>
  )
}

export function SubmissionsCount({ user, remaining, max }: { user: string, remaining: number, max: number }) {
  const { userId, isAssistant } = useOutletContext<CourseContext>()
  return (
      <Center gap={2}>
        <Heading as={Flex} alignItems='center' fontSize='xl'>
          {(isAssistant && user === userId) ? <CgInfinity /> : remaining}/{max}
        </Heading>
        <Text fontSize='sm'>Submissions left</Text>
      </Center>
  )
}