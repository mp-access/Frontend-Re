import { Controller, ControllerRenderProps, useFieldArray, useFormContext } from 'react-hook-form'
import {
  Button, Center, CloseButton, Flex, FormControl, FormErrorMessage, FormLabel, HStack, Icon, Input, InputGroup,
  InputProps, InputRightElement, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField,
  NumberInputStepper, Select, Stack, Table, Tbody, Td, Textarea, Th, Thead, Tr
} from '@chakra-ui/react'
import { AddIcon, CheckIcon } from '@chakra-ui/icons'
import React, { useRef, useState } from 'react'
import { UseFormProps } from 'react-hook-form/dist/types'
import Dropzone from 'react-dropzone'
import AvatarEditor from 'react-avatar-editor'
import { MdOutlineAddPhotoAlternate } from 'react-icons/md'
import * as yup from 'yup'
import { ObjectSchema } from 'yup'
import { yupResolver } from '@hookform/resolvers/yup/dist/yup'
import { camel } from 'radash'
import { last, range, split } from 'lodash'


export const selectOptions: Record<string, Array<string>> =
    { 'Context': ['Task', 'Solution', 'Instructions', 'Grading'], 'Role': ['Supervisor', 'Assistant'] }

yup.setLocale({
  mixed: { required: () => '', notType: () => '' },
  string: {
    min: params => `Min. ${params.min} characters`,
    max: params => `Max. ${params.max} characters`
  }
})

const fileSchema = yup.object({
  added: yup.boolean().default(false),
  path: yup.string(), templatePath: yup.string(),
  editable: yup.boolean().default(false).required(),
  context: yup.string().nullable().default(null)
      .when('added', { is: true, then: s => s.oneOf(selectOptions['Context']) })
})

const memberSchema = yup.object({
  name: yup.string().ensure().trim(),
  email: yup.string().email().ensure().trim()
})

const templateSchema = yup.object({ templates: yup.array().of(yup.string().ensure().trim().min(2)).default([]) })

const courseSchema = yup.object({
  title: yup.string().min(4).max(30).ensure().trim(),
  url: yup.string().min(8).max(30).matches(/[0-9a-z]/, 'Lowercase letters, numbers or dash (-) only').ensure().trim(),
  startDate: yup.mixed().required(),
  endDate: yup.mixed().required(),
  university: yup.string().min(5).ensure().trim(),
  semester: yup.string().min(5).ensure().trim(),
  description: yup.string().ensure().max(400),
  supervisors: yup.array().of(memberSchema).default([]),
  assistants: yup.array().of(memberSchema).default([]),
  avatar: yup.string().ensure().test('image', p => p?.value ? 'Invalid' : 'Required', a => a?.startsWith('data:image'))
})

const assignmentSchema = courseSchema.pick(['title', 'url', 'startDate', 'endDate', 'description'])
    .concat(yup.object({ ordinalNum: yup.number().min(0).nullable().default(null) }))


const taskSchema = assignmentSchema.pick(['title', 'url', 'ordinalNum']).concat(yup.object({
  maxPoints: yup.number().default(10).required(),
  maxAttempts: yup.number().default(3).required(),
  attemptWindow: yup.number().min(0).nullable().default(null),
  dockerImage: yup.string().required(),
  timeLimit: yup.number().default(30).required(),
  runCommand: yup.string(),
  testCommand: yup.string(),
  gradeCommand: yup.string(),
  files: yup.array().of(fileSchema).default([])
      .test('added', 'Select at least 1 file', (files: any[]) => !!files?.find(f => f.added))
}))

const schemas: Record<string, ObjectSchema<any>> =
    { 'courses': courseSchema, 'assignments': assignmentSchema, 'tasks': taskSchema, 'templates': templateSchema }
export const creatorForm = (id: string): UseFormProps<any> =>
    ({ mode: 'onChange', resolver: yupResolver(schemas[id]), defaultValues: schemas[id].getDefaultFromShape() })

const NumberField = (field: ControllerRenderProps<any>) =>
    <NumberInput min={0} defaultValue={field.value}>
      <NumberInputField {...field} type='number' />
      <NumberInputStepper>
        <NumberIncrementStepper />
        <NumberDecrementStepper />
      </NumberInputStepper>
    </NumberInput>

const SelectionField = (field: ControllerRenderProps<any>) =>
    <Select bg='base' size='sm' minW='max-content' {...field}>
      {selectOptions[last(split(field.name, '.')) || ''].map(o => <option key={o} value={o} label={o} />)}
    </Select>

const AvatarField = (field: ControllerRenderProps<any>) => {
  const [original, setOriginal] = useState(field.value)
  const ref = useRef<any>(null)
  const getAvatar = () => original && field.onChange(ref?.current?.getImageScaledToCanvas()?.toDataURL())
  return <Dropzone onDrop={(files) => setOriginal(files[0])} multiple={false} noKeyboard noClick={!!original}
                   children={({ getRootProps, getInputProps }) =>
                       <Center {...getRootProps()} layerStyle='drop' borderWidth={0}>
                         <Input {...getInputProps({ style: { display: 'flex' } })} size='sm' bg='none'
                                pos='absolute' boxSize='full' top={0} left={0} p={5} borderWidth={2}
                                borderStyle='dashed' borderColor='gray.200' rounded='2xl' />
                         <Center pos='absolute' boxSize='full' top={0} left={0} p={4}>
                           <Icon as={MdOutlineAddPhotoAlternate} boxSize='full' p={8} bg='base' />
                         </Center>
                         <AvatarEditor ref={ref} image={original || ''} height={140} width={140}
                                       onImageReady={getAvatar} onMouseUp={getAvatar} border={0}
                                       style={{ overflow: 'hidden', borderRadius: 'inherit', zIndex: 1 }} />
                       </Center>} />
}

const fieldTypes: Record<string, (props: ControllerRenderProps<any>) => JSX.Element> = {
  'number': NumberField, 'avatar': AvatarField, 'text': field => <Textarea {...field} />, 'select': SelectionField
}

export const FormField = ({ name = '', title = '', type = '', isDisabled = false }: InputProps) => {
  const { control } = useFormContext()
  return <Controller name={name || camel(title)} control={control} render={({ field, fieldState }) =>
      <FormControl isInvalid={!!fieldState.error}>
        <HStack w='full' overflow='hidden' align='stretch'>
          <FormLabel textTransform='capitalize' whiteSpace='nowrap'>{title || name}</FormLabel>
          <Flex pos='relative' flexGrow={1} pb={1}>
            <FormErrorMessage pos='absolute' right={0} top={0}>{fieldState.error?.message}</FormErrorMessage>
          </Flex>
        </HStack>
        {fieldTypes[type] ? fieldTypes[type](field) :
            <InputGroup {...field}>
              <Input type={type} defaultValue={field.value} isDisabled={isDisabled} />
              <InputRightElement>
                {!fieldState.error && fieldState.isDirty && <CheckIcon color='green.400' />}
              </InputRightElement>
            </InputGroup>}
      </FormControl>} />
}

export const ColumnField = ({ name = '', placeholder = '' }: InputProps) => {
  const { control } = useFormContext()
  return <Controller name={name} control={control} render={({ field, fieldState }) =>
      <FormControl isInvalid={!!fieldState.error}>
        {selectOptions[placeholder] ?
            <Select bg='base' size='sm' minW='max-content' {...field} placeholder='Select'>
              {selectOptions[placeholder].map(o => <option key={o} value={o} label={o} />)}
            </Select> :
            <InputGroup size='sm' {...field}>
              <Input variant='outline' defaultValue={field.value} placeholder={placeholder}
                     _placeholder={{ opacity: 0.7 }} />
              <InputRightElement>
                {!fieldState.error && fieldState.isDirty && <CheckIcon color='green.400' />}
              </InputRightElement>
            </InputGroup>}
      </FormControl>
  } />
}

export const TableField = ({ name = '', title = '', columns = [''] }: InputProps & { columns?: string[] }) => {
  const { control } = useFormContext()
  const { fields, append, remove } = useFieldArray({ name, control })
  return (
      <Stack h='full'>
        <HStack justify='space-between'>
          <FormLabel textTransform='capitalize' whiteSpace='nowrap'>{title || name}</FormLabel>
          <Button size='sm' variant='ghost' onClick={() => append({})} leftIcon={<AddIcon />} children='Add' />
        </HStack>
        <Table size='sm' fontSize='sm' display='block' maxH={44} overflow='scroll'>
          {columns[0] &&
            <Thead pos='sticky' bg='base' zIndex={1} top={0}>
              <Tr>
                <Th />
                {columns.map(column => <Th key={column} w='full'>{column}</Th>)}
                <Th />
              </Tr>
            </Thead>}
          <Tbody>
            {range(fields.length || 1).map(i =>
                <Tr key={i}>
                  <Td><Center>{i + 1}</Center></Td>
                  {columns.map(column =>
                      <Td key={column} px={0} w='full'>
                        <ColumnField name={`${name}.${i}${column ? '.' + camel(column) : ''}`} placeholder={column} />
                      </Td>)}
                  <Td p={0} pl={2}><CloseButton size='sm' onClick={() => remove(i)} /></Td>
                </Tr>)}
          </Tbody>
        </Table>
      </Stack>
  )
}

