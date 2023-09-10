import { Button, Container, Flex, FormLabel, FormControl, Heading, Input, InputGroup, InputLeftElement, Text, VStack } from '@chakra-ui/react'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GitHubIcon } from '../components/Icons'
import { useCreate } from '../components/Hooks'

export default function CourseCreator() {
  const { mutate, isLoading }= useCreate()
  const [course, setCourse] = useState(
    {repository: '', repositoryUser: '', repositoryPassword: ''})

  return (
  <Container>
    <VStack spacing={4} layerStyle='card' p={8} m={4}>
      <Heading fontSize='3xl'>Let's get started!</Heading>
          <GitHubIcon />
      <Text color='gray.600' lineHeight={1.5}>
        To set up a new course on ACCESS, specify a Git repository to use as source for all your course data:
      </Text>
      <FormControl isRequired>
        <FormLabel>
          Course Repository URL (https):
        </FormLabel>
        <Input value={course.repository} onChange={e => setCourse({...course, repository: e.target.value})} type='text' />
      </FormControl>
        <Text color='gray.600' lineHeight={1.5}>
          If the repository is private, provide a username and password. Note that you should not use your personal account credentials; instead, create a deploy token!
        </Text>
      <FormControl>
        <FormLabel> Git username: </FormLabel>
        <Input value={course.repositoryUser} onChange={e => setCourse({...course, repositoryUser: e.target.value})} type='text' />
      </FormControl>
      <FormControl>
        <FormLabel> Git password: </FormLabel>
        <Input value={course.repositoryPassword} onChange={e => setCourse({...course, repositoryPassword: e.target.value})} type='text' />
      </FormControl>
        <Button variant='round' onClick={() => mutate({...course})} isLoading={isLoading}> Submit </Button>
    </VStack>
  </Container>
  )
}
