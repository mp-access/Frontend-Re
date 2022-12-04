import { Button, Heading, Input, InputGroup, InputLeftElement, Text, VStack } from '@chakra-ui/react'
import { useMutation } from '@tanstack/react-query'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GitHubIcon } from '../components/Icons'

export default function CourseCreator() {
  const navigate = useNavigate()
  const [repository, setRepository] = useState('')
  const { mutate: create, isLoading } = useMutation<string, any, object>(['create'],
      { onSettled: () => navigate('/', { state: { refresh: true } }) })

  return (
      <VStack spacing={4} layerStyle='card' p={8}>
        <Heading fontSize='3xl'>Let's get started!</Heading>
        <Text color='gray.600' textAlign='center' lineHeight={1.5} w='md'>
          To set up a new course on ACCESS, connect a Git repository to use as source for all your course data.
        </Text>
        <InputGroup py={6}>
          <InputLeftElement top={6}>
            <GitHubIcon />
          </InputLeftElement>
          <Input w='container.md' value={repository} onChange={e => setRepository(e.target.value)} type='text' />
        </InputGroup>
        <Button variant='round' onClick={() => create({ repository })} isLoading={isLoading}>
          Submit
        </Button>
      </VStack>
  )
}
