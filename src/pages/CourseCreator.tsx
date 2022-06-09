import { Heading, HStack, Stack, TabPanel, Text, VStack } from '@chakra-ui/react'
import React from 'react'
import { AiOutlineRead } from 'react-icons/ai'
import CreatorForm from '../forms/CreatorForm'
import { DateField, NameField, UniversityField, URLField } from '../forms/InputFields'
import { OrganizationTypeField } from '../forms/TypesFields'

export default function CourseCreator() {
  const fields = ['name', 'url', 'startDate', 'endDate', 'organization', 'university', 'semester']

  return (
      <VStack spacing={4} pt={5}>
        <Heading fontSize='3xl'>Let's get started!</Heading>
        <Text color='gray.600' textAlign='center' lineHeight={1.5} w='md'>
          Follow these steps to create a new course on ACCESS.
        </Text>
        <CreatorForm fields={fields} url='/courses'>
          <TabPanel as={Stack} spacing={4} px={0}>
            <Heading fontSize='2xl'>Course Details</Heading>
            <NameField prefix='Course' icon={AiOutlineRead}/>
            <URLField />
            <HStack spacing={4}>
              <DateField label='Start Date' />
              <DateField label='End Date' isEnd />
            </HStack>
          </TabPanel>
          <TabPanel px={0}>
            <Heading fontSize='2xl'>Select your organization type</Heading>
            <OrganizationTypeField />
            <UniversityField />
          </TabPanel>
        </CreatorForm>
      </VStack>
  )
}
