import { Center, VStack } from '@chakra-ui/react'
import React from 'react'
import { Scroll } from './Base'
import { SubmissionCard, TaskCard } from './Buttons'

export function TaskList({ tasks }: { tasks: Array<TaskProps> }) {
  return (
      <Scroll w='25vw' pt={2}>
        <VStack spacing={5} pb={2}>
          {tasks.map(task => <TaskCard key={task.id} task={task} />)}
        </VStack>
      </Scroll>
  )
}

export function SubmissionList({ submissions, onReload }: { submissions: Array<SubmissionProps>, onReload: any }) {
  if (!submissions.length)
    return <Center pt={6} color='gray.500'>No submissions yet.</Center>
  return (
      <VStack spacing={4} my={3} align='end'>
        {submissions.map(submission => <SubmissionCard key={submission.id} submission={submission} onReload={onReload} />)}
      </VStack>
  )
}