import { Controller, useFormContext } from 'react-hook-form'
import {
  Center, FormControl, FormHelperText, FormLabel, HStack, Icon, Input, InputGroup, InputRightElement,
  NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Textarea
} from '@chakra-ui/react'
import { CheckIcon } from '@chakra-ui/icons'
import React, { useRef, useState } from 'react'
import { UseFormProps } from 'react-hook-form/dist/types'
import { camelCase } from 'lodash'
import Dropzone from 'react-dropzone'
import AvatarEditor from 'react-avatar-editor'
import { MdOutlineAddPhotoAlternate } from 'react-icons/md'
import * as yup from 'yup'
import { ObjectSchema } from 'yup'
import { yupResolver } from '@hookform/resolvers/yup/dist/yup'
import { UseControllerReturn } from 'react-hook-form/dist/types/controller'

type UserInputProps = { label?: string, name?: string, fieldType?: string }

export const selectOptions: Record<string, Array<string>> =
    { 'context': ['Task', 'Solution', 'Instructions', 'Grading'] }

yup.setLocale({
  mixed: { required: () => 'Required' },
  string: {
    min: params => `Min. ${params.min} letters`,
    max: params => `Max. ${params.max} letters`
  }
})

const courseSchema = yup.object({
  title: yup.string().min(4).max(20).ensure().trim(),
  url: yup.string().min(8).max(30).matches(/[0-9a-z]/, 'Lowercase letters, numbers or dash (-) only').ensure().trim(),
  startDate: yup.date().required(),
  endDate: yup.date().required(),
  university: yup.string().min(5).ensure().trim(),
  semester: yup.string().min(5).ensure().trim(),
  description: yup.string().ensure().max(150),
  avatar: yup.string().ensure()
      .test('isImage', params => params?.value ? 'Invalid' : 'Required', value => value?.startsWith('data:image'))
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
  files: yup.array().default([]).of(yup.object({
    added: yup.boolean().default(false),
    path: yup.string(), templatePath: yup.string(),
    editable: yup.boolean().default(false).required(),
    context: yup.string().oneOf(selectOptions['context']).when('added', { is: true, then: schema => schema.required() })
  }))
}))
const schemas: Record<string, ObjectSchema<any>> =
    { 'courses': courseSchema, 'assignments': assignmentSchema, 'tasks': taskSchema }
export const creatorForm = (id: string): UseFormProps<any> =>
    ({ mode: 'onChange', resolver: yupResolver(schemas[id]), defaultValues: schemas[id].getDefaultFromShape() })

const NumberField = ({ field }: UseControllerReturn<any>) =>
    <NumberInput min={0}>
      <NumberInputField {...field} type='number' />
      <NumberInputStepper>
        <NumberIncrementStepper />
        <NumberDecrementStepper />
      </NumberInputStepper>
    </NumberInput>

const AvatarField = ({ field, fieldState: { error } }: UseControllerReturn<any>) => {
  const ref = useRef<any>(null)
  const [original, setOriginal] = useState(field.value)
  const getAvatar = () => original && field.onChange(ref?.current?.getImageScaledToCanvas()?.toDataURL())
  return <Dropzone onDrop={(files) => setOriginal(files[0])} multiple={false} noKeyboard noClick={!!original}
                   children={({ getRootProps, getInputProps }) =>
                       <Center {...getRootProps()} borderColor={error ? 'red.200' : 'gray.200'} layerStyle='drop'>
                         <Input {...getInputProps()} size='sm' />
                         <Center pos='absolute' boxSize='full'>
                           <Icon as={MdOutlineAddPhotoAlternate} boxSize={16} />
                         </Center>
                         <AvatarEditor height={150} width={150} image={original || ''}
                                       onImageReady={getAvatar} onMouseUp={getAvatar} border={0} ref={ref}
                                       style={{ overflow: 'hidden', borderRadius: 'inherit', zIndex: 1 }} />
                       </Center>} />
}

const fieldTypes: Record<string, (props: UseControllerReturn<any>) => JSX.Element> = {
  'number': NumberField, 'avatar': AvatarField, 'text': props => <Textarea {...props.field} />
}

export const UserInput = ({ label = '', name = '', fieldType = '' }: UserInputProps) => {
  const { control } = useFormContext()
  return <Controller name={name || camelCase(label)} control={control} render={props =>
      <FormControl isInvalid={!!props.fieldState.error}>
        <HStack justify='space-between'>
          <FormLabel textTransform='capitalize' whiteSpace='nowrap'>{label || name}</FormLabel>
          <FormHelperText color='red.400'>
            {props.fieldState.error?.message}
          </FormHelperText>
        </HStack>
        {fieldTypes[fieldType || name] ? fieldTypes[fieldType || name](props) :
            <InputGroup {...props.field}>
              <Input type={fieldType} defaultValue={props.field.value} />
              <InputRightElement>
                {!props.fieldState.error && props.fieldState.isDirty && <CheckIcon color='green.400' />}
              </InputRightElement>
            </InputGroup>}
      </FormControl>} />
}

