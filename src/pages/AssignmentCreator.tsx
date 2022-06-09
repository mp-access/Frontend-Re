import { Heading, Stack, TabPanel, VStack } from '@chakra-ui/react'
import React from 'react'
import { AiOutlineFundProjectionScreen } from 'react-icons/ai'
import CreatorForm from '../forms/CreatorForm'
import { AssignmentDatesField, DescriptionField, NameField, URLField } from '../forms/InputFields'
import { AssignmentTypeField } from '../forms/TypesFields'

export default function AssignmentCreator() {
  const fields = ['name', 'url', 'description', 'assignmentType', 'startDate', 'endDate']

  return (
      <VStack flexGrow={1} p={6} spacing={4}>
        <Heading fontSize='3xl'>Create Assignment</Heading>
        <CreatorForm fields={fields} url='/assignments'>
          <TabPanel as={Stack} spacing={4} px={0}>
            <Heading fontSize='2xl'>Assignment Details</Heading>
            <NameField prefix='Assignment' icon={AiOutlineFundProjectionScreen}/>
            <URLField />
            <DescriptionField />
          </TabPanel>
          <TabPanel px={0}>
            <Heading fontSize='2xl'>Select assignment type</Heading>
            <AssignmentTypeField />
            <AssignmentDatesField />
          </TabPanel>
        </CreatorForm>
      </VStack>
  )
}