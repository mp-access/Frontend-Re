import { ButtonGroup, Flex, Icon, Tag, TagLabel, Text } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { AiOutlineAppstore, AiOutlineAudit, AiOutlineBarChart, AiOutlineCode, AiOutlineDashboard } from 'react-icons/ai'
import { useParams } from 'react-router-dom'
import { useFetch } from 'use-http'
import { ReactComponent as StarIcon } from '../assets/star.svg'
import { NavbarButton } from '../components/Buttons'
import { PullModal } from '../components/Modals'

export default function Navbar({ isSupervisor }: { isSupervisor: boolean }) {
  const { courseURL, assignmentURL } = useParams()
  const { data: course } = useFetch<CourseProps>('', [courseURL, assignmentURL])
  const [currentAssignment, setCurrentAssignment] = useState<AssignmentProps>()

  useEffect(() => {
    if (course?.assignments?.length && assignmentURL)
      setCurrentAssignment(course.assignments.find(a => a.url === assignmentURL))
  }, [course?.assignments, assignmentURL])

  if (!course?.assignments)
    return <></>

  return (
      <>
        <ButtonGroup px={0}>
          <NavbarButton label='My Courses' to='/' icon={AiOutlineAppstore} />
          <NavbarButton label={course.title} to={`courses/${courseURL}`} icon={AiOutlineDashboard} />
          {assignmentURL && currentAssignment &&
            <NavbarButton label={'Assignment '+currentAssignment.ordinalNum} isOpen icon={AiOutlineCode}
                          to={`courses/${courseURL}/assignments/${assignmentURL}`} />}
        </ButtonGroup>
        {isSupervisor &&
          <ButtonGroup position='relative' borderWidth={2} rounded='xl' p={1} spacing={0}>
            <NavbarButton label='Students' to={`courses/${courseURL}/students`} icon={AiOutlineAudit} />
            <NavbarButton label='Analytics' to={`courses/${courseURL}/analytics`} icon={AiOutlineBarChart} />
            <PullModal />
            <Text position='absolute' fontSize='xs' top={-2} left={3} lineHeight={1} bg='white' color='purple.600' px={1}>
              Supervisor Zone
            </Text>
          </ButtonGroup>}
          <Flex flexGrow={1} gap={2} align='center' justify='end'>
            <Tag gap={2} size='lg' rounded='2xl' borderWidth={3} bg='yellow.50' borderColor='yellow.400' boxShadow='base'>
              <Icon as={StarIcon} />
              <TagLabel fontWeight={700}>{course.points} EXP</TagLabel>
            </Tag>
          </Flex>
      </>
  )
}
