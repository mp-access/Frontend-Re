import { Accordion, AccordionButton, AccordionItem, AccordionPanel, HStack, Input, Text } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { FiAlignJustify, FiLayers } from 'react-icons/fi'
import { Scroll } from '../../components/Base'
import { SubmissionList } from '../../components/Lists'
import MarkdownViewer from './MarkdownViewer'

export default function TextTask({ task, value, onChange }: { task: TaskWorkspaceProps, value: string, onChange: any }) {
  const [index, setIndex] = useState(0)
  const onReload = (submissionId: number) => setIndex(task.submissions.findIndex(s => s.id === submissionId))

  useEffect(() => {
    onChange(task?.submissions[index]?.answer)
  }, [index, onChange, task?.submissions])

  return (
      <Accordion display='flex' borderWidth={1} allowMultiple index={[0, 1]}>
        <AccordionItem>
          <AccordionButton gap={2} h='5vh' whiteSpace='nowrap' bg='gray.70'>
            <FiLayers/>
            My Submissions
          </AccordionButton>
          <AccordionPanel w='20vw' h='70vh' px={0}>
            <Scroll h='70vh'>
              <SubmissionList submissions={task.submissions} onReload={onReload}/>
            </Scroll>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <AccordionButton gap={2} h='5vh' whiteSpace='nowrap' bg='gray.70'>
            <FiAlignJustify/>
            Instructions
          </AccordionButton>
          <AccordionPanel w='full' h='70vh'>
            <HStack my={4} px={4}>
              <Text fontWeight={500} whiteSpace='nowrap'>Your solution:</Text>
              <Input defaultValue={value} onChange={event => onChange(event.target?.value)}/>
            </HStack>
            <Scroll h='60vh'>
              <MarkdownViewer task={task}/>
            </Scroll>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
  )
}