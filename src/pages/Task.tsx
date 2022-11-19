import {
  Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Badge, Box, Button, ButtonGroup, Center,
  CloseButton, Code, Divider, Flex, Grid, GridItem, Heading, HStack, Icon, IconButton, Image, Kbd, Modal, ModalBody,
  ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Popover, PopoverArrow, PopoverBody, PopoverContent,
  PopoverTrigger, Spinner, Stack, Table, Tbody, Td, Text, Th, Thead, Tr, useDisclosure, VStack
} from '@chakra-ui/react'
import Editor, { useMonaco } from '@monaco-editor/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { AnimatePresence, Reorder } from 'framer-motion'
import { filter } from 'lodash'
import { Uri } from 'monaco-editor'
import React, { useEffect, useState } from 'react'
import { AiOutlineBulb, AiOutlineCode, AiOutlineReload, AiOutlineSend } from 'react-icons/ai'
import { BsCircleFill, BsUpload } from 'react-icons/bs'
import { FaFlask, FaTerminal } from 'react-icons/fa'
import { FiAlignJustify, FiFile } from 'react-icons/fi'
import { useOutletContext, useParams } from 'react-router-dom'
import { ScoreProgress } from '../components/Common'
import Description from '../components/Description'
import { FileTab } from '../components/FileTab'
import { FileTree } from '../components/FileTree'
import { SplitHorizontal, SplitVertical } from '../components/Panels'
import TaskController from './TaskController'
import { HiDownload, HiUpload } from 'react-icons/hi'
import JSZip from 'jszip'
import fileDownload from 'js-file-download'

export default function Task() {
  const monaco = useMonaco()
  const confirm = useDisclosure()
  const upload = useDisclosure()
  const { taskURL } = useParams()
  const { isAssistant, user } = useOutletContext<UserContext>()
  const [userId, setUserId] = useState(user.email)
  const [submissionId, setSubmissionId] = useState<number>()

  const [currentFile, setCurrentFile] = useState<TaskFileProps>()
  const [openFiles, setOpenFiles] = useState<TaskFileProps[]>([])

  const { data: tasks } = useQuery<TaskOverview[]>(['tasks'])
  const { data: task } = useQuery<TaskProps>(['tasks', taskURL, 'users', userId, submissionId && 'submissions', submissionId])
  const { mutate: submit, isLoading } = useMutation<any, any, object>(['submit'], { onSuccess: confirm.onClose })

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

  const getContent = (f: TaskFileProps) => monaco?.editor.getModel(Uri.file(`/${f.id}`))?.getValue() || f.content || f.template
  const getFiles = () => task.files.filter(f => f.editable).map(f => ({ taskFileId: f.id, content: getContent(f) }))
  const onSubmit = (type: string) => () => submit({
    taskId: task.id,
    currentFileId: currentFile.id,
    files: getFiles(),
    type
  })

  return (
      <Stack flexGrow={1} w='full'>
        <Center px={4} pt={1} flexGrow={1} justifyContent='space-between'>
          <Box>
            <Heading fontSize='sm'>TASK {task.ordinalNum}</Heading>
            <Heading fontSize='lg' noOfLines={1}>{task.title}</Heading>
          </Box>
          <HStack>
            {((!isAssistant && task.active) || userId !== user?.email) &&
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
            <Button colorScheme='green' leftIcon={<AiOutlineSend />} onClick={confirm.onOpen} children='Submit'
                    isDisabled={isLoading || (!task.active && !isAssistant)} />
            <Modal size='sm' isOpen={confirm.isOpen} onClose={confirm.onClose} isCentered closeOnOverlayClick>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>
                  <Text textAlign='center' color='purple.600'>Confirm Submission</Text>
                  <ModalCloseButton />
                </ModalHeader>
                <ModalBody>
                  <VStack p={3} minH={12} justify='space-between'>
                    <Text textAlign='center'>
                      Are you sure you want to submit?
                    </Text>
                    <ButtonGroup variant='round'>
                      <Button variant='border' isLoading={isLoading} onClick={confirm.onClose}>Cancel</Button>
                      <Button isLoading={isLoading} onClick={onSubmit('grade')}>Confirm</Button>
                    </ButtonGroup>
                  </VStack>
                </ModalBody>
              </ModalContent>
            </Modal>
          </ButtonGroup>
          {isAssistant &&
            <TaskController task={task} value={userId} defaultValue={user.email} onChange={setUserId} />}
        </Center>
        <Grid templateRows='85vh' templateColumns='85vw auto' boxShadow='xs' bg='base'>
          <GridItem as={Flex} boxSize='full'>
            <SplitVertical>
              <Accordion allowMultiple defaultIndex={[0, 1]}>
                <AccordionItem>
                  <AccordionButton gap={2} borderBottomWidth={1}>
                    <AccordionIcon />
                    <FiAlignJustify />
                    <Text fontWeight={500}>Instructions</Text>
                  </AccordionButton>
                  <AccordionPanel maxH='60vh' overflow='auto'>
                    <Description task={task} />
                  </AccordionPanel>
                </AccordionItem>
                <AccordionItem pos='relative' borderBottomColor='transparent'>
                  <AccordionButton gap={2} borderBottomWidth={1}>
                    <AccordionIcon />
                    <FiFile />
                    <Text fontWeight={500}>Files</Text>
                  </AccordionButton>
                  <ButtonGroup variant='ghost' size='sm' colorScheme='blackAlpha' pos='absolute' right={3} top={1}>
                    <IconButton icon={<Icon as={HiUpload} boxSize={5} />} aria-label='upload' onClick={upload.onOpen} />
                    <IconButton icon={<Icon as={HiDownload} boxSize={5} />} aria-label='download' onClick={() => {
                      let zip = new JSZip()
                      task.files.forEach(file => zip.file(file.path, getContent(file)))
                      zip.generateAsync({ type: 'blob' }).then(b => fileDownload(b, task.url + '.zip'))
                    }} />
                    <Modal isOpen={upload.isOpen} onClose={upload.onClose} isCentered closeOnOverlayClick>
                      <ModalOverlay />
                      <ModalContent>
                        <ModalHeader>
                          <Text textAlign='center' color='purple.600'>Upload Your Solution Files</Text>
                          <ModalCloseButton />
                        </ModalHeader>
                        <ModalBody>
                          <VStack p={3} justify='space-between'>
                            <Table>
                              <Thead>
                                <Tr>
                                  <Th>Task File</Th>
                                  <Th>Your Solution</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {task.files.filter(file => file.editable).map(file =>
                                    <Tr key={file.id}>
                                      <Td>{file.name}</Td>
                                      <Td>
                                        <Button leftIcon={<BsUpload />}>
                                          Select
                                        </Button>
                                      </Td>
                                    </Tr>)}
                              </Tbody>
                            </Table>
                            <ButtonGroup variant='round' p={3}>
                              <Button variant='border' isLoading={isLoading} onClick={upload.onClose}>Cancel</Button>
                              <Button isLoading={isLoading}>Confirm</Button>
                            </ButtonGroup>
                          </VStack>
                        </ModalBody>
                      </ModalContent>
                    </Modal>
                  </ButtonGroup>
                  <AccordionPanel px={0}>
                    <FileTree data={task.files} value={currentFile.id} onChange={setCurrentFile} />
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </SplitVertical>
            <Stack spacing={0} boxSize='full' overflow='auto' position='relative'>
              <Flex borderBottomWidth={1} borderColor='gray.200' p={1} pb={0} bg='blackAlpha.50'>
                <Reorder.Group as='ul' axis='x' onReorder={setOpenFiles} values={openFiles} style={{ display: 'flex' }}>
                  <AnimatePresence initial={false}>
                    {openFiles.map(file =>
                        <FileTab key={file.id} value={file} isSelected={file.id === currentFile.id}>
                          <Text ml={3} my={2} fontFamily='Inter, Roboto, sans-serif' whiteSpace='nowrap'
                                onClick={() => setCurrentFile(file)} cursor='pointer' children={file.name} />
                          <CloseButton size='sm' mx={2} isDisabled={file.id === currentFile.id}
                                       onClick={() => setOpenFiles(filter(openFiles, f => f.id !== file.id))} />
                        </FileTab>)}
                  </AnimatePresence>
                </Reorder.Group>
              </Flex>
              <SplitHorizontal>
                <Editor loading={<Spinner />} path={`${currentFile.id}`} language={currentFile.language}
                        defaultValue={currentFile.content || currentFile.template}
                        options={{ minimap: { enabled: false }, readOnly: !currentFile.editable }} />
                {currentFile.image &&
                  <Center p={2} position='absolute' bottom={0} bg='white' boxSize='full' zIndex={2}>
                    <Image src={`data:image/png;base64,${currentFile.bytes}`} h='auto' />
                  </Center>}
              </SplitHorizontal>
              <Stack boxSize='full' overflow='auto' p={2} bg='blackAlpha.800'>
                {task.submissions.map(submission =>
                    <Box key={submission.id}>
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
            </Stack>
          </GridItem>
          <GridItem as={Stack} bg='blackAlpha.100' borderLeftWidth={2} borderColor='blackAlpha.100' p={2}>
            <Heading fontSize='md' m={3}>Activity</Heading>
            {task.submissions.map(submission =>
                <Flex key={submission.id} gap={2} fontSize='sm'>
                  <VStack>
                    <Icon as={BsCircleFill} mx={2} mt={1} boxSize={2} color='purple.500' />
                    <Divider orientation='vertical' borderColor='gray.500' />
                  </VStack>
                  <Stack mb={8}>
                    <HStack align='baseline' lineHeight={1.2}>
                      <Text fontWeight={500}>{submission.graded ? '' : 'Executed'}</Text>
                      <Kbd m={0} px={1} rounded='sm' fontSize='95%' textTransform='capitalize'>{submission.type}</Kbd>
                    </HStack>
                    {!submission.valid && <Badge colorScheme='red'>Not valid</Badge>}
                    <Text whiteSpace='nowrap' w='fit-content' pl={1} fontSize='0.7rem'>
                      {format(parseISO(submission.createdAt), 'dd.MM.yyyy HH:mm')}
                    </Text>
                    {submission.graded &&
                      <Box>
                        <HStack spacing={1}>
                          <Text fontWeight={600} fontSize='xl'>{submission.points}</Text>
                          <Text fontSize='lg' lineHeight={1}>/ {submission.maxPoints} Points</Text>
                        </HStack>
                        <ScoreProgress value={submission.points} max={submission.maxPoints} />
                      </Box>}
                    <ButtonGroup size='xs' colorScheme='gray'>
                      <Popover>
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
                      <Button leftIcon={<AiOutlineReload />} onClick={() => setSubmissionId(submission.id)}>
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
          </GridItem>
        </Grid>
      </Stack>
  )
}