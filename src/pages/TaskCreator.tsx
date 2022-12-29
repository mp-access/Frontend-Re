import { useMutation, useQuery } from '@tanstack/react-query'
import { FormProvider, useForm } from 'react-hook-form'
import { creatorForm, selectOptions, UserInput } from '../components/Fields'
import {
  Checkbox, HStack, Input, Select, SimpleGrid, Stack, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr
} from '@chakra-ui/react'
import React from 'react'
import { CheckIcon } from '@chakra-ui/icons'
import { range } from 'lodash'
import { SaveButton } from '../components/Buttons'
import TemplateCreator from './TemplateCreator'

export default function TaskCreator() {
  const form = useForm(creatorForm('task'))
  const { data: templateFiles } = useQuery<TemplateFileProps[]>(['files'])
  const { mutateAsync: createTask } = useMutation<string, object, object>(['tasks'])
  const onSubmit = form.handleSubmit(data =>
      createTask({ ...data, files: data.files?.filter((file: any) => file.added) }))

  if (!templateFiles)
    return <></>

  const addedFiles = form.watch(range(templateFiles.length).map(i => `files.${i}.added`))

  return (
      <FormProvider {...form}>
        <SimpleGrid as='form' templateColumns='1fr 2fr' onSubmit={onSubmit} alignContent='center' gap={6} maxW='8xl'>
          <Stack layerStyle='feature' spacing={4} p={6}>
            <Text fontSize='2xl'>{'Set up a new task'}</Text>
            <UserInput label='Title' />
            <UserInput label='URL' />
            <HStack>
              <UserInput label='Max Attempts' />
              <UserInput label='Max Points' />
              <UserInput name='attemptWindow' label='Attempt Refill (Hours)' />
            </HStack>
            <HStack>
              <UserInput label='Docker Image' />
              <UserInput name='timeLimit' label='Submission Timeout (Seconds)' />
            </HStack>
            <UserInput label='Run Command' />
            <UserInput label='Test Command' />
            <UserInput label='Grade Command' />
          </Stack>
          <TableContainer layerStyle='feature'>
            <HStack justify='space-between' pb={4}>
              <Text fontSize='xl' p={3}>{'Select task files'}</Text>
              <TemplateCreator />
            </HStack>
            <Table size='sm' maxH='xl' display='block' overflow='auto'>
              <Thead pos='sticky' bg='base' zIndex={1} top={0}>
                <Tr>
                  <Th><CheckIcon /></Th>
                  <Th>Repository File</Th>
                  <Th>Editable?</Th>
                  <Th>Use Context?</Th>
                  <Th>Task File Path</Th>
                </Tr>
              </Thead>
              <Tbody fontSize='sm'>
                {templateFiles.map((file, i) =>
                    <Tr key={file.id} bg={addedFiles[i] ? 'yellow.50' : 'initial'}>
                      <Td textAlign='center'>
                        <Checkbox bg='base' onChange={({ target }) => console.log(target)} />
                      </Td>
                      <Td {...form.register(`files.${i}.templatePath`, { value: file.path })}>
                        {file.path}
                      </Td>
                      <Td textAlign='center'><Checkbox bg='base' {...form.register(`files.${i}.editable`)} /></Td>
                      <Td>
                        <Select bg='base' size='sm' placeholder='Select' {...form.register(`files.${i}.context`)}>
                          {selectOptions['context']?.map((value: string) =>
                              <option key={value} value={value} label={value} />)}
                        </Select>
                      </Td>
                      <Td>
                        <Input size='sm' borderColor='gray.200' variant='outline' bg='base' placeholder={file.path}
                               w='2xs' _placeholder={{ opacity: 0.7 }} {...form.register(`files.${i}.path`)} />
                      </Td>
                    </Tr>)}
              </Tbody>
            </Table>
          </TableContainer>
          <SaveButton formState={form.formState} placeSelf='center' gridColumn='span 2' size='lg' />
        </SimpleGrid>
      </FormProvider>
  )
}