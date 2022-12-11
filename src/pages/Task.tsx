import {
  Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Badge, Box, Button, ButtonGroup, Code,
  Divider, Flex, Heading, HStack, Icon, IconButton, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader,
  ModalOverlay, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger, Stack, Text, useDisclosure,
  useToast, VStack
} from '@chakra-ui/react'
import Editor, { useMonaco } from '@monaco-editor/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { AnimatePresence } from 'framer-motion'
import { Uri } from 'monaco-editor'
import React, { useEffect, useState } from 'react'
import { AiOutlineBulb, AiOutlineCode, AiOutlineReload, AiOutlineSend } from 'react-icons/ai'
import { BsCircleFill } from 'react-icons/bs'
import { FaFlask, FaTerminal } from 'react-icons/fa'
import { FiAlignJustify, FiFile } from 'react-icons/fi'
import { useOutletContext, useParams } from 'react-router-dom'
import { FileTabs } from '../components/FileTab'
import { FileTree } from '../components/FileTree'
import { ImagePanel, Screen, SidePanel, SplitHorizontal, SplitVertical } from '../components/Panels'
import TaskController from './TaskController'
import { HiDownload } from 'react-icons/hi'
import { ProgressBar } from '../components/Statistics'
import { MarkdownViewer } from '../components/MarkdownViewer'
import { unionBy } from 'lodash'
import JSZip from 'jszip'
import fileDownload from 'js-file-download'
import Countdown from 'react-countdown'

const getUpdatedContent = (file: TaskFileProps, submission?: SubmissionProps) =>
    submission?.files.find(submitted => submitted.taskFileId === file.id)?.content || file.content || file.template
const updateFile = (file: TaskFileProps, submission?: SubmissionProps) =>
    ({ ...file, content: getUpdatedContent(file, submission) })

export default function Task() {
  const monaco = useMonaco()
  const toast = useToast()
  const { taskURL } = useParams()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isAssistant, user } = useOutletContext<UserContext>()
  const [userId, setUserId] = useState(user.email)
  const [currentSubmission, setCurrentSubmission] = useState<SubmissionProps>()
  const [currentFile, setCurrentFile] = useState<TaskFileProps>()
  const [openFiles, setOpenFiles] = useState<TaskFileProps[]>([])

  const { data: task, refetch: refreshTask } = useQuery<TaskProps>(['tasks', taskURL, 'users', userId])
  const { mutate: submit, isLoading } = useMutation<any, any, object>(['submit'], {
    onMutate: () => setUserId(user.email), onSettled: refreshTask, onSuccess: onClose,
    onError: (error) => toast({ title: error.response.data.message, status: 'error' })
  })

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

  const getPath = (fileId: number) => `${fileId}/${user.email}/${currentSubmission?.id}`
  const getEdited = (fileId: number) => monaco?.editor.getModel(Uri.file(getPath(fileId)))?.getValue()
  const getContent = (file: TaskFileProps) => getEdited(file.id) || getUpdatedContent(file, currentSubmission)
  const onSubmit = (type: string) => () => submit({
    userId: user.email, restricted: !isAssistant, taskId: task?.id, currentFileId: currentFile?.id, type,
    files: task?.files.filter(file => file.editable).map(file => ({ taskFileId: file.id, content: getContent(file) }))
  })

  return (
      <AnimatePresence initial={false} mode='wait'>
        {task && currentFile &&
          <Screen key={task.id} columns={1} templateRows='auto 1fr' w='full'>
            <HStack w='full' p={2} justifyContent='space-between' fontSize={{ base: 'sm', xl: 'md' }}>
              <Box>
                <Heading fontSize='sm'>TASK {task.ordinalNum}</Heading>
                <Heading fontSize='lg' noOfLines={1}>{task.title}</Heading>
              </Box>
              <HStack>
                {((!isAssistant && task.active) || userId !== user?.email) &&
                  <HStack pos='relative'>
                    <Text fontSize='120%' fontWeight={600}>
                      {task.remainingAttempts}
                    </Text>
                    <Text noOfLines={1}>/ {task.maxAttempts} Submissions left</Text>
                    <Icon as={BsCircleFill} boxSize={1} color='gray.300' mx={4} />
                    {!task.remainingAttempts &&
                      <Flex pos='absolute' fontSize='xs' bottom={-3} right={3}>
                        <Countdown date={task.nextAttemptAt} daysInHours
                                   onComplete={() => refreshTask().then(() =>
                                       toast({ title: '+1 Submission Attempt!', status: 'success' }))}
                                   renderer={({ completed, hours, minutes }) => !completed &&
                                     <Text whiteSpace='nowrap'>
                                       Try again in {hours ? hours + ' hours' : (minutes + 1) + ' minutes'}
                                     </Text>} />
                      </Flex>}
                  </HStack>}
                <HStack>
                  <Text whiteSpace='nowrap'>Best Score:</Text>
                  <Text fontSize='120%' fontWeight={600}>{task.points}</Text>
                  <Text whiteSpace='nowrap'>{` / ${task.maxPoints}`}</Text>
                  <ProgressBar value={task.points} max={task.maxPoints} />
                </HStack>
              </HStack>
              <ButtonGroup variant='gradient' isDisabled={isLoading}>
                <Button leftIcon={<FaFlask />} children='Test' isLoading={isLoading} onClick={onSubmit('test')} />
                <Button leftIcon={<FaTerminal />} children='Run' isLoading={isLoading} onClick={onSubmit('run')} />
                <Button colorScheme='green' leftIcon={<AiOutlineSend />} onClick={onOpen} children='Submit'
                        isDisabled={isLoading || (!isAssistant && (task.remainingAttempts <= 0 || !task.active))} />
                <Modal size='sm' isOpen={isOpen} onClose={onClose} isCentered closeOnOverlayClick={!isLoading}>
                  <ModalOverlay />
                  <ModalContent>
                    <ModalHeader>
                      <Text textAlign='center' color='purple.600'>Confirm Submission</Text>
                      <ModalCloseButton />
                    </ModalHeader>
                    <ModalBody>
                      <VStack p={3} justify='space-between' fontSize='lg'>
                        {isLoading
                            ? <Countdown date={Date.now() + 120000} daysInHours renderer={({ formatted }) =>
                                <Text>Time Remaining: <b>{formatted.minutes}:{formatted.seconds}</b></Text>} />
                            : <Text textAlign='center'>Are you sure you want to submit?</Text>}
                        <ButtonGroup variant='round' pt={3}>
                          <Button variant='border' isLoading={isLoading} onClick={onClose}>Cancel</Button>
                          <Button isLoading={isLoading} onClick={onSubmit('grade')}>Confirm</Button>
                        </ButtonGroup>
                      </VStack>
                    </ModalBody>
                  </ModalContent>
                </Modal>
              </ButtonGroup>
              {isAssistant &&
                <TaskController task={task} value={userId} defaultValue={user.email} onChange={setUserId} />}
            </HStack>
            <Flex boxShadow='xs' bg='base' overflow='hidden'>
              <SplitVertical>
                <Accordion h='full' allowMultiple defaultIndex={[0, 1]}>
                  <AccordionItem h='75%'>
                    <AccordionButton h={10} gap={2} borderBottomWidth={1}>
                      <AccordionIcon />
                      <FiAlignJustify />
                      <Text fontWeight={500}>Instructions</Text>
                    </AccordionButton>
                    <AccordionPanel p={0} h='full' overflow='auto'
                                    motionProps={{ endingHeight: 'calc(100% - 2.5rem)' }}>
                      <MarkdownViewer children={task.instructions} data={task.files} />
                    </AccordionPanel>
                  </AccordionItem>
                  <AccordionItem h='25%' borderBottomColor='transparent' pos='relative'>
                    <AccordionButton h={10} gap={2} borderBottomWidth={1}>
                      <AccordionIcon />
                      <FiFile />
                      <Text fontWeight={500}>Files</Text>
                    </AccordionButton>
                    <ButtonGroup variant='ghost' size='sm' colorScheme='blackAlpha' pos='absolute' right={3} top={1}>
                      <IconButton icon={<Icon as={HiDownload} boxSize={5} />} aria-label='download' onClick={() => {
                        let zip = new JSZip()
                        task.files.forEach(file => zip.file(file.path, getContent(file)))
                        zip.generateAsync({ type: 'blob' }).then(b => fileDownload(b, task.url + '.zip'))
                      }} />
                    </ButtonGroup>
                    <AccordionPanel p={0} h='full' overflow='auto'
                                    motionProps={{ endingHeight: 'calc(100% - 2.5rem)' }}>
                      <FileTree data={task.files} value={currentFile.id}
                                onClick={file => setCurrentFile(updateFile(file, currentSubmission))} />
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
                <Stack spacing={0} flexGrow={1} overflow='hidden'>
                  <FileTabs values={openFiles} defaultValue={currentFile.id} onSelect={setCurrentFile}
                            onReorder={setOpenFiles} />
                  <SplitHorizontal>
                    <Stack h='full' spacing={0} borderTopWidth={1} borderColor='blackAlpha.200' overflow='hidden'>
                      <Editor path={getPath(currentFile.id)} defaultValue={currentFile.content || currentFile.template}
                              language='python' theme='light'
                              options={{ minimap: { enabled: false }, readOnly: !currentFile.editable }} />
                      {currentFile.image && <ImagePanel src={currentFile.template} />}
                    </Stack>
                    <Stack flexGrow={1} flexDir='column-reverse' overflow='auto' px={2} bg='blackAlpha.800'>
                      {task.submissions.map(submission =>
                          <Box key={submission.id} py={2}>
                            <HStack align='start'>
                              <Code color='orange.300'>{'>'}</Code>
                              <Code whiteSpace='pre-wrap'>{submission.name}</Code>
                            </HStack>
                            <HStack align='start'>
                              <Code color='orange.300'>$</Code>
                              <Code whiteSpace='pre-wrap' opacity={submission.output ? 1 : 0.8}>
                                {submission.output || 'No output'}
                              </Code>
                            </HStack>
                          </Box>)}
                    </Stack>
                  </SplitHorizontal>
                </Stack>
              </SplitVertical>
              <SidePanel>
                {task.submissions.map(submission =>
                    <Flex key={submission.id} gap={2} fontSize='sm'>
                      <VStack>
                        <Icon as={BsCircleFill} mx={2} mt={1} boxSize={2} color='purple.500' />
                        <Divider orientation='vertical' borderColor='gray.500' />
                      </VStack>
                      <Stack mb={8}>
                        <HStack align='baseline' lineHeight={1.2}>
                          <Text fontWeight={500}>{submission.name}</Text>
                          {!submission.valid && <Badge colorScheme='red'>Not valid</Badge>}
                        </HStack>
                        <Text whiteSpace='nowrap' w='fit-content' pl={1} fontSize='75%'>
                          {format(parseISO(submission.createdAt), 'dd.MM.yyyy HH:mm')}
                        </Text>
                        {submission.graded &&
                          <Box>
                            <HStack spacing={1} fontSize={{ base: 'xs', xl: 'md' }}>
                              <Text fontWeight={600} fontSize='lg'>{submission.valid ? submission.points : '?'}</Text>
                              <Text fontSize='md' lineHeight={1}>/ {submission.maxPoints} Points</Text>
                            </HStack>
                            <ProgressBar value={submission.points} max={submission.maxPoints} />
                          </Box>}
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
                          <Button leftIcon={<AiOutlineReload />}
                                  onClick={() => reload(submission)}>
                            Reload
                          </Button>
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
                  </Stack>
                </Flex>
              </SidePanel>
            </Flex>
          </Screen>}
      </AnimatePresence>
  )
}