import {
  Accordion, AccordionButton, AccordionItem, AccordionPanel, Badge, Box, Button, ButtonGroup, Center, CloseButton, Flex,
  Heading, HStack, Icon, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Popover,
  PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger, Spinner, Stack, Tag, TagLabel, Text, useDisclosure, VStack
} from '@chakra-ui/react'
import Editor, { useMonaco } from '@monaco-editor/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { AnimatePresence, Reorder } from 'framer-motion'
import { filter } from 'lodash'
import { Uri } from 'monaco-editor'
import React, { useEffect, useState } from 'react'
import { AiOutlineBulb, AiOutlineCode, AiOutlineReload, AiOutlineSend } from 'react-icons/ai'
import { BsCircleFill, BsFileEarmarkCode } from 'react-icons/bs'
import { CgInfinity } from 'react-icons/cg'
import { FaFlask, FaTerminal } from 'react-icons/fa'
import { FiAlignJustify, FiBookmark, FiFile } from 'react-icons/fi'
import { useParams, useRouteLoaderData } from 'react-router-dom'
import { Card, ScoreProgress } from '../components/Common'
import Description from '../components/Description'
import { FileTab } from '../components/FileTab'
import { FileTree } from '../components/FileTree'
import { SplitHorizontal, SplitVertical } from '../components/Panels'
import TaskController from './TaskController'

export default function Task() {
  const { taskURL } = useParams()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isAssistant, user } = useRouteLoaderData('user') as UserContext
  const [userId, setUserId] = useState(user.email)
  const [submissionId, setSubmissionId] = useState<number>()

  const { data: task } = useQuery<TaskProps>(['tasks', taskURL, 'users', userId, submissionId && 'submissions', submissionId])
  const { data: tasks } = useQuery<TaskOverview[]>(['tasks'])
  const { mutate: submit, isLoading } = useMutation<any, any, object>(['submit'], { onSuccess: onClose })

  const [currentFile, setCurrentFile] = useState<TaskFileProps>()
  const [openFiles, setOpenFiles] = useState<TaskFileProps[]>([])
  const monaco = useMonaco()

  useEffect(() => {
    setCurrentFile(undefined)
    setOpenFiles([])
  }, [taskURL, userId, submissionId])

  useEffect(() => {
    setCurrentFile(file => file || task?.files[0])
  }, [task])

  useEffect(() => {
    setOpenFiles(files => (!currentFile || files.find(f => f.id === currentFile.id)) ? files : [...files, currentFile])
  }, [currentFile])

  if (!task || !tasks?.length || !openFiles.length || !currentFile)
    return <></>

  const getContent = (f: TaskFileProps) => monaco?.editor.getModel(Uri.file(`/${f.id}`))?.getValue() || f.content
  const getFiles = () => task.files.filter(f => f.editable).map(f => ({ taskFileId: f.id, content: getContent(f) }))
  const onSubmit = (type: string) => () => submit({
    taskId: task.id,
    currentFileId: currentFile.id,
    files: getFiles(),
    type
  })

  return (
      <Flex bg='base'>
        <Stack w='15vw' px={3}>
          {tasks.map(task =>
              <Card key={task.id} to={`../tasks/${task.url}`} h='7rem' p={2} rounded='2xl'>
                <Flex boxSize='full'>
                  <Icon as={BsFileEarmarkCode} boxSize='1.5rem' mr={2} />
                  <Box fontSize='xs'>
                    <Text>TASK {task.ordinalNum}</Text>
                    <Text lineHeight={1.1} noOfLines={2} mb={1} fontSize='md' fontWeight={500}>{task.title}</Text>
                    <Flex alignItems='center'>
                      {isAssistant ? <CgInfinity /> : task.remainingAttempts} / {task.maxAttempts} Submissions left
                    </Flex>
                  </Box>
                </Flex>
                <ScoreProgress value={task.points} max={task.maxPoints} />
              </Card>)}
        </Stack>
        <Stack w='85vw'>
          <HStack px={2}>
            <Box>
              <Heading fontSize='sm'>TASK {task.ordinalNum}</Heading>
              <Heading fontSize='lg' noOfLines={1}>{task.title}</Heading>
            </Box>
            <HStack flexGrow={1} justify='center'>
              {(!isAssistant || userId !== user?.email) &&
                <HStack>
                  <Text fontSize='120%' fontWeight={600}>
                    {task.remainingAttempts}
                  </Text>
                  <Text noOfLines={1}>/ {task.maxAttempts} Submissions left</Text>
                  <Icon as={BsCircleFill} boxSize={1} color='gray.300' mx={4} />
                </HStack>}
              <HStack>
                <HStack>
                  <Text whiteSpace='nowrap'>Best Score:</Text>
                  <Text fontSize='120%' fontWeight={600}>{task.points}</Text>
                  <Text whiteSpace='nowrap'>{` / ${task.maxPoints}`}</Text>
                </HStack>
                <ScoreProgress value={task.points} max={task.maxPoints} />
              </HStack>
            </HStack>
            <ButtonGroup variant='gradient'>
              <Button leftIcon={<FaFlask />} children='Test' isLoading={isLoading} onClick={onSubmit('test')} />
              <Button leftIcon={<FaTerminal />} children='Run' isLoading={isLoading} onClick={onSubmit('run')} />
              <Button colorScheme='green' leftIcon={<AiOutlineSend />} isDisabled={isLoading} onClick={onOpen}>
                Submit
              </Button>
              <Modal size='sm' isOpen={isOpen} onClose={onClose} isCentered closeOnOverlayClick>
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>
                    <Text textAlign='center' color='purple.600'>Confirm Submission</Text>
                    <ModalCloseButton />
                  </ModalHeader>
                  <ModalBody>
                    <VStack p={3} minH='8rem' justify='space-between'>
                      <Text textAlign='center'>
                        Are you sure you want to submit?
                      </Text>
                      <ButtonGroup variant='round'>
                        <Button variant='border' isLoading={isLoading} onClick={onClose} children='Cancel' />
                        <Button isLoading={isLoading} onClick={onSubmit('grade')} children='Confirm' />
                      </ButtonGroup>
                    </VStack>
                  </ModalBody>
                </ModalContent>
              </Modal>
            </ButtonGroup>
            {isAssistant &&
              <TaskController task={task} value={userId} defaultValue={user.email} onChange={setUserId} />}
          </HStack>
          <Flex w='full' h='85vh' boxShadow='xs' bg='base'>
            <SplitVertical>
              <Accordion h='full' allowMultiple defaultIndex={[0]}>
                <AccordionItem>
                  <AccordionButton gap={2}>
                    <FiAlignJustify />
                    Instructions
                  </AccordionButton>
                  <AccordionPanel maxH='60vh' overflow='auto'>
                    <Description task={task} />
                  </AccordionPanel>
                </AccordionItem>
                <AccordionItem>
                  <AccordionButton gap={2}>
                    <FiFile />
                    Files
                  </AccordionButton>
                  <AccordionPanel>
                    <FileTree data={task.files} value={currentFile.id} onChange={setCurrentFile} />
                  </AccordionPanel>
                </AccordionItem>
                <AccordionItem>
                  <AccordionButton gap={2}>
                    <FiBookmark />
                    History
                  </AccordionButton>
                  <AccordionPanel>
                    <VStack spacing={4}>
                      {!task.submissions.length && <Center color='gray.500'>No submissions yet.</Center>}
                      {task.submissions.map(submission =>
                          <Stack key={submission.id} p={2} w='95%' borderWidth={2} boxShadow='sm'>
                            <HStack justify='space-between'>
                              <Box w='min-content'>
                                <HStack>
                                  <Tag px={1}>
                                    <TagLabel textOverflow='ellipsis' overflow='hidden' whiteSpace='nowrap'>
                                      {submission.graded ? '' : 'Executed '}{submission.name}
                                    </TagLabel>
                                  </Tag>
                                  {!submission.valid && <Badge colorScheme='red'>Not valid</Badge>}
                                </HStack>
                                <Text whiteSpace='nowrap' w='fit-content' pl={1} fontSize='0.7rem'>
                                  {format(parseISO(submission.createdAt), 'dd.MM.yyyy HH:mm')}
                                </Text>
                              </Box>
                              {submission.graded &&
                                <Box minW='40%'>
                                  <HStack spacing={1}>
                                    <Text fontWeight={600} fontSize='xl'>{submission.points}</Text>
                                    <Text fontSize='lg' lineHeight={1}>/ {submission.maxPoints} Points</Text>
                                  </HStack>
                                  <ScoreProgress value={submission.points} max={submission.maxPoints} />
                                </Box>}
                            </HStack>
                            <ButtonGroup size='sm' variant='outline' justifyContent='center'>
                              <Popover>
                                <PopoverTrigger>
                                  <Button colorScheme='gray' isDisabled={!submission.output}
                                          leftIcon={submission.graded ? <AiOutlineBulb /> : <AiOutlineCode />}>
                                    {submission.graded ? 'Hint' : 'Output'}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent w='fit-content' bg='yellow.50'>
                                  <PopoverArrow />
                                  <PopoverBody overflow='auto' fontSize='sm' whiteSpace='pre-wrap' maxH='2xs'>
                                    {submission.output}
                                  </PopoverBody>
                                </PopoverContent>
                              </Popover>
                              <Button colorScheme='blue' leftIcon={<AiOutlineReload />}
                                      onClick={() => setSubmissionId(submission.id)}>
                                Reload
                              </Button>
                            </ButtonGroup>
                          </Stack>)}
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </SplitVertical>
            <Stack spacing={0} boxSize='full' overflow='auto' position='relative'>
              <Flex borderBottomWidth={1} borderColor='gray.200' p={1} pb={0}>
                <Reorder.Group as='ul' axis='x' onReorder={setOpenFiles} values={openFiles} style={{ display: 'flex' }}>
                  <AnimatePresence initial={false}>
                    {openFiles.map(file =>
                        <FileTab key={file.id} value={file} isSelected={file.id === currentFile.id}>
                          <Text ml={3} my={2} fontFamily='Inter, Roboto, sans-serif' whiteSpace='nowrap'
                                onClick={() => setCurrentFile(file)} cursor='pointer'>
                            {file.name}
                          </Text>
                          <CloseButton size='sm' mx={2} isDisabled={file.id === currentFile.id}
                                       onClick={() => setOpenFiles(filter(openFiles, f => f.id !== file.id))} />
                        </FileTab>)}
                  </AnimatePresence>
                </Reorder.Group>
              </Flex>
              <SplitHorizontal>
                <Flex boxSize='full' position='relative'>
                  <Editor loading={<Spinner />} path={`${currentFile.id}`} language={currentFile.language}
                          defaultValue={currentFile.content || currentFile.template}
                          options={{ minimap: { enabled: false }, readOnly: !currentFile.editable }} />
                  {currentFile.image &&
                    <Center p={2} position='absolute' bottom={0} bg='white' boxSize='full' zIndex={2}>
                      <Image src={`data:image/png;base64,${currentFile.bytes}`} h='auto' />
                    </Center>}
                </Flex>
              </SplitHorizontal>
              <Stack boxSize='full' overflow='auto' p={2} fontSize='sm' color='whiteAlpha.900' bg='blackAlpha.900'
                     fontFamily='"Source Code Pro", monospace' lineHeight={1.2}>
                {task.submissions.map(submission =>
                    <Stack key={submission.id} spacing={0}>
                      <HStack align='start'>
                        <Text whiteSpace='nowrap' color='orange.300'>{'>'}</Text>
                        <Text whiteSpace='pre-wrap'>{submission.name}</Text>
                      </HStack>
                      <HStack align='start'>
                        <Text whiteSpace='nowrap' color='orange.300'>$</Text>
                        <Text whiteSpace='pre-wrap' color={submission.output ? 'inherit' : 'whiteAlpha.600'}>
                          {submission.output || 'No output'}
                        </Text>
                      </HStack>
                    </Stack>)}
              </Stack>
            </Stack>
          </Flex>
        </Stack>
      </Flex>
  )
}