import { Button, Flex, Heading, Input, InputGroup, InputLeftElement, Text, VStack } from '@chakra-ui/react'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GitHubIcon } from '../components/Icons'
import { useCreate } from '../components/Hooks'

export default function CourseCreator() {
  const { mutate, isLoading }= useCreate()
  const [repository, setRepository] = useState('')

  return (
      <VStack spacing={4} layerStyle='card' p={8} m={4}>
        <Heading fontSize='3xl'>Let's get started!</Heading>
        <Text color='gray.600' textAlign='center' lineHeight={1.5} w='md'>
          To set up a new course on ACCESS, connect a Git repository to use as source for all your course data.
        </Text>
        <Flex justifyContent="center" py={6}>
          <InputGroup>
            <InputLeftElement>
              <GitHubIcon />
            </InputLeftElement>
            <Input w='container.md' value={repository} onChange={e => setRepository(e.target.value)} type='text' />
          </InputGroup>
        </Flex>
        <Button variant='round' onClick={() => mutate({repository})} isLoading={isLoading}>
          Submit
        </Button>
      </VStack>
  )
}
