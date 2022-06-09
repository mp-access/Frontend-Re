import {
  Accordion, AccordionButton, AccordionItem, AccordionPanel, Box, Center, Flex, HStack, Spinner, Text, useToast
} from '@chakra-ui/react'
import { useMonaco } from '@monaco-editor/react'
import { Uri } from 'monaco-editor'
import { Splitter, SplitterPanel } from 'primereact/splitter'
import { TabPanel, TabView } from 'primereact/tabview'
import React, { useEffect, useState } from 'react'
import { FaRegFileCode } from 'react-icons/fa'
import { FiAlignJustify, FiFile, FiLayers } from 'react-icons/fi'
import { useOutletContext, useParams } from 'react-router-dom'
import useFetch from 'use-http'
import { HiddenPanel, Scroll } from '../components/Base'
import { ControlPanel, FloatingMenu } from '../components/Buttons'
import { DirtyFileMark } from '../components/Icons'
import { SubmissionList, TaskList } from '../components/Lists'
import { SubmitModal } from '../components/Modals'
import { SubmissionsCount, TaskScore, TaskTitle } from '../components/Stats'
import CodeEditor from './panels/CodeEditor'
import FileTree from './panels/FileTree'
import ImageViewer from './panels/ImageViewer'
import MarkdownViewer from './panels/MarkdownViewer'
import Terminal from './panels/Terminal'
import TextTask from './panels/TextTask'

export default function Sandbox() {
  const { assignmentURL, taskNum } = useParams()
  const { isAssistant, userId } = useOutletContext<CourseContext>()
  const [currentUser, setCurrentUser] = useState(userId)
  const [dirtyFiles, setDirtyFiles] = useState<Record<number, any>>({})
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const tasksURL = `/assignments/${assignmentURL}/tasks`
  const { post, loading } = useFetch()
  const { data: tasks, get: refreshTasks } = useFetch<Array<TaskProps>>(tasksURL, [assignmentURL])
  const { data: currentTask, get: refreshCurrentTask } = useFetch<TaskWorkspaceProps>(
      `${tasksURL}/${taskNum}/users/${currentUser}`, [assignmentURL, taskNum, currentUser])
  const monaco = useMonaco()
  const toast = useToast()

  useEffect(() => {
    setIndex(0)
  }, [assignmentURL, taskNum, currentUser])

  if (!tasks?.length || !currentTask?.files || !currentTask?.submissions)
    return <Center flexGrow={1}><Spinner size='xl' /></Center>

  const onSubmit = async (submissionType: string) => {
    const files = currentTask.files.filter(file => file.editable).map(file => ({ taskFileId: file.id, content: file.content }))
    const body = { answer, files, fileId: currentTask.files[index]?.id, type: submissionType }
    await post(`tasks/${currentTask.id}`, body).then(async () => {
      await refreshCurrentTask()
      await refreshTasks()
      toast({ title: 'Refreshed latest submissions', isClosable: true })
      setDirtyFiles({ ...dirtyFiles, [index]: false })
      setCurrentUser(userId)
    })
  }

  const onReset = () => {
    monaco?.editor.getModel(Uri.parse(currentTask.files[index].id.toString()))?.setValue(currentTask.files[index].template)
    currentTask.files[index].content = currentTask.files[index].template
    setDirtyFiles({ ...dirtyFiles, [index]: false })
    toast({ title: `Reset ${currentTask.files[index].name} to template`, isClosable: true })
  }

  const onCodeChange = (newContent?: string) => {
    if (newContent) {
      currentTask.files[index].content = newContent
      if (!dirtyFiles[index])
        setDirtyFiles({ ...dirtyFiles, [index]: true })
    }
  }

  const onCodeReload = (submissionId: number) => refreshCurrentTask(`submissions/${submissionId}`).then(() => {
    toast({ title: 'Loaded selected submission', isClosable: true })
    setDirtyFiles({ ...dirtyFiles, [index]: false })
  })

  return (
      <Flex h='90vh' w='full'>
        <TaskList tasks={tasks} />
        <Box w='full' pb={2} pr={2}>
          <HStack h='9vh' justify='space-between' px={3} py={2}>
            <TaskTitle title={currentTask.title} ordinalNum={currentTask.ordinalNum} />
            {isAssistant && <ControlPanel currentUser={currentUser} onImpersonate={setCurrentUser} />}
            <HStack spacing={5}>
              {currentTask.limited &&
                <SubmissionsCount user={currentUser} remaining={currentTask.remainingAttempts} max={currentTask.maxAttempts} />}
              {currentTask.graded && <TaskScore points={currentTask.points} max={currentTask.maxPoints} />}
            </HStack>
            <SubmitModal onSubmit={onSubmit} loading={loading} remaining={currentTask.remainingAttempts} />
          </HStack>
          {currentTask.type === 'text' ? <TextTask task={currentTask} value={answer} onChange={setAnswer} /> :
              <Splitter gutterSize={5} style={{ height: '80vh' }}>
                <SplitterPanel minSize={25} size={25}>
                  <Accordion display='flex' flexDir='column' defaultIndex={currentTask.submissions ? 2 : 0}>
                    <AccordionItem>
                      <AccordionButton gap={2} h='5vh' whiteSpace='nowrap' bg='gray.70'>
                        <FiAlignJustify />
                        Instructions
                      </AccordionButton>
                      <AccordionPanel h='64vh' as={Scroll} p={0}>
                        <MarkdownViewer task={currentTask} />
                      </AccordionPanel>
                    </AccordionItem>
                    <AccordionItem>
                      <AccordionButton gap={2} h='5vh' whiteSpace='nowrap' bg='gray.70'>
                        <FiFile />
                        Files
                      </AccordionButton>
                      <AccordionPanel h='64vh'>
                        <FileTree index={index} setIndex={setIndex} task={currentTask} />
                      </AccordionPanel>
                    </AccordionItem>
                    <AccordionItem>
                      <AccordionButton gap={2} h='5vh' whiteSpace='nowrap' bg='gray.70'>
                        <FiLayers />
                        My Submissions
                      </AccordionButton>
                      <AccordionPanel h='64vh' as={Scroll} p={0} px={3}>
                        <SubmissionList submissions={currentTask.submissions} onReload={onCodeReload} />
                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>
                </SplitterPanel>
                <SplitterPanel style={{ flexDirection: 'column' }} minSize={25} size={75}>
                  <Splitter layout='vertical'>
                    <SplitterPanel size={80} minSize={20} style={{ position: 'relative', maxWidth: '60vw' }}>
                      <TabView activeIndex={index} scrollable onTabChange={event => setIndex(event.index)}>
                        {currentTask.files.map((file, currentIndex) =>
                            <TabPanel key={file.id} header={
                              <HStack>
                                <Box position='relative'>
                                  <FaRegFileCode />
                                  {dirtyFiles[currentIndex] && <DirtyFileMark />}
                                </Box>
                                <Text maxW='10vw' textOverflow='ellipsis' overflow='hidden' whiteSpace='nowrap'>
                                  {file.name}
                                </Text>
                              </HStack>} />)}
                        <HiddenPanel className='hidden-panel' disabled />
                      </TabView>
                      {currentTask.files[index].editable &&
                        <FloatingMenu onSubmit={onSubmit} onReset={onReset} loading={loading} />}
                      <CodeEditor file={currentTask.files[index]} onChange={onCodeChange} />
                      {currentTask.files[index].image && <ImageViewer bytes={currentTask.files[index].content} />}
                    </SplitterPanel>
                    <SplitterPanel size={20} minSize={10} style={{ background: '#000000eb' }}>
                      <Terminal submissions={currentTask.submissions} />
                    </SplitterPanel>
                  </Splitter>
                </SplitterPanel>
              </Splitter>}
        </Box>
      </Flex>
  )
}