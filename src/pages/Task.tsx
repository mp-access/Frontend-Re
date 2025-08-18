/* eslint-disable react-hooks/exhaustive-deps */
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Button,
  ButtonGroup,
  Center,
  Code,
  Divider,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  SimpleGrid,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  Text,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react"
import Editor from "@monaco-editor/react"
import { format, parseISO } from "date-fns"
import fileDownload from "js-file-download"
import JSZip from "jszip"
import { compact, find, range, unionBy } from "lodash"
import React, { useEffect, useMemo, useState } from "react"
import Countdown from "react-countdown"
import { useTranslation } from "react-i18next"
import { AiOutlineBulb, AiOutlineCode, AiOutlineReload } from "react-icons/ai"
import { BsCircleFill } from "react-icons/bs"
import { FcFile, FcInspection, FcTimeline, FcTodoList } from "react-icons/fc"
import { HiDownload } from "react-icons/hi"
import { useNavigate, useOutletContext, useParams } from "react-router-dom"
import {
  ActionButton,
  ActionTab,
  NextAttemptAt,
  TooltipIconButton,
} from "../components/Buttons"
import { CountdownTimer } from "../components/CountdownTimer"
import { FileTabs } from "../components/FileTab"
import { FileTree } from "../components/FileTree"
import {
  useCodeEditor,
  useExample,
  useSSE,
  useTask,
  useTimeframeFromSSE,
} from "../components/Hooks"
import { Markdown, Placeholder, TaskIO, TaskView } from "../components/Panels"
import { ScoreBar, ScorePie } from "../components/Statistics"
import { createDownloadHref, detectType } from "../components/Util"
import { TaskController } from "./Supervisor"

export default function Task({ type }: { type: "task" | "example" }) {
  const { i18n, t } = useTranslation()
  const currentLanguage = i18n.language
  const editor = useCodeEditor()
  const navigate = useNavigate()
  const toast = useToast()
  const { courseSlug } = useParams()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isAssistant, user } = useOutletContext<UserContext>()
  const [taskId, setTaskId] = useState(-1)
  const [submissionId, setSubmissionId] = useState<number | null>(null)
  const [currentTab, setCurrentTab] = useState(0)
  const [currentFile, setCurrentFile] = useState<TaskFileProps>()
  const [editableFiles, setEditableFiles] = useState<TaskFileProps[]>([])
  const [editorReload, setEditorReload] = useState(1) // counts up every time Editor should re-render
  const [openFiles, setOpenFiles] = useState<TaskFileProps[]>([])
  const { base64EncodedUserId } = useParams()
  const inspectionUserId = base64EncodedUserId
    ? atob(base64EncodedUserId)
    : null
  const [userId, setUserId] = useState(inspectionUserId ?? user.email)
  const { timeFrameFromEvent } = useTimeframeFromSSE()
  const { exampleSlug } = useParams()
  const {
    data: task,
    submit,
    refetch,
    timer,
    // eslint-disable-next-line react-hooks/rules-of-hooks
  } = type == "task" ? useTask(userId) : useExample(userId)
  useSSE<string>("example-reset", (data) => {
    toast({ title: data, duration: 3000 })
    navigate(`/courses/${courseSlug}/examples`)
  })

  useSSE<string>("inspect", (editorURL) => {
    if (!editorURL) {
      return
    }
    const splitUrl = editorURL.split("/")
    const id = splitUrl[splitUrl.length - 1]

    const idxOfExamples = splitUrl.indexOf("examples")
    const urlExampleSlug =
      idxOfExamples !== -1 ? splitUrl[idxOfExamples + 1] : null

    // only set user id sent from SSE if event comes from example currently inspected
    if (urlExampleSlug && urlExampleSlug === exampleSlug) {
      setUserId(atob(id))
    }
  })

  const getUpdate = (file: TaskFileProps, submission?: WorkspaceProps) =>
    submission?.files?.find((s) => s.taskFileId === file.id)?.content ||
    file.template

  useEffect(() => {
    if (!isAssistant && task && task.status === "Planned") {
      navigate("../")
    }
  }, [task, isAssistant, navigate])

  const [derivedStartDate, derivedEndDate] = useMemo(() => {
    if (!task) {
      return [null, null]
    }

    if (timeFrameFromEvent) {
      return timeFrameFromEvent
    }

    if (!task.start || !task.end) {
      return [null, null]
    }

    return [Date.parse(task.start), Date.parse(task.end)]
  }, [task, timeFrameFromEvent])

  const showTestCommand = useMemo(() => {
    if (!task) return false

    if (!isAssistant && type === "example") {
      return false
    }

    return task.testCommandAvailable
  }, [task, isAssistant, type])

  const showRunCommand = useMemo(() => {
    if (!task) return false

    return task.runCommandAvailable
  }, [task])

  const enableSubmitCommand = useMemo(() => {
    if (!task) return false

    if (
      task.nextAttemptAt === null &&
      derivedEndDate &&
      Date.now() < derivedEndDate
    )
      return true // no submissions yet & time not up, so enabled

    return Date.parse(task.nextAttemptAt) < Date.now()
  }, [task])

  useEffect(() => {
    if (!task || !derivedEndDate || derivedEndDate < Date.now()) return

    const interval = setInterval(() => {
      if (derivedEndDate < Date.now()) {
        refetch()
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [derivedEndDate])

  useEffect(() => {
    if (task) {
      if (
        taskId < 0 ||
        taskId != task.id ||
        submissionId !== task.submissions[0]?.id
      ) {
        const defaultFiles = task.files.filter((file) => file.editable)
        const submission = task.submissions[0]
        if (submission) {
          const updatedFiles = defaultFiles.map((file) => ({
            ...file,
            content: getUpdate(file, submission),
          }))
          setSubmissionId(task.submissions[0].id)
          setEditableFiles(updatedFiles)
        } else {
          setSubmissionId(-1)
          setEditableFiles(defaultFiles)
        }
      }
    }
  }, [task, userId])
  useEffect(() => {
    if (task) {
      if (submissionId == -1 || submissionId == null) {
        const defaultFiles = task.files.filter((file) => file.editable)
        setEditableFiles(defaultFiles)
      } else {
        const submission =
          find(task.submissions, { id: submissionId }) || task.submissions[0]
        const updatedFiles = editableFiles.map((file) => ({
          ...file,
          content: getUpdate(file, submission),
        }))

        setEditableFiles(updatedFiles)
      }
    }
  }, [submissionId])
  useEffect(() => {
    if (task) {
      if (currentFile == undefined || taskId != task.id) {
        setOpenFiles(editableFiles)
        setCurrentFile(editableFiles[0])
      } else {
        setOpenFiles((files) =>
          unionBy(
            files,
            files.map((file) => find(editableFiles, { id: file.id }) || file),
            "id",
          ),
        )
        setCurrentFile((file) => file && find(editableFiles, { id: file.id }))
      }
      setTaskId(task.id)
      setEditorReload(editorReload + 1)
    }
  }, [editableFiles])

  useEffect(() => {
    if (currentFile)
      setOpenFiles((files) => unionBy(files, [currentFile], "id"))
  }, [currentFile])

  if (!task || !currentFile) return <Placeholder />

  const commands: string[] = compact([
    task.testCommandAvailable && "test",
    "run",
    "grade",
  ])
  const isPrivileged = isAssistant && userId === user.email

  const getPath = (id: number) => `${id}/${user.email}/${submissionId}`
  const getTemplate = (name: string) => {
    if (!name.startsWith("/")) {
      name = "/" + name
    }
    const file = find(task?.files, { path: name })
    if (!file) return ""
    return `data:${file.mimeType};base64,` + file.templateBinary
  }

  const getContent = (file: TaskFileProps) =>
    editor.getContent(getPath(file.id)) || file.template

  const onSubmit = (command: string) => () =>
    submit({
      restricted: !isAssistant,
      command,
      files: editableFiles.map((f) => ({
        taskFileId: f.id,
        content: getContent(f),
      })),
    })
      .then(() => setCurrentTab(commands.indexOf(command)))
      .then(onClose)

  const refill = () =>
    toast({
      title: "+1 attempt! Refreshing...",
      duration: 3000,
      onCloseComplete: refetch,
    })

  const submissionName = (command: string, ordinalNum: number) => {
    const commandMap = {
      grade: "Submission_n",
      test: "Test_n",
      run: "Run_n",
    }
    return t(commandMap[command as keyof typeof commandMap], {
      ordinalNum: ordinalNum,
    })
  }

  const reload = (submission: SubmissionProps) => {
    toast({
      title:
        "Reloaded " + submissionName(submission.command, submission.ordinalNum),
      isClosable: true,
    })
    setSubmissionId(submission.id)
  }

  const reset = () => {
    toast({ title: "Reset files to template", isClosable: true })
    setSubmissionId(-1)
  }
  const instructionFile =
    task.information[currentLanguage]?.instructionsFile ||
    task.information["en"].instructionsFile
  const instructionsContent = task.files.filter(
    (file) => file.path === `/${instructionFile}`,
  )[0]?.template
  return (
    <Flex boxSize="full">
      <ButtonGroup
        layerStyle="float"
        pos="absolute"
        variant="ghost"
        top={2}
        right={210}
        isAttached
        zIndex={2}
      >
        {showTestCommand && (
          <ActionButton
            name="Test"
            color="gray.600"
            isLoading={!!timer}
            onClick={onSubmit("test")}
          />
        )}
        {showRunCommand ? (
          <ActionButton
            name="Run"
            color="gray.600"
            isLoading={!!timer}
            onClick={onSubmit("run")}
          />
        ) : null}

        <Button
          colorScheme="green"
          leftIcon={<FcInspection />}
          onClick={onOpen}
          children={t("Submit")}
          isDisabled={
            !!timer ||
            (!isAssistant &&
              (task.remainingAttempts <= 0 || !enableSubmitCommand))
          }
        />
        <Modal
          size="sm"
          isOpen={isOpen}
          onClose={onClose}
          isCentered
          closeOnOverlayClick={!timer}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <Text textAlign="center" color="purple.600">
                {t("Confirm submission")}
              </Text>
              <ModalCloseButton />
            </ModalHeader>
            <ModalBody>
              <VStack p={3} justify="space-between" fontSize="lg">
                <Text textAlign="center">
                  {t("Are you sure you want to submit")}?
                </Text>
                <Flex h={10}>
                  {!!timer && (
                    <Countdown
                      date={timer}
                      daysInHours
                      renderer={({ formatted }) => (
                        <Text>
                          {t("Remaining Time")}:{" "}
                          <b>
                            {formatted.minutes}:{formatted.seconds}
                          </b>
                        </Text>
                      )}
                    />
                  )}
                </Flex>
                <ButtonGroup>
                  <Button
                    isLoading={!!timer}
                    onClick={onClose}
                    variant="outline"
                    children={t("Cancel")}
                  />
                  <Button
                    isLoading={!!timer}
                    onClick={onSubmit("grade")}
                    children={t("Submit")}
                  />
                </ButtonGroup>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </ButtonGroup>
      <TaskView>
        <Stack h="full" spacing={0} overflow="hidden">
          {isAssistant && (
            <TaskController
              value={userId}
              defaultValue={user.email}
              onChange={setUserId}
              obfuscateUserId={!!inspectionUserId}
            />
          )}
          <Accordion
            display="flex"
            flexDir="column"
            flexGrow={1}
            overflow="hidden"
            allowMultiple
            defaultIndex={[0, 1]}
          >
            <AccordionItem display="flex" flexDir="column" overflow="hidden">
              <AccordionButton>
                <AccordionIcon />
                <FcTodoList />
                <Text>{t("Instructions")}</Text>
              </AccordionButton>
              <AccordionPanel
                p={2}
                pr={0}
                overflowY="scroll"
                motionProps={{ style: { display: "flex" } }}
              >
                <Markdown
                  children={instructionsContent}
                  transformImageUri={getTemplate}
                />
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem borderBottomColor="transparent" pos="relative">
              <AccordionButton>
                <AccordionIcon />
                <FcFile />
                <Text>{t("Files")}</Text>
              </AccordionButton>
              <ButtonGroup
                variant="ghost"
                size="sm"
                colorScheme="blackAlpha"
                pos="absolute"
                right={3}
                top={1}
              >
                <IconButton
                  icon={<Icon as={HiDownload} boxSize={5} />}
                  aria-label="download"
                  onClick={() => {
                    const zip = new JSZip()
                    task.files
                      .filter((file) => !file.editable)
                      .forEach((file) =>
                        zip.file(
                          `${task.slug}${file.path}`,
                          file.template || file.templateBinary,
                        ),
                      )
                    editableFiles.forEach((file) =>
                      zip.file(`${task.slug}${file.path}`, getContent(file)),
                    )
                    zip
                      .generateAsync({ type: "blob" })
                      .then((b) => fileDownload(b, task.slug + ".zip"))
                  }}
                />
              </ButtonGroup>
              <AccordionPanel p={0}>
                <FileTree
                  files={task.files}
                  selected={currentFile.path}
                  onSelect={(file) =>
                    setCurrentFile(find(editableFiles, { id: file.id }) || file)
                  }
                />
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Stack>
        <TaskIO>
          <FileTabs
            id={currentFile.id}
            files={openFiles}
            onSelect={setCurrentFile}
            onReorder={setOpenFiles}
          />
          {currentFile.binary || (
            <Editor
              key={editorReload}
              path={getPath(currentFile.id)}
              language={detectType(currentFile.name)}
              defaultValue={currentFile.content || currentFile.template}
              options={{
                minimap: { enabled: false },
                readOnly: !currentFile.editable,
              }}
            />
          )}
          {currentFile.binary && (
            <Center
              position="absolute"
              top={0}
              zIndex={currentFile.binary ? 1 : -2}
              bg="base"
            >
              {
                <Image
                  src={
                    `data:${currentFile.mimeType};base64,` +
                    currentFile.templateBinary
                  }
                  h="auto"
                  w="auto"
                />
              }
            </Center>
          )}
          <Tabs
            display="flex"
            flexDir="column"
            flexGrow={1}
            colorScheme="purple"
            borderTopWidth={1}
            index={currentTab}
            onChange={setCurrentTab}
          >
            <TabList overflow="hidden">
              {task.testCommandAvailable && (
                <Tab>
                  <ActionTab name="Test Output" />
                </Tab>
              )}
              <Tab>
                <ActionTab name="Run Output" />
              </Tab>
              <Tab>
                <HStack>
                  <FcInspection />
                  <Text>{t("Submission Output")}</Text>
                </HStack>
              </Tab>
            </TabList>
            <TabPanels flexGrow={1} pos="relative">
              {commands.map((command) => (
                <TabPanel key={command} layerStyle="tab">
                  {task.submissions
                    .filter((s) => s.command === command)
                    .map((submission) => (
                      <Box key={submission.id}>
                        <HStack align="start">
                          <Code color="orange.300">{">"}</Code>
                          <Code fontWeight={700} whiteSpace="pre-wrap">
                            {submissionName(
                              submission.command,
                              submission.ordinalNum,
                            )}
                          </Code>
                        </HStack>
                        <HStack align="start">
                          <Code color="orange.300">$</Code>
                          <Code
                            whiteSpace="pre-wrap"
                            opacity={submission.output ? 1 : 0.8}
                          >
                            {submission.output || "No output"}
                          </Code>
                        </HStack>
                        {submission.persistentResultFiles.map((file) => (
                          <HStack key={file.id} align="start">
                            <Code color="orange.300">{"-"}</Code>
                            <VStack align="start" spacing={0}>
                              <React.Fragment key={file.path}>
                                <Code whiteSpace="pre-wrap">
                                  File{" "}
                                  <a
                                    href={createDownloadHref(file)}
                                    download={file.path.split("/").pop()}
                                    style={{
                                      color: "purple",
                                      textDecoration: "underline",
                                    }}
                                  >
                                    {file.path}
                                  </a>
                                  :
                                </Code>
                                {(file.binary &&
                                  (() => {
                                    switch (detectType(file.path)) {
                                      case "jpg":
                                      case "png":
                                        return (
                                          <Image
                                            src={`data:${file.mimeType};base64,${file.contentBinary}`}
                                            h="auto"
                                            w="auto"
                                          />
                                        )
                                      default:
                                        return (
                                          <Code>
                                            Cannot render inline, download by
                                            clicking on the filename above
                                          </Code>
                                        )
                                    }
                                  })()) || (
                                  <Code whiteSpace="pre-wrap">
                                    {file.content}
                                  </Code>
                                )}
                              </React.Fragment>
                            </VStack>
                          </HStack>
                        ))}
                      </Box>
                    ))}
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </TaskIO>
        <Stack pos="sticky" minW="3xs" h="full" spacing={0}>
          {task.status === "Interactive" ? (
            <VStack p={4} w="full">
              <HStack>
                <Heading fontSize="xl">{t("Remaining Time")}</Heading>
              </HStack>
              <Divider />
              <CountdownTimer
                startTime={derivedStartDate}
                endTime={derivedEndDate}
                size="large"
                variant="circular"
              />
            </VStack>
          ) : null}
          {!isPrivileged &&
            (task.remainingAttempts <= 0 || !enableSubmitCommand) &&
            task.nextAttemptAt && (
              <NextAttemptAt date={task.nextAttemptAt} onComplete={refill} />
            )}
          {task.status !== "Interactive" ? (
            <SimpleGrid columns={2} w="full" fontSize="sm">
              <VStack borderRightWidth={1} spacing={0} h={32} pb={2}>
                <ScorePie value={task.points} max={task.maxPoints} />
                <Tag
                  size="sm"
                  colorScheme="purple"
                  fontWeight={400}
                  bg="purple.50"
                >
                  {t("Score")}
                </Tag>
              </VStack>
              <VStack h={32} p={2}>
                <SimpleGrid
                  columns={Math.min(task.maxAttempts, 5)}
                  gap={1}
                  flexGrow={1}
                  alignItems="center"
                >
                  {range(Math.min(task.maxAttempts, 10)).map((i) => (
                    <Center
                      key={i}
                      rounded="full"
                      boxSize={4}
                      borderWidth={2}
                      borderColor="purple.400"
                      bg={
                        isPrivileged || i < task.remainingAttempts
                          ? "gradients.500"
                          : "transparent"
                      }
                    />
                  ))}
                </SimpleGrid>
                <Text fontSize="lg">
                  <b>{isPrivileged ? "∞" : task.remainingAttempts}</b> /{" "}
                  {task.maxAttempts}
                </Text>
                <Tag
                  size="sm"
                  colorScheme="purple"
                  fontWeight={400}
                  bg="purple.50"
                >
                  {t("Submissions")}
                </Tag>
              </VStack>
            </SimpleGrid>
          ) : null}
          {derivedStartDate == null ||
          derivedEndDate == null ||
          derivedEndDate < Date.now() ? (
            <Accordion
              allowMultiple
              defaultIndex={[0]}
              overflow="hidden"
              flexGrow={1}
            >
              <AccordionItem boxSize="full">
                <AccordionButton>
                  <AccordionIcon />
                  <FcTimeline />
                  <Text title={t("pruning_help")}>{t("History")}</Text>
                </AccordionButton>
                <AccordionPanel
                  motionProps={{
                    style: { display: "flex", maxHeight: "100%" },
                  }}
                  p={0}
                  flexGrow={1}
                  overflow="scroll"
                >
                  {task.submissions.map((submission) => (
                    <SimpleGrid
                      templateColumns="1rem 1fr auto"
                      templateRows="auto auto"
                      key={submission.id}
                      fontSize="sm"
                      justifyItems="stretch"
                      justifyContent="space-between"
                    >
                      <VStack gridRow="span 2">
                        <Icon
                          as={BsCircleFill}
                          mx={2}
                          mt={1}
                          boxSize={2}
                          color="purple.500"
                        />
                        <Divider
                          orientation="vertical"
                          borderColor="gray.500"
                        />
                      </VStack>
                      <Box>
                        <Text lineHeight={1.2} fontWeight={500}>
                          {submissionName(
                            submission.command,
                            submission.ordinalNum,
                          )}
                        </Text>
                        <Text fontSize="2xs">
                          {format(
                            parseISO(submission.createdAt),
                            "dd.MM.yyyy HH:mm",
                          )}
                        </Text>
                        {!submission.valid && (
                          <Badge colorScheme="red" mr={1}>
                            Invalid
                          </Badge>
                        )}
                        {task.deadline &&
                          submission.createdAt > task.deadline && (
                            <Badge colorScheme="purple" mr={1}>
                              Late
                            </Badge>
                          )}
                      </Box>
                      <ButtonGroup size="sm" variant="ghost" spacing={1}>
                        <Popover placement="left">
                          <PopoverTrigger>
                            <IconButton
                              isDisabled={!submission.output}
                              bg="gray.10"
                              color="contra"
                              rounded="md"
                              aria-label={submission.graded ? "Hint" : "Output"}
                              fontSize="120%"
                              icon={
                                submission.graded ? (
                                  <AiOutlineBulb />
                                ) : (
                                  <AiOutlineCode />
                                )
                              }
                            />
                          </PopoverTrigger>
                          <PopoverContent
                            w="fit-content"
                            maxW="xl"
                            bg="yellow.50"
                          >
                            <PopoverArrow />
                            <PopoverBody
                              overflow="auto"
                              fontSize="sm"
                              whiteSpace="pre-wrap"
                              maxH="2xs"
                            >
                              {submission.output}
                            </PopoverBody>
                          </PopoverContent>
                        </Popover>
                        <TooltipIconButton
                          onClick={() => reload(submission)}
                          aria-label="Reload"
                          bg="gray.10"
                          color="contra"
                          icon={<AiOutlineReload />}
                        />
                      </ButtonGroup>
                      <Stack gridColumn="span 2" py={2} mb={4}>
                        {submission.graded && submission.valid && (
                          <ScoreBar
                            value={submission.points}
                            max={submission.maxPoints}
                            h={6}
                          />
                        )}
                      </Stack>
                    </SimpleGrid>
                  ))}
                  <Flex gap={2} fontSize="sm">
                    <VStack w={4}>
                      <Icon
                        as={BsCircleFill}
                        mx={2}
                        mt={1}
                        boxSize={2}
                        color="purple.500"
                      />
                      <Divider orientation="vertical" borderColor="gray.500" />
                    </VStack>
                    <Stack mb={8}>
                      <Text lineHeight={1.2} fontWeight={500}>
                        {t("Started task")}.
                      </Text>
                      <Button
                        size="xs"
                        leftIcon={<AiOutlineReload />}
                        onClick={reset}
                      >
                        {t("Reset")}
                      </Button>
                    </Stack>
                  </Flex>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          ) : null}
        </Stack>
      </TaskView>
    </Flex>
  )
}
