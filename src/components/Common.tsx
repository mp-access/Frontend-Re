import React from 'react'
import { Link } from 'react-router-dom'
import { HStack, Progress, Text } from '@chakra-ui/react'

const pointsToProgress = (points?: number, max?: number) => (points && max) ? Math.round(points * 100 / max) : 0

export function ScoreProgress({ value, max }: any) {
  const progress = pointsToProgress(value, max)
  return (
      <HStack w='full' minW='10rem'>
        <Progress value={progress} size='sm' w='full' colorScheme='green' bg='gray.200' />
        <Text fontWeight={400} fontSize='0.7rem'>{progress}%</Text>
      </HStack>
  )
}

export const LogoButton = () =>
    <Text as={Link} to='/' fontFamily='"Courier Prime", monospace' fontSize='2.5rem' fontWeight={400}
          lineHeight={1} mt={3} _hover={{ color: 'purple.500' }} children='ACCESS.' />

