import {
  Button, ButtonGroup, Center, FormControl, FormHelperText, Icon, Modal, ModalBody, ModalCloseButton, ModalContent,
  ModalFooter, ModalHeader, ModalOverlay, Spinner, Stack, Text, Textarea, useBoolean, useDisclosure, useToast, VStack
} from '@chakra-ui/react'
import { Field, FieldProps, Form, Formik, FormikProps } from 'formik'
import getEmails from 'get-emails'
import React from 'react'
import Countdown from 'react-countdown'
import {
  AiOutlineCloudUpload, AiOutlineGithub, AiOutlinePlusCircle, AiOutlineSend, AiOutlineUserSwitch
} from 'react-icons/ai'
import { FileSelector } from 'react-rainbow-components'
import { useOutletContext } from 'react-router-dom'
import { useFetch } from 'use-http'
import { SearchSelector } from '../forms/InputFields'
import { baseSchema } from '../forms/Schemas'
import { ChakraOption } from './Base'

export function NewCourseModal() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { post, response, loading } = useFetch('/courses')
  let [repository, setRepository] = React.useState('')
  const toast = useToast()

  const onSubmit = () => post({ repository }).then(() =>
      toast({
        title: response.ok ? 'Course created successfully! Redirecting...' :
            'Failed to create course, please check the repository link',
        status: response.ok ? 'success' : 'error',
        duration: 2000,
        onCloseComplete: () => response.ok && window.location.reload()
      }))

  return (
      <>
        <Button h='xs' w='2xs' flexDir='column' rounded='3xl' variant='outline' border='2px dashed' fontSize='xl'
                color='purple.400' leftIcon={<Icon as={AiOutlinePlusCircle} boxSize='2rem' m={2}/>} onClick={onOpen}>
          Create Course
        </Button>
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <Text textAlign='center' color='purple.600'>Create Course</Text>
              <ModalCloseButton />
            </ModalHeader>
            <ModalBody as={Stack} spacing={4} p={4}>
              <Text>Please enter a link to the course repository:</Text>
              <Textarea value={repository} onChange={event => setRepository(event.target.value)} />
              <ButtonGroup justifyContent='center'>
                <Button variant='round' colorScheme='purple' isLoading={loading} onClick={onSubmit}>Create</Button>
              </ButtonGroup>
            </ModalBody>
          </ModalContent>
        </Modal>
      </>
  )
}

export function PullModal() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { put, response, loading } = useFetch()
  const toast = useToast()

  const onSubmit = () => put().then(() =>
      toast({
        title: response.ok ? 'Course updated successfully! Redirecting...' : 'Failed to update course',
        status: response.ok ? 'success' : 'error',
        duration: 2000,
        onCloseComplete: () => response.ok && window.location.reload()
      }))

  return (
      <>
        <Button variant='nav' leftIcon={<AiOutlineGithub />} onClick={onOpen}>Pull</Button>
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <Text textAlign='center' color='purple.600'>Update Course Content</Text>
              <ModalCloseButton />
            </ModalHeader>
            <ModalBody as={VStack} justifyContent='center' spacing={4} py={4} px={10}>
              <Text textAlign='center'>
                Are you sure you want to pull the latest data from the course repository?
              </Text>
              <Button variant='round' colorScheme='purple' isLoading={loading} onClick={onSubmit}>Pull</Button>
            </ModalBody>
          </ModalContent>
        </Modal>
      </>
  )
}

export function ImpersonateModal({ value, onChange }: { value: string, onChange: any }) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { userId } = useOutletContext<CourseContext>()
  const { data: students } = useFetch<Array<StudentProps>>('/students', [])
  return (
      <>
        <Button variant='ghost' leftIcon={<Icon as={AiOutlineUserSwitch} boxSize='1.2rem' />} size='sm'
                color='gray.500' _hover={{ bg: 'purple.50' }} onClick={onOpen}>
          Impersonate
        </Button>
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <Text textAlign='center' color='purple.600'>Student Selector</Text>
              <ModalCloseButton />
            </ModalHeader>
            <ModalBody p={4} mb={4}>
              <SearchSelector placeholder='View as...' value={{ name: value, label: value }}
                              onChange={(selected: any) => { onChange(selected.name); onClose() }}>
                <ChakraOption name={userId} label='No impersonation' />
                {students?.map(student => <ChakraOption key={student.email} name={student.email} label={student.email} />)}
              </SearchSelector>
            </ModalBody>
          </ModalContent>
        </Modal>
      </>
  )
}

export function AddStudentsModal() {
  const acceptedTypes = ['text/plain', 'text/csv']
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { post } = useFetch('/students')
  const schema = baseSchema.pick(['students'])

  return (
      <>
        <Button boxShadow='sm' rounded='lg' p={4} leftIcon={<AiOutlineCloudUpload />} onClick={onOpen}>Import</Button>
        <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose} size='xl'>
          <ModalOverlay />
          <Formik initialValues={schema.getDefaultFromShape()} validationSchema={schema}
                  onSubmit={(values) => post(values.students).then(() => window.location.reload())}>
            {(formProps: FormikProps<any>) =>
                <ModalContent as={Form}>
                  <ModalHeader>
                    <Text textAlign='center' color='purple.600'>Add Students</Text>
                    <ModalCloseButton />
                  </ModalHeader>
                  <ModalBody p={8}>
                    <Field name='students' children={(fieldProps: FieldProps) =>
                        <FormControl as={VStack} spacing={4} isInvalid={fieldProps.meta.touched && !!fieldProps.meta.error}>
                          <Text>Upload a list of student emails via a file.</Text>
                          <FileSelector placeholder='Drag & Drop or Click to Browse' variant='multiline' accept='txt,csv'
                                        error={fieldProps.meta.error} bottomHelpText='Supported file types: txt, csv'
                                        onChange={(files) => {
                                          if (!files || !files[0])
                                            formProps.setFieldValue('students', [])
                                          else if (acceptedTypes.includes(files[0].type))
                                            files[0].text().then(content => fieldProps.form.setFieldValue(
                                                'students', Array.from(getEmails(content))))
                                          else fieldProps.form.setFieldError(
                                              'students', 'File type is not supported.')
                                        }} />
                          {!fieldProps.meta.error &&
                            <FormHelperText>Detected {fieldProps.field.value?.length || 0} emails.</FormHelperText>}
                        </FormControl>} />
                  </ModalBody>
                  <ModalFooter justifyContent='center'>
                    <Button type='submit' variant='round' isLoading={formProps.isSubmitting}
                            isDisabled={!formProps.dirty || !formProps.isValid}>Upload</Button>
                  </ModalFooter>
                </ModalContent>}
          </Formik>
        </Modal>
      </>
  )
}

export function SubmitModal({ onSubmit, loading, remaining }: { onSubmit: any, loading: boolean, remaining?: number }) {
  const { isAssistant } = useOutletContext<CourseContext>()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isLoading, { toggle }] = useBoolean()

  return (
      <>
        <Button variant='gradient' leftIcon={<AiOutlineSend />} colorScheme='green' onClick={onOpen}
                isDisabled={loading || (!isAssistant && !!remaining && remaining <= 0)}>
          Submit
        </Button>
        <Modal size='sm' isOpen={isOpen} onClose={onClose} isCentered closeOnOverlayClick={!isLoading}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <Text textAlign='center' color='purple.600'>
                {isLoading ? 'Evaluating submission...' : 'Confirm Submission'}
              </Text>
              {!isLoading && <ModalCloseButton />}
            </ModalHeader>
            <ModalBody>
              {isLoading ?
                  <VStack minH='8rem' align='center'>
                    <Center my={3}>
                      <Spinner />
                    </Center>
                    <Text>Timeout in</Text>
                    <Countdown date={Date.now() + 179000} renderer={
                      ({ minutes, seconds }) => loading && <Text>0{minutes}:{seconds}</Text>} />
                  </VStack> :
                <VStack p={3} minH='8rem' justify='space-between'>
                  <Text textAlign='center'>
                    Are you sure you want to submit?
                  </Text>
                  <ButtonGroup>
                    <Button px={7} py={6} variant='round-outline' onClick={onClose}>Cancel</Button>
                    <Button px={7} py={6} variant='round' colorScheme='purple'
                            onClick={() => { toggle(); onSubmit('grade').then(() => { onClose(); setTimeout(toggle, 1000) }) }}>
                      Confirm
                    </Button>
                  </ButtonGroup>
              </VStack>}
            </ModalBody>
          </ModalContent>
        </Modal>
      </>
  )
}