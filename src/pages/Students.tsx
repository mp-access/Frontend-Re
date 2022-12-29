import { Center, Heading, Table, TableCaption, TableContainer, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import React from 'react'

export default function Students() {
  const { data: students } = useQuery<StudentProps[]>(['students'])
  if (!students)
    return <></>
  return (
      <TableContainer p={8} my={4} layerStyle='segment'>
        <Heading m={2} mt={0} fontSize='3xl'>Students</Heading>
        <Table maxW='container.sm'>
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
      </TableContainer>
  )
}