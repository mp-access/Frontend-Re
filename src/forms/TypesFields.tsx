import { Center, FormControl, Text } from '@chakra-ui/react'
import { Field, FieldProps } from 'formik'
import { lowerCase } from 'lodash'
import React from 'react'
import { VisualPicker, VisualPickerOption } from 'react-rainbow-components'
import { ClassIcon, HouseIcon, PracticeIcon, TheoryIcon, UniversityIcon } from '../components/Icons'

function TypeField({ fieldName, options }: { fieldName: string, options: Array<{ value: string, icon: any }> }) {
  return (
      <Field name={fieldName} children={(fieldProps: FieldProps) =>
          <FormControl as={Center} my={4} isInvalid={fieldProps.meta.touched && !!fieldProps.meta.error}>
            <VisualPicker {...fieldProps.field} onChange={value => fieldProps.form.setFieldValue(fieldName, value)}>
              {options.map((option) =>
                  <VisualPickerOption key={option.value} name={option.value}>
                    <option.icon />
                    <Text textTransform='capitalize' mt={2}>
                      {lowerCase(option.value.replace('_', ' '))}
                    </Text>
                  </VisualPickerOption>)}
            </VisualPicker>
          </FormControl>} />
  )
}

export function AssignmentTypeField() {
  const options = [{ value: 'homework', icon: HouseIcon }, { value: 'in class', icon: ClassIcon }]
  return <TypeField fieldName='assignmentType' options={options}/>
}

export function TaskTypeField() {
  const options = [{ value: 'SINGLE_CHOICE', icon: TheoryIcon }, { value: 'MULTIPLE_CHOICE', icon: TheoryIcon },
    { value: 'TEXT', icon: TheoryIcon }, { value: 'CODE', icon: PracticeIcon }, { value: 'CODE_SNIPPET', icon: PracticeIcon }]
  return <TypeField fieldName='taskType' options={options}/>
}

export function OrganizationTypeField() {
  const options = [{ value: 'university', icon: UniversityIcon }, { value: 'private', icon: HouseIcon }]
  return <TypeField fieldName='organization' options={options} />
}