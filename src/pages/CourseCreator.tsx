import { Button, Heading, Input, InputGroup, InputLeftElement, Text, VStack } from '@chakra-ui/react'
import { useMutation } from '@tanstack/react-query'
import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { GitHubIcon } from '../components/Icons'

export default function CourseCreator() {
  const [repository, setRepository] = useState('')
  const { mutate: create, isLoading, data: courseURL } = useMutation<string, any, object>(['courses'])
  if (courseURL)
    return <Navigate to='/' />
  return (
      <VStack spacing={4}>
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
