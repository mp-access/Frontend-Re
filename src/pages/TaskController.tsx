import { HStack, Stack } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { Select } from 'chakra-react-select'
import React, { ComponentProps } from 'react'

export default function TaskController({ value, defaultValue, onChange }: ComponentProps<any>) {
  const { data: students } = useQuery<StudentProps[]>(['students'])
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