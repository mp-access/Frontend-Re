import { HamburgerIcon } from '@chakra-ui/icons'
import {
  Badge, Box, Button, ButtonGroup, Flex, Heading, HStack, Icon, IconButton, Popover, PopoverArrow, PopoverBody,
  PopoverContent, PopoverTrigger, Stack, Tag, TagLabel, Text, Tooltip, useBoolean, Wrap
} from '@chakra-ui/react'
import { format, parseISO } from 'date-fns'
import { motion } from 'framer-motion'
import React, { ComponentProps } from 'react'
import { IconType } from 'react-icons'
import { AiOutlineBulb, AiOutlineCalendar, AiOutlineClockCircle, AiOutlineRedo, AiOutlineReload } from 'react-icons/ai'
import { BsFileEarmarkCode, BsFileEarmarkText } from 'react-icons/bs'
import { CgInfinity } from 'react-icons/cg'
import { FaFlask, FaTerminal } from 'react-icons/fa'
import { Link, useMatch, useOutletContext, useResolvedPath } from 'react-router-dom'
import { ReactComponent as PythonIcon } from '../assets/python.svg'
import { ReactComponent as StarIcon } from '../assets/star.svg'
import { ImpersonateModal } from './Modals'
import { ScoreProgress } from './Stats'

export function NavbarButton(props: { label: string, to: string, isOpen?: boolean, icon: IconType }) {
  const targetPath = useResolvedPath(props.to)
  const currentPath = useMatch({ path: targetPath.pathname, end: !props.isOpen })
  return <Button as={Link} to={targetPath.pathname} variant='nav' leftIcon={<Icon as={props.icon} />}
                 isActive={!!currentPath}>{props.label}</Button>
}

export function LogoButton() {
  return <Text as={Link} to='/' fontFamily='"Courier Prime", monospace' fontSize='2.5em'
               fontWeight={400} lineHeight={1} mt={3} _hover={{ color: 'purple.500' }}>ACCESS.</Text>
}

export function CourseCard({ course }: { course: CourseProps }) {
  return (
      <Button as={Link} to={'/courses/' + course.url} p={6} h='xs' w='2xs' flexDir='column' rounded='3xl'
              variant='outline' bg='gradients.purple-light' borderWidth={6} borderColor='transparent'
              transition='0.2s ease-in-out' _hover={{ borderWidth: 10 }}>
        <Stack flexGrow={1} fontSize='xl' alignItems='start'>
          <Heading mb={2} color='purple.500' fontSize='2xl' whiteSpace='break-spaces'>{course.title}</Heading>
          <Text>{course.university}</Text>
          <Text>{course.semester}</Text>
        </Stack>
        <Text>{course.activeAssignmentsCount} Active Assignment{course.activeAssignmentsCount === 1 ? '' : 's'}</Text>
      </Button>
  )
}

export function AssignmentCard({ assignment }: { assignment: AssignmentProps }) {
  return (
      <Stack h='full' w='2xs' rounded='3xl' bg='white' boxShadow='md' borderWidth={1} spacing={3} p={4} pt={6} position='relative'>
        <Tag rounded='full' borderWidth={3} boxSize='3rem' boxShadow='base' position='absolute' top={-6} left={6}>
          <Icon as={PythonIcon} boxSize='full'/>
        </Tag>
        <Tag rounded='xl' borderWidth={3} boxShadow='base' gap={1} position='absolute' top={-6} right={5}>
          <Icon as={assignment.published ? AiOutlineClockCircle : AiOutlineCalendar} boxSize='1.1rem' color='purple.500'/>
          <TagLabel fontWeight={700} mt={0.5}>
            {format(parseISO(assignment.published ? assignment.endDate : assignment.startDate), 'dd-MM-yyyy')}
          </TagLabel>
        </Tag>
        <Stack minH='6rem' justify='end'>
          <Box>
            <Text fontSize='xs' fontWeight={400}>ASSIGNMENT {assignment.ordinalNum}</Text>
            <Heading fontSize='lg' whiteSpace='break-spaces'>{assignment.title}</Heading>
          </Box>
          <Wrap>
            {!assignment.published && <Tag colorScheme='red'>Draft</Tag>}
            <Tag>{assignment.tasksCount} Tasks</Tag>
          </Wrap>
        </Stack>
        <Tooltip label={assignment.description}>
          <Text h='4rem' fontSize='sm' noOfLines={3}>{assignment.description}</Text>
        </Tooltip>
        <ScoreProgress points={assignment.points} max={assignment.maxPoints} />
        <Button as={Link} to={`assignments/${assignment.url}/${assignment.defaultTaskNum}`} colorScheme='green' py={5}>
          Start
        </Button>
      </Stack>
  )
}

export function TaskCard({ task }: { task: TaskProps }) {
  const { isAssistant } = useOutletContext<CourseContext>()
  const targetPath = useResolvedPath(`../${task.ordinalNum}`)
  const currentPath = useMatch({ path: targetPath.pathname })
  return (
      <Button as={Link} to={'../' + task.ordinalNum.toString()} variant='ghost' h='7.5rem' w='15rem' mt={5}
              _active={{ bg: 'gradients.purple-gray', borderColor: 'transparent' }} transition='0.2s ease-in-out'
               p={2} borderWidth={2} boxShadow='sm' isActive={!!currentPath}>
        <Stack w='full' h='full' justify='space-between'>
          <HStack>
            <Icon as={task.type === 'code' ? BsFileEarmarkCode : BsFileEarmarkText} boxSize='1.5rem'/>
            <Box>
              <Text fontSize='xs' fontWeight={400}>TASK {task.ordinalNum}</Text>
              <Text fontSize={task.title.length > 20 ? 'sm' : 'md'} whiteSpace='break-spaces'>{task.title}</Text>
            </Box>
          </HStack>
          {task.graded &&
            <Tag size='sm' rounded='xl' borderWidth={2} boxShadow='base' gap={1} position='absolute' top={-5} right={2}>
              <Icon as={StarIcon} boxSize='1rem'/>
              <TagLabel fontWeight={700}>{task.points} / {task.maxPoints} EXP</TagLabel>
            </Tag>}
          {task.graded && <ScoreProgress points={task.points} max={task.maxPoints} />}
          {task.limited &&
            <Stack spacing={1}>
              {task.maxAttempts < 12 &&
                <Wrap spacing={1}>
                  {[...Array(task.maxAttempts)].map((_, index) =>
                    <Box key={index} h='7px' w='1.1rem'
                         bg={isAssistant || index < task.remainingAttempts ? 'green.500' : 'gray.200'}/>)}
                </Wrap>}
              <Text as={Flex} alignItems='center' fontSize='xs' fontWeight={400}>
                {isAssistant ? <CgInfinity /> : task.remainingAttempts} / {task.maxAttempts} Submissions left
              </Text>
            </Stack>}
        </Stack>
      </Button>
  )
}

export function FileMenuButton(props: ComponentProps<any>) {
  const itemVariants = {
    open: { y: 0, zIndex: 2, opacity: 1, transition: { y: { stiffness: 1000 } } },
    closed: { y: -30, zIndex: -1, opacity: 0, transition: { y: { stiffness: 1000 } } }
  }
  return (
      <Tooltip label={props.label}>
        <IconButton as={motion.button} icon={<props.icon />} boxShadow='sm' isRound aria-label={props.label}
                    bg={props.isHidden ? 'whiteAlpha.900' : undefined} colorScheme={props.isHidden ? 'gray' : 'lavender'}
                    isLoading={props.isLoading} isDisabled={props.isDisabled} onClick={props.onClick}
                    variant={props.isHidden ? 'outline' : 'solid'} variants={props.isHidden ? itemVariants : {}} />
      </Tooltip>
  )
}

export function SubmissionCard({ submission, onReload }: { submission: SubmissionProps, onReload: any }) {
  return (
      <Stack p={2} w='95%' borderWidth={2} boxShadow='sm'>
        <HStack justify='space-between'>
          <Box w='min-content'>
            <Tag px={1}>
              <TagLabel textOverflow='ellipsis' overflow='hidden' whiteSpace='nowrap'>
                {submission.graded ? '' : 'Executed '}{submission.name}
              </TagLabel>
            </Tag>
            <Text whiteSpace='nowrap' w='fit-content' pl={1} fontSize='0.7rem'>
              {format(parseISO(submission.createdAt), 'dd.MM.yyyy HH:mm')}
            </Text>
          </Box>
          {submission.graded && (submission.valid ?
            <Box minW='40%'>
              <HStack spacing={1}>
                <Text fontWeight={600} fontSize='xl' lineHeight={1.2}>{submission.points}</Text>
                <Text fontSize='lg'>/ {submission.maxPoints}</Text>
              </HStack>
              <ScoreProgress points={submission.points} max={submission.maxPoints} />
            </Box> : <Badge colorScheme='red'>Not valid</Badge>)}
        </HStack>
        <ButtonGroup size='sm' variant='outline' justifyContent='center'>
          <Popover>
            <PopoverTrigger>
              <Button isDisabled={!submission.graded || !submission.stdOut} leftIcon={<AiOutlineBulb />}>
                Hint
              </Button>
            </PopoverTrigger>
            <PopoverContent w='fit-content' maxW='15rem' maxH='sm'>
              <PopoverArrow />
              <PopoverBody bg='yellow.50' fontWeight={500} fontSize='sm'>{submission.stdOut}</PopoverBody>
            </PopoverContent>
          </Popover>
          <Button colorScheme='blue' leftIcon={<AiOutlineReload />} onClick={() => onReload(submission.id)}>
            Reload
          </Button>
        </ButtonGroup>
      </Stack>
  )
}

export function FloatingMenu({ onSubmit, onReset, loading }: { onSubmit: any, onReset: any, loading: boolean }) {
  const [isOpen, { toggle }] = useBoolean()
  const menuVariants = {
    open: { transition: { staggerChildren: 0 } },
    closed: { transition: { staggerChildren: 0.05 } }
  }
  return (
      <Stack as={motion.nav} initial={false} animate={isOpen ? 'open' : 'closed'}
             position='absolute' zIndex={2} top={12} right={8}>
        <FileMenuButton label='Run File' icon={FaTerminal} isLoading={loading} onClick={() => onSubmit('run')} />
        <FileMenuButton label='Test File' icon={FaFlask} isLoading={loading} onClick={() => onSubmit('test')} />
        <FileMenuButton label='Menu' onClick={toggle} icon={HamburgerIcon} />
        <Stack as={motion.div} variants={menuVariants}>
          {/*<FileMenuButton label='Save File' isHidden icon={AiOutlineSave} />*/}
          {/*<FileMenuButton icon={AiOutlineDownload} isHidden label='Download File' />*/}
          <FileMenuButton icon={AiOutlineRedo} isHidden label='Reset' onClick={onReset} />
        </Stack>
      </Stack>
  )
}

export function ControlPanel({ currentUser, onImpersonate }: { currentUser: string, onImpersonate: any }) {
  return (
      <ButtonGroup position='relative' borderWidth={2} rounded='xl' p={1} spacing={0}>
        <ImpersonateModal value={currentUser} onChange={onImpersonate} />
        <Text position='absolute' fontSize='xs' top={-2} left={3} lineHeight={1} bg='white' color='purple.600' px={1}>
          Control Panel
        </Text>
      </ButtonGroup>
  )
}