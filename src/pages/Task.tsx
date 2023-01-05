import {
  Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Badge, Box, Button, ButtonGroup, Center,
  Code, Divider, Flex, HStack, Icon, IconButton, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader,
  ModalOverlay, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger, SimpleGrid, Stack, Tab, TabList,
  TabPanel, TabPanels, Tabs, Tag, Text, useDisclosure, useToast, VStack
} from '@chakra-ui/react'
import Editor from '@monaco-editor/react'
import { format, parseISO } from 'date-fns'
import { AnimatePresence } from 'framer-motion'
import fileDownload from 'js-file-download'
import JSZip from 'jszip'
import { find, range, unionBy } from 'lodash'
import React, { useEffect, useState } from 'react'
import Countdown from 'react-countdown'
import { AiOutlineBulb, AiOutlineCode, AiOutlineReload } from 'react-icons/ai'
import { BsCircleFill } from 'react-icons/bs'
import { HiDownload } from 'react-icons/hi'
import { useOutletContext } from 'react-router-dom'
import { FileTabs } from '../components/FileTab'
import { FileTree } from '../components/FileTree'
import { Markdown, Screen, SplitHorizontal, SplitVertical } from '../components/Panels'
import { ScoreBar, ScorePie } from '../components/Statistics'
import { FcFile, FcInspection, FcTimeline, FcTodoList } from 'react-icons/fc'
import TaskController from './TaskController'
import { ActionButton, ActionTab, TooltipButton } from '../components/Buttons'
import { useCodeEditor, useTask } from '../components/Hooks'

const commands = ['test', 'run', 'grade']

export default function Task() {
  const editor = useCodeEditor()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isAssistant, user } = useOutletContext<UserContext>()
  const [submissionId, setSubmissionId] = useState(0)
  const [currentTab, setCurrentTab] = useState(0)
  const [currentFile, setCurrentFile] = useState<TaskFileProps>()
  const [editableFiles, setEditableFiles] = useState<TaskFileProps[]>([])
  const [openFiles, setOpenFiles] = useState<TaskFileProps[]>([])
  const [userId, setUserId] = useState(user.email)
  const { data: task, submit, timer } = useTask(userId)

  useEffect(() => {
    setCurrentFile(undefined)
    setSubmissionId(0)
  }, [task?.url, userId])

  useEffect(() => {
    if (task && !currentFile) {
      const defaultFiles = task.files.filter(file => file.editable)
      setEditableFiles(defaultFiles)
      setOpenFiles(defaultFiles)
      setCurrentFile(defaultFiles[0])
    }
  }, [currentFile, task])

  useEffect(() => {
    if (currentFile)
      setOpenFiles(files => unionBy(files, [currentFile], 'id'))
  }, [currentFile])

  const getPath = (id: number) => `${id}/${user.email}/${submissionId}`
  const getTemplate = (name: string) => find(task?.files, { name })?.template || ''
  const getUpdate = (file: TaskFileProps, submission?: WorkspaceProps) =>
      submission?.files?.find(s => s.taskFileId === file.id)?.content || file.latest || file.template
  const getContent = (file: TaskFileProps) => editor.getContent(getPath(file.id)) || file.latest || file.template
  const onSubmit = (command: string) => () => submit({
    restricted: !isAssistant, command, files: editableFiles.map(f => ({ taskFileId: f.id, content: getContent(f) }))
  }).then(() => setCurrentTab(commands.indexOf(command))).then(onClose)

  const reload = (submission: SubmissionProps) => {
    toast({ title: 'Reloaded ' + submission.name, isClosable: true })
    const updatedFiles = editableFiles.map(file => ({ ...file, latest: getUpdate(file, submission) }))
    setOpenFiles(files => files.map(file => find(updatedFiles, { id: file.id }) || file))
    setCurrentFile(file => file && find(updatedFiles, { id: file.id }))
    setEditableFiles(updatedFiles)
    setSubmissionId(submission.id)
  }

  const reset = () => {
    toast({ title: 'Reset files to template', isClosable: true })
    setOpenFiles(files => files.map(file => ({ ...file, latest: file.template })))
    setCurrentFile(file => file && ({ ...file, latest: file.template }))
    setSubmissionId(-1)
  }

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
                      <Flex h={10}>
                        {!!timer &&
                          <Countdown date={timer} daysInHours renderer={({ formatted }) =>
                              <Text>Time Remaining: <b>{formatted.minutes}:{formatted.seconds}</b></Text>} />}
                      </Flex>
                      <ButtonGroup>
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
                      task.files.filter(file => !file.editable).forEach(file => zip.file(file.path, file.template))
                      editableFiles.forEach(file => zip.file(file.path, getContent(file)))
                      zip.generateAsync({ type: 'blob' }).then(b => fileDownload(b, task.url + '.zip'))
                    }} />
                  </ButtonGroup>
                  <AccordionPanel p={0} overflow='auto'>
                    <FileTree files={task.files} id={currentFile.id}
                              onClick={file => setCurrentFile(find(editableFiles, { id: file.id }) || file)} />
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
              <SplitHorizontal>
                <FileTabs id={currentFile.id} files={openFiles} onSelect={setCurrentFile} onReorder={setOpenFiles} />
                <Editor path={getPath(currentFile.id)} defaultValue={currentFile.latest || currentFile.template}
                        language={currentFile.language}
                        options={{ minimap: { enabled: false }, readOnly: !currentFile.editable }} />
                <Tabs display='flex' flexDir='column' flexGrow={1} colorScheme='purple'
                      borderTopWidth={1} index={currentTab} onChange={setCurrentTab}>
                  <TabList>
                    <Tab><ActionTab name='Test' /></Tab>
                    <Tab><ActionTab name='Run' /></Tab>
                    <Tab><HStack><FcInspection /><Text>Submit</Text></HStack></Tab>
                  </TabList>
                  <TabPanels flexGrow={1} pos='relative'>
                    {['test', 'run', 'grade'].map(command =>
                        <TabPanel key={command} layerStyle='tab'>
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
              <Accordion minW='3xs' display='flex' flexDir='column' h='full' allowMultiple defaultIndex={[0]}>
                <SimpleGrid columns={2} w='full' fontSize='sm'>
                  <VStack borderRightWidth={1} spacing={0} h={32} pb={2}>
                    <ScorePie value={task.points} max={task.maxPoints} />
                    <Tag size='sm' colorScheme='purple' fontWeight={400} bg='purple.50'>Best Score</Tag>
                  </VStack>
                  <VStack h={32} p={2}>
                    <SimpleGrid columns={Math.min(task.maxAttempts, 5)} gap={1} flexGrow={1} alignItems='center'>
                      {range(Math.min(task.maxAttempts, 10)).map(i =>
                          <Center key={i} rounded='full' boxSize={4} borderWidth={2} borderColor='purple.400'
                                  bg={(isAssistant || i < task.remainingAttempts) ? 'gradients.500' : 'transparent'} />)}
                    </SimpleGrid>
                    <Text fontSize='lg'><b>{isAssistant ? '∞' : task.remainingAttempts}</b> / {task.maxAttempts}</Text>
                    <Tag size='sm' colorScheme='purple' fontWeight={400} bg='purple.50'>Submissions</Tag>
                  </VStack>
                </SimpleGrid>
                <AccordionItem display='flex' flexDir='column' overflow='hidden' w='full'>
                  <AccordionButton>
                    <AccordionIcon />
                    <FcTimeline />
                    <Text>History</Text>
                  </AccordionButton>
                  <AccordionPanel p={2} flexGrow={1} overflow='auto' motionProps={{ style: { display: 'flex' } }}>
                    {task.submissions.map(submission =>
                        <SimpleGrid templateColumns='1rem 1fr auto' templateRows='auto auto' key={submission.id} gap={1}
                                    fontSize='sm' pr={2} pb={2}>
                          <VStack gridRow='span 2'>
                            <Icon as={BsCircleFill} mx={2} mt={1} boxSize={2} color='purple.500' />
                            <Divider orientation='vertical' borderColor='gray.500' />
                          </VStack>
                          <Box>
                            <HStack align='baseline' lineHeight={1.2}>
                              <Text fontWeight={500}>{submission.name}</Text>
                              {!submission.valid && <Badge colorScheme='red'>Not valid</Badge>}
                            </HStack>
                            <Text fontSize='2xs'>
                              {format(parseISO(submission.createdAt), 'dd.MM.yyyy HH:mm')}
                            </Text>
                          </Box>
                          <ButtonGroup size='sm' variant='ghost' spacing={1}>
                            <Popover placement='left'>
                              <PopoverTrigger>
                                <TooltipButton isDisabled={!submission.output} bg='gray.10' color='contra'
                                               aria-label={submission.graded ? 'Hint' : 'Output'}
                                               icon={submission.graded ? <AiOutlineBulb /> : <AiOutlineCode />} />
                              </PopoverTrigger>
                              <PopoverContent w='fit-content' bg='yellow.50'>
                                <PopoverArrow />
                                <PopoverBody overflow='auto' fontSize='sm' whiteSpace='pre-wrap' maxH='2xs'>
                                  {submission.output}
                                </PopoverBody>
                              </PopoverContent>
                            </Popover>
                            <TooltipButton onClick={() => reload(submission)} aria-label='Reload' bg='gray.10'
                                           color='contra' icon={<AiOutlineReload />} />
                          </ButtonGroup>
                          <Stack gridColumn='span 2' py={2} mb={4}>
                            {submission.graded &&
                              <ScoreBar value={submission.points} max={submission.maxPoints} h={6} />}
                          </Stack>
                        </SimpleGrid>)}
                    <Flex gap={2} fontSize='sm'>
                      <VStack w={4}>
                        <Icon as={BsCircleFill} mx={2} mt={1} boxSize={2} color='purple.500' />
                        <Divider orientation='vertical' borderColor='gray.500' />
                      </VStack>
                      <Stack mb={8}>
                        <Text lineHeight={1.2} fontWeight={500}>Started task.</Text>
                        <Button size='xs' leftIcon={<AiOutlineReload />} onClick={reset}>Reset</Button>
                      </Stack>
                    </Flex>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </SplitVertical>
          </Screen>}
      </AnimatePresence>
  )
}