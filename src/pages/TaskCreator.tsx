import { Heading, Stack, TabPanel, VStack } from '@chakra-ui/react'
import React from 'react'
import { AiOutlineSnippets } from 'react-icons/ai'
import { useParams } from 'react-router-dom'
import CreatorForm from '../forms/CreatorForm'
import { MaxPointsField, MaxSubmitsField, NameField, TaskFileField } from '../forms/InputFields'
import { TaskTypeField } from '../forms/TypesFields'

export default function TaskCreator() {
  const { assignmentURL } = useParams()
  const fields = ['taskType', 'name', 'limited', 'maxPoints', 'graded', 'maxAttempts', 'files']

  return (
      <VStack flexGrow={1} p={6} spacing={4}>
        <Heading fontSize='3xl'>Create Task</Heading>
        <CreatorForm fields={fields} url={`/assignments/${assignmentURL}/tasks`}>
          <TabPanel as={Stack} spacing={6} px={0}>
            <Heading fontSize='2xl'>Task Details</Heading>
            <NameField prefix='Task' icon={AiOutlineSnippets}/>
            <MaxPointsField />
            <MaxSubmitsField />
          </TabPanel>
          <TabPanel px={0}>
            <Heading fontSize='2xl'>Select task type</Heading>
            <TaskTypeField />
          </TabPanel>
          <TabPanel px={0}>
            <TaskFileField />
          </TabPanel>
        </CreatorForm>
      </VStack>
  )
}
