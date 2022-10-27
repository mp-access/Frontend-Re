import { Center, Heading, HStack, VStack } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import React from 'react'

export default function Students() {
  const { data: students } = useQuery<StudentProps[]>(['students'])
  return (
      <VStack flexGrow={1} p={6}>
        <HStack spacing={5} justify='space-between'>
          <Heading m={2} fontSize='3xl'>Students</Heading>
        </HStack>
        <DataTable value={students} rowHover autoLayout
                   emptyMessage={<Center py={4} color='gray.400'>No students found.</Center>}>
          <Column sortable field='lastName' header='Last Name' style={{ paddingLeft: '1rem' }} />
          <Column sortable field='firstName' header='First Name' />
          <Column sortable field='email' header='Email' />
          <Column sortable field='points' header='Points' />
        </DataTable>
      </VStack>
  )
}