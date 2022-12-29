import {
  Box, Button, ButtonGroup, Center, Heading, HStack, Stack, Table, TableCaption, TableContainer, Tag, TagLabel,
  TagLeftIcon, Tbody, Td, Text, Th, Thead, Tr
} from '@chakra-ui/react'
import React, { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { AddIcon } from '@chakra-ui/icons'
import { AiOutlineCalendar } from 'react-icons/ai'
import { Reorder } from 'framer-motion'
import { EditButton, UploadButton } from '../components/Buttons'


export default function Planner() {
  const { courseURL } = useParams()
  const [assignments, setAssignments] = useState<AssignmentProps[]>()
  const { data: course } = useQuery<CourseProps>(['courses', courseURL],
      { onSuccess: data => setAssignments(data.assignments) })
  const { mutateAsync: onImport } = useMutation<string, object, any>(['import'],
      { onSuccess: () => window.location.reload() })

  if (!course || !assignments)
    return <></>

  const onReorder = (tasks: any[]) =>
      tasks[0] && setAssignments(assignments.map(a => a.id === tasks[0].assignmentId ? { ...a, tasks } : a))

  return (
      <TableContainer p={8} my={4} layerStyle='segment' minW='container.lg'>
        <ButtonGroup variant='ghost' w='full' pb={4}>
          <Heading m={2} mt={0} fontSize='3xl'>Course Planner</Heading>
          <Button as={Link} to='../assignments' leftIcon={<AddIcon />}>
            Assignment
          </Button>
          <Box flexGrow={1} />
          <UploadButton onSubmit={onImport} />
        </ButtonGroup>
        <Table maxW='md'>
          <Thead>
            <Tr>
              <Th w={16}></Th>
              {assignments.map(assignment =>
                  <Th key={assignment.id} py={1}>
                    <HStack>
                      <Text>{`Assignment ${assignment.ordinalNum}`}</Text>
                      <EditButton to={`../assignments/${assignment.url}`} textTransform='capitalize' />
                    </HStack>
                  </Th>)}
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td fontWeight={500}>Title</Td>
              {assignments.map(assignment => <Td key={assignment.id}>{assignment.title}</Td>)}
            </Tr>
            <Tr>
              <Td fontWeight={500}>Dates</Td>
              {assignments.map(assignment =>
                  <Td key={assignment.id}>
                    <Stack>
                      <Tag bg='transparent'>
                        <TagLeftIcon as={AiOutlineCalendar} />
                        <TagLabel fontWeight={400}>
                          Start: <b>{assignment.duration.split('~')[0]}</b>
                        </TagLabel>
                      </Tag>
                      <Tag bg='transparent'>
                        <TagLeftIcon as={AiOutlineCalendar} />
                        <TagLabel fontWeight={400}>
                          End: <b>{assignment.duration.split('~')[1]}</b>
                        </TagLabel>
                      </Tag>
                    </Stack>
                  </Td>)}
            </Tr>
            <Tr verticalAlign='baseline'>
              <Td fontWeight={500}>Tasks</Td>
              {assignments.map(assignment =>
                  <Td key={assignment.id}>
                    <Reorder.Group values={assignment.tasks} onReorder={onReorder} style={{ display: 'grid', gap: 6 }}>
                      {assignment.tasks.map(task =>
                          <Reorder.Item key={task.id} drag value={task} id={`${task.assignmentId}-${task.id}`}>
                            <Center w='2xs' p={4} bg='purple.200'>
                              <Text>{task.title}</Text>
                            </Center>
                          </Reorder.Item>)}
                    </Reorder.Group>
                    <Button w='2xs' my={2} leftIcon={<AddIcon />} variant='ghost' as={Link}
                            to={`../assignments/${assignment.url}/tasks`} children='Task' />
                  </Td>)}
            </Tr>
          </Tbody>
          <TableCaption>
            {!assignments.length && <Center color='gray.400'>No assignments yet.</Center>}
          </TableCaption>
        </Table>
      </TableContainer>
  )
}