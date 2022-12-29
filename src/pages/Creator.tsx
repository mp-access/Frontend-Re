import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { FormControlProps, HStack, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import { SaveButton } from '../components/Buttons'
import React from 'react'
import { creatorForm, UserInput } from '../components/Fields'

const Creator = ({ id = '', label, children }: FormControlProps) => {
  const form = useForm(creatorForm(id))
  const navigate = useNavigate()
  const { mutateAsync } = useMutation<string, object, object>([id])
  const onSubmit = form.handleSubmit(data => mutateAsync(data).then(() => navigate(-1)))
  const { data } = useQuery<CourseProps>([id, label], { enabled: !!label, onSuccess: form.reset })

  if (label && !data)
    return <></>

  return (
      <FormProvider {...form}>
        <Stack as='form' layerStyle='form' w='container.sm' onSubmit={onSubmit}>
          {children}
          <SaveButton formState={form.formState} />
        </Stack>
      </FormProvider>
  )
}

export const CourseCreator = ({ label = '' }) =>
    <Creator id='courses' label={label}>
      {!label && <Text fontSize='2xl' lineHeight='taller'>{'Set up your new course'}</Text>}
      <SimpleGrid templateColumns='auto 1fr' gap={4}>
        <UserInput name='avatar' />
        <Stack w='full' flexGrow={1} spacing={4}>
          <UserInput label='Title' />
          <UserInput label='URL' />
        </Stack>
      </SimpleGrid>
      <HStack>
        <UserInput label='University' />
        <UserInput label='Semester' />
      </HStack>
      <HStack>
        <UserInput label='Start Date' fieldType='date' />
        <UserInput label='End Date' fieldType='date' />
      </HStack>
      <UserInput label='Description' fieldType='text' />
    </Creator>

export const CourseEditor = () => {
  const { courseURL } = useParams()
  return <CourseCreator label={courseURL} />
}

export const AssignmentCreator = ({ label = '' }) =>
    <Creator id='assignments' label={label}>
      {!label && <Text fontSize='2xl' lineHeight='taller'>{'Create a new assignment'}</Text>}
      <SimpleGrid templateColumns={label ? '1fr 5fr' : 'auto'} spacing={3}>
        {!!label && <UserInput label='#' name='ordinalNum' />}
        <UserInput label='Title' />
      </SimpleGrid>
      <UserInput label='URL' />
      <HStack>
        <UserInput label='Start Date' fieldType='date' />
        <UserInput label='End Date' fieldType='date' />
      </HStack>
      <UserInput label='Description' fieldType='text' />
    </Creator>


export const AssignmentEditor = () => {
  const { assignmentURL } = useParams()
  return <AssignmentCreator label={assignmentURL} />
}