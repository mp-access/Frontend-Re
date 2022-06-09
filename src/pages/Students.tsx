import { ButtonGroup, Center, Heading, HStack, Stack } from '@chakra-ui/react'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import React from 'react'
import { useFetch } from 'use-http'
import { AddStudentsModal } from '../components/Modals'

export default function Students() {
  const { data: students } = useFetch<Array<StudentProps>>('/students', [])

  return (
      <Stack flexGrow={1} w='70%' p={6}>
        <HStack spacing={5}>
          <Heading m={2} fontSize='3xl'>Students</Heading>
          <ButtonGroup colorScheme='purple' variant='outline'>
            <AddStudentsModal />
          </ButtonGroup>
        </HStack>
        <DataTable value={students} rowHover autoLayout
                   emptyMessage={<Center py={4} color='gray.400'>No students found.</Center>}>
          <Column sortable field='lastName' header='Last Name' style={{ paddingLeft: '1rem' }} />
          <Column sortable field='firstName' header='First Name' />
          <Column sortable field='email' header='Email' />
          <Column sortable field='points' header='Points' />
        </DataTable>
      </Stack>
  )
}