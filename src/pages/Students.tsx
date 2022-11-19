import { Center, Heading, Stack, Table, TableCaption, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import React from 'react'

export default function Students() {
  const { data: students } = useQuery<StudentProps[]>(['students'])
  if (!students)
    return <></>
  return (
      <Stack layerStyle='card' minH='sm' p={8}>
        <Heading m={2} fontSize='3xl'>Students</Heading>
        <Table>
          <Thead>
            <Tr>
              <Th>Last Name</Th>
              <Th>First Name</Th>
              <Th>Email</Th>
              <Th>Points</Th>
            </Tr>
          </Thead>
          <Tbody>
            {students.map(student =>
                <Tr key={student.email}>
                  <Td>{student.lastName}</Td>
                  <Td>{student.firstName}</Td>
                  <Td>{student.email}</Td>
                  <Td>{student.points}</Td>
                </Tr>)}
          </Tbody>
          <TableCaption>
            {!students.length && <Center color='gray.400'>No students found.</Center>}
          </TableCaption>
        </Table>
      </Stack>
  )
}