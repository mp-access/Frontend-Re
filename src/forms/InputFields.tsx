import {
  Box, Button, Center, Collapse, Flex, FormControl, FormErrorMessage, FormLabel, Grid, GridItem, Heading, HStack, Icon,
  IconButton, Input, InputGroup, InputLeftElement, InputRightElement, NumberDecrementStepper, NumberIncrementStepper,
  NumberInput, NumberInputField, NumberInputStepper, Select, Stack, Switch, Text, Textarea, Tooltip, useDimensions,
  useStyleConfig
} from '@chakra-ui/react'
import { Field, FieldArray, FieldArrayRenderProps, FieldProps, useFormikContext } from 'formik'
import { capitalize, lowerCase, startCase } from 'lodash'
import React, { ComponentProps, useRef } from 'react'
import { IconType } from 'react-icons'
import {
  AiOutlineBank, AiOutlineBook, AiOutlineClose, AiOutlineFileAdd, AiOutlineInfoCircle, AiOutlineLink, AiOutlineNumber
} from 'react-icons/ai'
import { useParams } from 'react-router-dom'
import { ChakraDateTimePicker, ChakraOption, ChakraPicklist } from '../components/Base'
import { fileSchema, selectionOptions } from './Schemas'

export function URLField() {
  const { courseURL } = useParams()
  const placeholder = courseURL ? 'info-1-2022' : 'intro-to-python'
  const prefix = '/courses/' + (courseURL ? courseURL+'/' : '')
  const prefixRef = useRef<any>()
  const prefixDimensions = useDimensions(prefixRef)
  return (
      <Field name='url' children={(fieldProps: FieldProps) =>
          <FormControl mb={8} isInvalid={fieldProps.meta.touched && !!fieldProps.meta.error}>
            <FormLabel>{fieldProps.form.status} URL</FormLabel>
            <InputGroup>
              <InputLeftElement ref={prefixRef} w='auto' borderTop='1px solid transparent' gap={3} pl={3}>
                <AiOutlineLink />
                <Text whiteSpace='nowrap'>{prefix}</Text>
              </InputLeftElement>
              <Input {...fieldProps.field} placeholder={placeholder} pl={prefixDimensions?.borderBox.width} />
            </InputGroup>
            <FormErrorMessage>{fieldProps.meta.error}</FormErrorMessage>
          </FormControl>} />
  )
}

export function NameField({ prefix, name, icon }: { prefix?: string, name?: string, icon: IconType }) {
  return (
      <Field name={name || 'name'} children={(fieldProps: FieldProps) =>
          <FormControl isInvalid={fieldProps.meta.value && fieldProps.meta.error}>
            <FormLabel>{name ? startCase(name) : (prefix || '')+' Name'}</FormLabel>
            <InputGroup>
              <InputRightElement>
                <Icon as={icon} boxSize={5} color='gray.500' />
              </InputRightElement>
              <Input {...fieldProps.field} />
            </InputGroup>
            <FormErrorMessage>{fieldProps.meta.value && fieldProps.meta.error}</FormErrorMessage>
          </FormControl>}/>
  )
}

export function DescriptionField() {
  return (
      <Field name='description' children={(fieldProps: FieldProps) =>
          <FormControl isInvalid={fieldProps.meta.value && fieldProps.meta.error}>
            <FormLabel>Description</FormLabel>
            <Textarea {...fieldProps.field} maxLength={200} resize='none' />
            <FormErrorMessage>{fieldProps.meta.value && fieldProps.meta.error}</FormErrorMessage>
          </FormControl>}/>
  )
}

export function CatalogueIDField() {
  return (
      <Field name='catalogue' children={(fieldProps: FieldProps) =>
          <FormControl isInvalid={fieldProps.meta.touched && !!fieldProps.meta.error}>
            <FormLabel>Course ID</FormLabel>
            <InputGroup>
              <InputLeftElement>
                <AiOutlineNumber />
              </InputLeftElement>
              <Input {...fieldProps.field} placeholder='AINF1166' />
            </InputGroup>
            <FormErrorMessage>{fieldProps.meta.error}</FormErrorMessage>
          </FormControl>} />
  )
}

export function MaxPointsField() {
  return (
      <Field name='maxPoints' children={(fieldProps: FieldProps) =>
          <FormControl as={HStack} spacing={4} px={3} isInvalid={fieldProps.meta.touched && !!fieldProps.meta.error}>
            <FormLabel m={0} textTransform='none'>Enable grading?</FormLabel>
            <Switch {...fieldProps.form.getFieldProps('graded')} isChecked={fieldProps.form.values.graded} />
            <NumberInput isDisabled={!fieldProps.form.values.graded} min={0} step={0.1} variant='flushed' pl={4} w='10rem'>
              <NumberInputField {...fieldProps.field} placeholder='Max. points' />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>} />
  )
}

export function MaxSubmitsField() {
  return (
      <Field name='maxAttempts' children={(fieldProps: FieldProps) =>
          <FormControl as={HStack} spacing={4} px={3} isInvalid={fieldProps.meta.touched && !!fieldProps.meta.error}>
            <FormLabel m={0} textTransform='none'>Limit attempts?</FormLabel>
            <Switch {...fieldProps.form.getFieldProps('limited')} isChecked={fieldProps.form.values.limited} />
            <NumberInput isDisabled={!fieldProps.form.values.limited} min={0} variant='flushed' pl={4} w='10rem'>
              <NumberInputField {...fieldProps.field} placeholder='Max. Attempts' />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>} />
  )
}

export function SearchSelector(props: ComponentProps<any>) {
  const height = props.isCompact ? 10 : 12
  const fieldStyle: any = useStyleConfig('Select', { variant: 'outline' })
  return <ChakraPicklist rounded='3xl' boxShadow='lg' enableSearch h={height}
                         __css={{ 'div input': { ...fieldStyle.field, height } }} {...props} />
}

export function SelectionField(props: { name: string, icon: IconType, hideLabel?: boolean }) {
  const options = selectionOptions[props.name]
  return (
      <Field name={props.name} children={(fieldProps: FieldProps) =>
          <FormControl isInvalid={fieldProps.meta.touched && !!fieldProps.meta.error}>
            <FormLabel>{props.name}</FormLabel>
            <SearchSelector {...fieldProps.field} placeholder={'Select ' + capitalize(props.name)}
                            value={{ name: fieldProps.field.value, label: fieldProps.field.value }}
                            onChange={(selected: any) => fieldProps.form.setFieldValue(props.name, selected.name)}>
              {options.map(option => <ChakraOption key={option} name={option} label={option} />)}
            </SearchSelector>
          </FormControl>} />
  )
}

export function UniversityField() {
  const { values } = useFormikContext<any>()
  return (
      <Collapse in={values.organization === 'university'}>
        <Stack spacing={4} p={1}>
          <SelectionField name='university' icon={AiOutlineBank} />
          <HStack spacing={4}>
            <SelectionField name='semester' icon={AiOutlineBook} />
            <CatalogueIDField />
          </HStack>
        </Stack>
      </Collapse>
  )
}

export function AssignmentDatesField() {
  const { values } = useFormikContext<any>()
  return (
      <Collapse in={values.assignmentType === 'homework'}>
        <HStack spacing={4} p={1}>
          <DateField label='Publish Date & Time' />
          <DateField label='Due Date & Time' isEnd />
        </HStack>
      </Collapse>

  )
}

export function TaskFileField() {
  const fileTypesHelpText = (
      <Text>
        <b>Editable</b>: Visible to and can be edited by all users associated with the course.<br/>
        <b>Read only</b>: Visible to all but can be edited only by assistants and supervisors.<br/>
        <b>Restricted</b>: Visible to and can be edited by assistants and supervisors only.<br/>
        <b>Grading</b>: Restricted and will be used for grading submissions.
      </Text>)
  return (
      <Stack spacing={4}>
        <Box>
          <Heading fontSize='2xl' mb={1}>Task Files</Heading>
          <Text>
            Define which files should be included in the task workspace. Note that files can also be
            edited later from within the workspace.
          </Text>
        </Box>
        <FieldArray name='files' children={(fieldArrayProps: FieldArrayRenderProps) =>
            <Grid templateColumns='repeat(10, 1fr)' gap={3}>
              <GridItem fontWeight={500} fontSize='sm'>#</GridItem>
              <GridItem colSpan={5} fontWeight={500} fontSize='sm'>File Name</GridItem>
              <GridItem colSpan={3} fontWeight={500} fontSize='sm' as={HStack}>
                <Text>File Type</Text>
                <Tooltip hasArrow label={fileTypesHelpText}>
                  <span><AiOutlineInfoCircle /></span>
                </Tooltip>
              </GridItem>
              <GridItem />
              {fieldArrayProps.form.values.files.map((_file: any, index: number) =>
                  <>
                    <GridItem fontWeight={600} lineHeight={2}>{index+1}</GridItem>
                    <GridItem colSpan={4} as={Flex}>
                      <Field name={`files.${index}.name`} children={(fieldProps: FieldProps) =>
                        <FormControl isInvalid={fieldProps.meta.touched && !!fieldProps.meta.error}>
                          <Input {...fieldProps.field} variant='flushed' />
                        </FormControl>} />
                      <Field name={`files.${index}.extension`} children={(fieldProps: FieldProps) =>
                            <Select {...fieldProps.field} variant='flushed' maxW='fit-content'>
                              {selectionOptions['extension'].map(extension =>
                                  <option key={extension} value={extension}>.{lowerCase(extension)}</option>)}
                            </Select>} />
                    </GridItem>
                    <GridItem colSpan={4} as={Center}>
                      <Field name={`files.${index}.fileType`} children={(fieldProps: FieldProps) =>
                          <Select {...fieldProps.field} h={9} isDisabled={index < 3}>
                            {selectionOptions['fileType'].map(type =>
                                <option key={type} value={type}>
                                  {capitalize(type.replace('_', ' ').toLowerCase())}
                                </option>)}
                          </Select>} />
                    </GridItem>
                    <GridItem>
                      {index >= 3 &&
                        <Tooltip label='Remove file'>
                          <IconButton variant='ghost' aria-label='remove file' icon={<AiOutlineClose />}
                                      isRound onClick={() => fieldArrayProps.remove(index)} />
                        </Tooltip>}
                    </GridItem>
                  </>)}
              <GridItem colSpan={3}>
                <Button leftIcon={<AiOutlineFileAdd />} variant='outline' boxShadow='sm' rounded='lg' p={4} colorScheme='blue'
                        onClick={() => fieldArrayProps.push(fileSchema.getDefaultFromShape())}>Add file</Button>
              </GridItem>
            </Grid>} />
      </Stack>
  )
}

export function DateField({ label, isEnd }: { label: string, isEnd?: boolean }) {
  const defaultDate = new Date(new Date().setHours(0, 0 ,0, 0))
  const fieldStyle: any = useStyleConfig('Input', { variant: 'outline' })
  return (
      <Field name={(isEnd ? 'end' : 'start') + 'Date'} children={(fieldProps: FieldProps) =>
          <FormControl isInvalid={fieldProps.meta.value && fieldProps.meta.error}
                       isDisabled={isEnd && !fieldProps.form.values.startDate}>
            <FormLabel>{label}</FormLabel>
            <ChakraDateTimePicker name={fieldProps.field.name} hour24 value={fieldProps.field.value || defaultDate}
                                  minDate={isEnd && fieldProps.form.values.startDate} __css={{ input: fieldStyle.field }}
                                  disabled={isEnd && !fieldProps.form.values.startDate}
                                  onChange={(newDate) => fieldProps.form.setFieldValue(fieldProps.field.name, newDate)} />
            <FormErrorMessage>{fieldProps.meta.value && fieldProps.meta.error}</FormErrorMessage>
          </FormControl>} />
  )
}
