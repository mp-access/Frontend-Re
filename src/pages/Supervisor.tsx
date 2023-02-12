import {
  Button, Center, Heading, HStack, Icon, Stack, Table, TableCaption, TableContainer, Tbody, Td, Th, Thead, Tr
} from '@chakra-ui/react'
import React, { ComponentProps } from 'react'
import { useStudents } from '../components/Hooks'
import { Link } from 'react-router-dom'
import { FcDataConfiguration, FcOvertime, FcSettings } from 'react-icons/fc'
import { take } from 'lodash'
import { Select } from 'chakra-react-select'

export function SupervisorZone() {
  const { data: students } = useStudents()
  if (!students)
    return <></>
  return (
      <Stack flexGrow={1} p={4}>
        <Button as={Link} to='supervisor' leftIcon={<Icon as={FcOvertime} boxSize={7} mr={4} />} variant='quick'
                h={16} bg='purple.50' borderColor='purple.200' _hover={{ bg: 'purple.75' }}
                children='Plan & Organize Tasks' />
        <Button as={Link} to='supervisor/files' leftIcon={<Icon as={FcDataConfiguration} boxSize={7} mr={4} />}
                variant='quick' children='Files Manager' />
        <Button as={Link} to='supervisor/edit' leftIcon={<Icon as={FcSettings} boxSize={6} ml={1} mr={4} />}
                variant='quick' children='Course Settings' />
        <TableContainer py={2}>
          <Heading fontSize='lg' textAlign='center' my={4}>Top Students</Heading>
          <Table size='sm'>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th isNumeric>Points</Th>
              </Tr>
            </Thead>
            <Tbody>
              {take(students, 10).map(student =>
                  <Tr key={student.email}>
                    <Td>{student.firstName} {student.lastName}</Td>
                    <Td isNumeric>{student.points}</Td>
                  </Tr>)}
            </Tbody>
            <TableCaption>
              {students.length ? <Button as={Link} to='supervisor/students' variant='link'>All Students</Button> :
                  <Center color='gray.400'>No students found.</Center>}
            </TableCaption>
          </Table>
        </TableContainer>
      </Stack>
  )
}

export function TaskController({ value, defaultValue, onChange }: ComponentProps<any>) {
  const { data: students } = useStudents()
  return (
      <HStack pos='absolute'>
        <Stack w='2xs' fontSize='sm' bg='base' rounded='lg'>
          <Select placeholder='View as student...' value={{ email: value }} getOptionValue={data => data?.email}
                  getOptionLabel={data => data?.email} options={students}
                  controlShouldRenderValue={value !== defaultValue} isClearable focusBorderColor='purple.600'
                  onChange={newValue => onChange(newValue?.email || defaultValue)} />
        </Stack>
      </HStack>
  )
}