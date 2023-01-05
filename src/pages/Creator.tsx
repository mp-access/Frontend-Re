import { FormProvider } from 'react-hook-form'
import { UseQueryOptions } from '@tanstack/react-query'
import {
  Button, Checkbox, FormControl, FormErrorMessage, HStack, InputProps, Select, SimpleGrid, Stack, Table, Tbody, Td,
  Text, Th, Thead, Tr
} from '@chakra-ui/react'
import { SaveButton } from '../components/Buttons'
import React from 'react'
import { FormField, selectOptions, TableField } from '../components/Fields'
import { useCreator, useTemplateFiles } from '../components/Hooks'
import { filter, keyBy } from 'lodash'
import TemplateCreator from './TemplateCreator'
import { CheckIcon, ExternalLinkIcon } from '@chakra-ui/icons'

const Creator = ({ prefix = '', enabled = false, children }: InputProps & UseQueryOptions<any>) => {
  const { form, create, isSuccess } = useCreator(prefix, enabled)
  const onSubmit = form.handleSubmit(data => create(data))

  if (enabled && !isSuccess)
    return <></>

  return (
      <FormProvider {...form}>
        <Stack as='form' layerStyle='form' onSubmit={onSubmit}>
          {children}
          <SaveButton formState={form.formState} />
        </Stack>
      </FormProvider>
  )
}

export const CourseCreator = ({ isEditor = false }) =>
    <Creator prefix='courses' enabled={isEditor}>
      {!isEditor && <Text fontSize='2xl' lineHeight='taller'>{'Set up your new course'}</Text>}
      <SimpleGrid templateColumns='1fr 1fr' maxW='container.lg' gap={6}>
        <Stack>
          <SimpleGrid templateColumns='auto 1fr' gap={4}>
            <FormField title='Avatar' type='avatar' />
            <Stack w='full' flexGrow={1} spacing={4}>
              <FormField title='Title' />
              <FormField title='URL' isDisabled={isEditor} />
            </Stack>
          </SimpleGrid>
          <HStack>
            <FormField title='University' />
            <FormField title='Semester' />
          </HStack>
          <HStack>
            <FormField title='Start Date' type='date' />
            <FormField title='End Date' type='date' />
          </HStack>
          <FormField title='Description' type='text' />
        </Stack>
        <Stack>
          <TableField name='supervisors' columns={['Name', 'Email']} />
          <TableField name='assistants' columns={['Name', 'Email']} />
        </Stack>
      </SimpleGrid>
    </Creator>

export const CourseEditor = () => <CourseCreator isEditor />

export const AssignmentCreator = ({ isEditor = false }) =>
    <Creator prefix='assignments' enabled={isEditor}>
      {!isEditor && <Text fontSize='2xl' lineHeight='taller'>{'Create a new assignment'}</Text>}
      <Stack maxW='lg' spacing={6}>
        <SimpleGrid templateColumns={isEditor ? '1fr 5fr' : 'auto'} spacing={3}>
          {isEditor && <FormField title='#' name='ordinalNum' />}
          <FormField title='Title' />
        </SimpleGrid>
        <FormField title='URL' />
        <HStack>
          <FormField title='Start Date' type='datetime-local' />
          <FormField title='End Date' type='datetime-local' />
        </HStack>
        <FormField title='Description' type='text' />
      </Stack>
    </Creator>

export const AssignmentEditor = () => <AssignmentCreator isEditor />

export const TaskCreator = ({ isEditor = false }) => {
  const { data: templateFiles } = useTemplateFiles()
  const { data: task, form, create } = useCreator<TaskInfo>('tasks', isEditor)
  const onSubmit = form.handleSubmit(data => create({ ...data, files: filter(data.files, f => f.added) }))

  if (!templateFiles || (isEditor && !task))
    return <></>

  const addedFiles = keyBy(task?.taskFiles, 'templateId')

  return (
      <FormProvider {...form}>
        <SimpleGrid as='form' templateColumns='auto 1fr' onSubmit={onSubmit} gap={6}
                    justifyItems='center' alignItems='stretch' alignContent='center' maxW='container.lg'>
          <Stack layerStyle='feature' spacing={4} p={6}>
            <Text fontSize='2xl'>{'Set up a new task'}</Text>
            <FormField title='Title' />
            <FormField title='URL' />
            <HStack>
              <FormField title='Max Attempts' type='number' />
              <FormField title='Max Points' type='number' />
              <FormField name='attemptWindow' title='Attempt Refill (Hours)' type='number' />
            </HStack>
            <HStack>
              <FormField title='Docker Image' />
              <FormField name='timeLimit' title='Submission Timeout (Seconds)' type='number' />
            </HStack>
            <FormField title='Run Command' />
            <FormField title='Test Command' />
            <FormField title='Grade Command' />
          </Stack>
          <Stack layerStyle='feature'>
            <FormControl isInvalid={!!form.formState?.errors?.files} as={HStack}
                         justify='space-between' pb={4} pos='relative'>
              <Text fontSize='xl' p={3}>{'Select task files'}</Text>
              <FormErrorMessage pos='absolute' right={0} bottom={0}>
                {form.formState?.errors?.files?.message?.toString() || ''}
              </FormErrorMessage>
              <TemplateCreator />
            </FormControl>
            <Table size='sm' maxH='xl' display='block' overflow='auto'>
              <Thead pos='sticky' bg='base' zIndex={1} top={0}>
                <Tr>
                  <Th><CheckIcon /></Th>
                  <Th>Template</Th>
                  <Th px={0}>Editable</Th>
                  <Th>Use Context</Th>
                </Tr>
              </Thead>
              <Tbody fontSize='sm'>
                {templateFiles.map((file, i) =>
                    <Tr key={file.id} bg={addedFiles[file.id] ? 'yellow.50' : 'initial'}>
                      <Td>
                        <Checkbox bg='base' {...form.register(`files.${i}.added`, { value: !!addedFiles[file.id] })} />
                      </Td>
                      <Td {...form.register(`files.${i}.templatePath`, { value: file.path })}>
                        <Button variant='link' rightIcon={<ExternalLinkIcon />} as='a' href={file.link}
                                target='_blank' size='sm' colorScheme='blue' fontWeight={400} children={file.path} />
                      </Td>
                      <Td px={0} textAlign='center'>
                        <Checkbox bg='base'
                                  {...form.register(`files.${i}.editable`, { value: !!addedFiles[file.id]?.editable })} />
                      </Td>
                      <Td>
                        <Select bg='base' size='sm' minW='max-content' placeholder='Select'
                                {...form.register(`files.${i}.context`, { value: addedFiles[file.id]?.context })}>
                          {selectOptions['Context'].map(o => <option key={o} value={o} label={o} />)}
                        </Select>
                      </Td>
                    </Tr>)}
              </Tbody>
            </Table>
          </Stack>
          <SaveButton formState={form.formState} placeSelf='center' gridColumn='span 2' size='lg' />
        </SimpleGrid>
      </FormProvider>
  )
}

export const TaskEditor = () => <TaskCreator isEditor />