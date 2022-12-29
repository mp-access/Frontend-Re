import {
  Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Badge, Box, Button, ButtonGroup, Center,
  Code, Divider, Flex, Heading, HStack, Icon, IconButton, Image, Modal, ModalBody, ModalCloseButton, ModalContent,
  ModalHeader, ModalOverlay, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger, Stack, Tab, TabList,
  TabPanel, TabPanels, Tabs, Text, useDisclosure, useToast, VStack
} from '@chakra-ui/react'
import Editor from '@monaco-editor/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { AnimatePresence } from 'framer-motion'
import fileDownload from 'js-file-download'
import JSZip from 'jszip'
import { unionBy } from 'lodash'
import React, { useEffect, useState } from 'react'
import Countdown from 'react-countdown'
import { AiOutlineBulb, AiOutlineCode, AiOutlineReload } from 'react-icons/ai'
import { BsCircleFill } from 'react-icons/bs'
import { HiDownload } from 'react-icons/hi'
import { useOutletContext, useParams } from 'react-router-dom'
import { FileTabs } from '../components/FileTab'
import { FileTree } from '../components/FileTree'
import { Markdown, Screen, SplitHorizontal, SplitVertical } from '../components/Panels'
import { ScoreBar } from '../components/Statistics'
import { FcFile, FcInspection, FcTodoList } from 'react-icons/fc'
import TaskController from './TaskController'
import { ActionButton, ActionTab } from '../components/Buttons'
import { useCodeEditor } from '../components/Hooks'

const getUpdatedContent = (file: TaskFileProps, submission?: WorkspaceProps) =>
    submission?.files?.find(submitted => submitted.taskFileId === file.id)?.content || file.latest || file.template
const updateFile = (file: TaskFileProps, submission?: WorkspaceProps) =>
    ({ ...file, latest: getUpdatedContent(file, submission) })

export default function Task() {
  const editor = useCodeEditor()
  const toast = useToast()
  const { taskURL } = useParams()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isAssistant, user } = useOutletContext<UserContext>()
  const [timer, setTimer] = useState<number>()
  const [userId, setUserId] = useState(user.email)
  const [currentSubmission, setCurrentSubmission] = useState<WorkspaceProps>()
  const [currentFile, setCurrentFile] = useState<TaskFileProps>()
  const [openFiles, setOpenFiles] = useState<TaskFileProps[]>([])

  const { data: task, refetch: refreshTask } = useQuery<TaskProps>(['tasks', taskURL, 'users', userId],
      { enabled: !timer, onSettled: () => isOpen && onClose() })
  const { mutate: submit } = useMutation<any, any, object>(['submit'],
      { onMutate: () => setTimer(Date.now() + 30000), onSettled: () => setTimer(undefined), onSuccess: refreshTask })

  useEffect(() => {
    setCurrentFile(undefined)
    setCurrentSubmission(undefined)
  }, [taskURL, userId])

  useEffect(() => {
    if (task && !currentFile) {
      const defaultFiles = task.files.filter(file => file.editable)
      setOpenFiles(defaultFiles)
      setCurrentFile(defaultFiles[0])
    }
  }, [currentFile, task])

  useEffect(() => {
    if (currentFile)
      setOpenFiles(files => unionBy(files, [currentFile], 'id'))
  }, [currentFile])

  const reload = (submission: SubmissionProps) => {
    toast({ title: 'Reloaded ' + submission.name, isClosable: true })
    setOpenFiles(files => files.map(file => updateFile(file, submission)))
    setCurrentFile(file => file && updateFile(file, submission))
    setCurrentSubmission(submission)
  }

  const reset = () => {
    toast({ title: 'Reset files to template ', isClosable: true })
    setOpenFiles(files => files.map(file => ({ ...file, latest: file.template })))
    setCurrentFile(file => file && ({ ...file, latest: file.template }))
    setCurrentSubmission({ id: -1 })
  }

  const getTemplate = (filename: string) => task?.files.find(file => file.name === filename)?.template || ''
  const getPath = (fileId: number) => `${fileId}/${user.email}/${currentSubmission?.id}`
  const getContent = (file: TaskFileProps) =>
      editor.getEditedContent(getPath(file.id)) || getUpdatedContent(file, currentSubmission)
  const onSubmit = (command: string) => () => submit({
    userId: user.email, restricted: !isAssistant, taskId: task?.id, command,
    files: task?.files.filter(file => file.editable).map(file => ({ taskFileId: file.id, content: getContent(file) }))
  })

  return (
      <AnimatePresence initial={false} mode='wait'>
        {task && currentFile &&
          <Screen key={task.id}>
            <ButtonGroup layerStyle='float' pos='absolute' variant='ghost' top={2} right={20} isAttached>
              <ActionButton name='Test' color='gray.600' isLoading={!!timer} onClick={onSubmit('test')} />
              <ActionButton name='Run' color='gray.600' isLoading={!!timer} onClick={onSubmit('run')} />
              <Button colorScheme='green' leftIcon={<FcInspection />} onClick={onOpen} children='Submit'
                      isDisabled={!!timer || (!isAssistant && (task.remainingAttempts <= 0 || !task.active))} />
              <Modal size='sm' isOpen={isOpen} onClose={onClose} isCentered closeOnOverlayClick={!timer}>
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>
                    <Text textAlign='center' color='purple.600'>Confirm Submission</Text>
                    <ModalCloseButton />
                  </ModalHeader>
                  <ModalBody>
                    <VStack p={3} justify='space-between' fontSize='lg'>
                      <Text textAlign='center'>Are you sure you want to submit?</Text>
                      {!!timer &&
                        <Countdown date={timer} daysInHours renderer={({ formatted }) =>
                            <Text>Time Remaining: <b>{formatted.minutes}:{formatted.seconds}</b></Text>} />}
                      <ButtonGroup pt={3}>
                        <Button isLoading={!!timer} onClick={onClose} variant='outline' children='Cancel' />
                        <Button isLoading={!!timer} onClick={onSubmit('grade')} children='Submit' />
                      </ButtonGroup>
                    </VStack>
                  </ModalBody>
                </ModalContent>
              </Modal>
            </ButtonGroup>
            {isAssistant && <TaskController value={userId} defaultValue={user.email} onChange={setUserId} />}
            <SplitVertical bg='base' borderTopWidth={1}>
              <Accordion display='flex' flexDir='column' h='full' allowMultiple defaultIndex={[0, 1]}>
                <Box m={3}>
                  <Heading fontSize='2xl'>{task.title}</Heading>
                  {task.active && <Text><b>{task.remainingAttempts}</b> / {task.maxAttempts} Submissions left</Text>}
                  <ScoreBar value={task.points} max={task.maxPoints} />
                </Box>
                <AccordionItem display='flex' flexDir='column' overflow='hidden'>
                  <AccordionButton>
                    <AccordionIcon />
                    <FcTodoList />
                    <Text>Instructions</Text>
                  </AccordionButton>
                  <AccordionPanel overflow='auto' motionProps={{ style: { display: 'flex' } }}>
                    <Markdown children={task.instructions} transformImageUri={getTemplate} />
                  </AccordionPanel>
                </AccordionItem>
                <AccordionItem borderBottomColor='transparent' pos='relative'>
                  <AccordionButton>
                    <AccordionIcon />
                    <FcFile />
                    <Text>Files</Text>
                  </AccordionButton>
                  <ButtonGroup variant='ghost' size='sm' colorScheme='blackAlpha' pos='absolute' right={3} top={1}>
                    <IconButton icon={<Icon as={HiDownload} boxSize={5} />} aria-label='download' onClick={() => {
                      let zip = new JSZip()
                      task.files.forEach(file => zip.file(file.path, getContent(file)))
                      zip.generateAsync({ type: 'blob' }).then(b => fileDownload(b, task.url + '.zip'))
                    }} />
                  </ButtonGroup>
                  <AccordionPanel p={0} overflow='auto'>
                    <FileTree files={task.files} id={currentFile.id}
                              onClick={file => setCurrentFile(updateFile(file, currentSubmission))} />
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
              <SplitHorizontal>
                <FileTabs id={currentFile.id} files={openFiles} onSelect={setCurrentFile} onReorder={setOpenFiles} />
                <Editor path={getPath(currentFile.id)} defaultValue={currentFile.latest || currentFile.template}
                        language={currentFile.language}
                        options={{ minimap: { enabled: false }, readOnly: !currentFile.editable }} />
                <Tabs display='flex' flexDir='column' flexGrow={1} colorScheme='purple' borderTopWidth={1}>
                  <TabList>
                    <Tab><ActionTab name='Test' /></Tab>
                    <Tab><ActionTab name='Run' /></Tab>
                    <Tab><HStack><FcInspection /><Text>Submit</Text></HStack></Tab>
                  </TabList>
                  <TabPanels flexGrow={1} pos='relative'>
                    {['test', 'run', 'grade'].map((command, i) =>
                        <TabPanel key={i} layerStyle='tab'>
                          {task.submissions.filter(s => s.command === command).map(submission =>
                              <Box key={submission.id}>
                                <HStack align='start'>
                                  <Code color='orange.300'>{'>'}</Code>
                                  <Code fontWeight={700} whiteSpace='pre-wrap'>{submission.name}</Code>
                                </HStack>
                                <HStack align='start'>
                                  <Code color='orange.300'>$</Code>
                                  <Code whiteSpace='pre-wrap' opacity={submission.output ? 1 : 0.8}>
                                    {submission.output || 'No output'}
                                  </Code>
                                </HStack>
                              </Box>)}
                        </TabPanel>)}
                  </TabPanels>
                </Tabs>
                <Center position='absolute' bottom={0} zIndex={currentFile.image ? 2 : -2}>
                  {currentFile.image && <Image src={currentFile.template} h='auto' />}
                </Center>
              </SplitHorizontal>
              <Stack minW='3xs' flexGrow={1} p={2} bg='tone' overflow='auto'>
                {task.submissions.map(submission =>
                    <Flex key={submission.id} gap={1} fontSize='sm'>
                      <VStack>
                        <Icon as={BsCircleFill} mx={2} mt={1} boxSize={2} color='purple.500' />
                        <Divider orientation='vertical' borderColor='gray.500' />
                      </VStack>
                      <Stack mb={8}>
                        <Box>
                          <HStack align='baseline' lineHeight={1.2}>
                            <Text fontWeight={500}>{submission.name}</Text>
                            {!submission.valid && <Badge colorScheme='red'>Not valid</Badge>}
                          </HStack>
                          <Text fontSize='2xs'>
                            {format(parseISO(submission.createdAt), 'dd.MM.yyyy HH:mm')}
                          </Text>
                        </Box>
                        {submission.graded && <ScoreBar value={submission.points} max={submission.maxPoints} />}
                        <ButtonGroup size='xs' colorScheme='gray'>
                          <Popover placement='left'>
                            <PopoverTrigger>
                              <Button isDisabled={!submission.output} children={submission.graded ? 'Hint' : 'Output'}
                                      leftIcon={submission.graded ? <AiOutlineBulb /> : <AiOutlineCode />} />
                            </PopoverTrigger>
                            <PopoverContent w='fit-content' bg='yellow.50'>
                              <PopoverArrow />
                              <PopoverBody overflow='auto' fontSize='sm' whiteSpace='pre-wrap' maxH='2xs'>
                                {submission.output}
                              </PopoverBody>
                            </PopoverContent>
                          </Popover>
                          <Button leftIcon={<AiOutlineReload />} onClick={() => reload(submission)}>Reload</Button>
                        </ButtonGroup>
                      </Stack>
                    </Flex>)}
                <Flex gap={2} fontSize='sm'>
                  <VStack>
                    <Icon as={BsCircleFill} mx={2} mt={1} boxSize={2} color='purple.500' />
                    <Divider orientation='vertical' borderColor='gray.500' />
                  </VStack>
                  <Stack mb={8}>
                    <Text lineHeight={1.2} fontWeight={500}>Started task.</Text>
                    <Button size='xs' leftIcon={<AiOutlineReload />} onClick={reset}>Reset</Button>
                  </Stack>
                </Flex>
              </Stack>
            </SplitVertical>
          </Screen>}
      </AnimatePresence>
  )
}