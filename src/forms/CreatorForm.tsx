import {
  Button, Divider, Heading, HStack, Icon, Stack, TabList, TabPanel, TabPanels, Tabs, Text, useToast, VStack
} from '@chakra-ui/react'
import { Form, Formik, FormikProps, FormikValues } from 'formik'
import React, { Children, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFetch } from 'use-http'
import { ReactComponent as RocketIllustration } from '../assets/rocket.svg'
import { StepTab, TabNavButtons } from './FormProgress'
import { baseSchema } from './Schemas'

export default function CreatorForm({ fields, url, children }: { fields: any, url: string, children: ReactNode }) {
  const { post, response } = useFetch(url)
  const navigate = useNavigate()
  const schema = baseSchema.pick(fields)
  const numSteps = Children.count(children)
  const toast = useToast()

  const onSubmit = (values: FormikValues) => post(values).then(data =>
      response.ok ? navigate('..') : toast({ title: data.message, status: 'error' }))

  return (
      <Formik initialValues={schema.getDefaultFromShape()} validationSchema={schema} onSubmit={onSubmit}>
        {(formProps: FormikProps<any>) =>
            <Tabs as={Form} w='xl' display='flex' flexDir='column' gap={6} variant='solid-rounded'>
              <Stack p={10} bg='white' boxShadow='lg' rounded='3xl' borderWidth={1} spacing={5}>
                <TabList as={HStack} justifyContent='space-between' spacing={3}>
                  {[...Array(numSteps+1)].map((_, index) =>
                      <StepTab key={index} index={index} isLast={index === numSteps} />)}
                </TabList>
                <Divider borderBottomWidth={2} />
                <TabPanels>
                  {children}
                  <TabPanel as={VStack} p={1} spacing={3}>
                    <Icon as={RocketIllustration} boxSize='20%'/>
                    <Heading fontSize='3xl'>Almost done!</Heading>
                    <Text textAlign='center' color='gray.600' w='sm'>
                      Please review the information you provided previously and when you are ready, click submit.
                    </Text>
                    <Button variant='round' type='submit' isDisabled={!formProps.dirty || !formProps.isValid}
                            isLoading={formProps.isSubmitting}>
                      Submit
                    </Button>
                  </TabPanel>
                </TabPanels>
              </Stack>
              <TabNavButtons lastIndex={numSteps} />
            </Tabs>}
      </Formik>
  )
}