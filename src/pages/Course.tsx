import {
  Box, Center, Flex, Heading, HStack, Icon, Spinner, Stack, Tag, TagLabel, Text, Tooltip
} from '@chakra-ui/react'
import { format, parseISO } from 'date-fns'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import React from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { useFetch } from 'use-http'
import { ReactComponent as StarIcon } from '../assets/star.svg'
import { AssignmentCard } from '../components/Buttons'
import { AssignmentScore } from '../components/Stats'

export default function Course() {
  const { isAssistant } = useOutletContext<CourseContext>()
  const { data: assignments } = useFetch<Array<AssignmentProps>>('/assignments', [])
  const navigate = useNavigate()
  const activeAssignments = assignments?.filter(a => a.active || !a.published) || []

  if (!assignments || !activeAssignments)
    return <Center flexGrow={1}><Spinner size='xl' /></Center>

  return (
      <Flex flexGrow={1} p={6} gap={8}>
        <Stack flexGrow={1} spacing={8} rounded='3xl' bg='white'>
          <Stack spacing={8} w='fit-content'>
            <Heading fontSize='xl'>Active {isAssistant ? '& Upcoming': ''} Assignments</Heading>
            <HStack spacing={8}>
              {activeAssignments[0] && <AssignmentCard assignment={activeAssignments[0]} />}
              {activeAssignments[1] && <AssignmentCard assignment={activeAssignments[1]} />}
              {activeAssignments[2] && <AssignmentCard assignment={activeAssignments[2]} />}
            </HStack>
          </Stack>
          <DataTable value={assignments} rowHover paginator rows={3}
                     onRowClick={event => navigate(`assignments/${event.data.url}/${event.data.defaultTaskNum}`)}
                     header={() => <Heading mb={1} mt={4} fontSize='xl'>All Assignments</Heading>}>
            <Column field='ordinalNum' header='#' sortable bodyStyle={{ borderRadius: '10px 0 0 10px', paddingRight: 0 }}
                    body={assignment => <Center fontWeight={500} color='gray.500'>{assignment.ordinalNum}</Center>} />
            <Column field='title' header='Assignment' sortable
                    body={assignment =>
                        <Stack w='2xs' h='7rem' justify='center'>
                          <Heading fontSize='lg'>{assignment.title}</Heading>
                          <Tooltip label={assignment.description}>
                            <Text noOfLines={3} fontSize='sm'>{assignment.description}</Text>
                          </Tooltip>
                        </Stack>} />
            <Column field='startDate' header='Publish Date' sortable body={assignment =>
                <Text fontSize='sm'>{format(parseISO(assignment.startDate), 'dd-MM-yyyy')}</Text>} />
            <Column field='endDate' header='Due Date' sortable body={assignment =>
                <Text fontSize='sm'>{format(parseISO(assignment.endDate), 'dd-MM-yyyy')}</Text>} />
            <Column field='points' header='EXP' sortable body={assignment =>
                <Box w='7rem'>
                  <Tag size='sm' rounded='xl' borderWidth={2} boxShadow='base' gap={1}>
                    <Icon as={StarIcon} boxSize='1rem' />
                    <TagLabel fontWeight={700}>{assignment.points} / {assignment.maxPoints} EXP</TagLabel>
                  </Tag>
                </Box>} />
            <Column field='progress' header='Progress' bodyStyle={{ borderRadius: '0 10px 10px 0' }}
                    body={assignment => <AssignmentScore points={assignment.points} max={assignment.maxPoints} />} />
          </DataTable>
      </Stack>
    </Flex>
  )
}
