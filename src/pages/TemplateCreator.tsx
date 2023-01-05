import {
  Button, ButtonGroup, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, useDisclosure
} from '@chakra-ui/react'
import { AddIcon } from '@chakra-ui/icons'
import React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useTemplateFiles } from '../components/Hooks'
import { creatorForm, TableField } from '../components/Fields'
import { SaveButton } from '../components/Buttons'

export default function TemplateCreator() {
  const { submit } = useTemplateFiles()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const form = useForm(creatorForm('templates'))
  const onSubmit = form.handleSubmit(data => submit(data).then(onClose))

  return (
      <>
        <Button onClick={onOpen} variant='ghost' size='sm' leftIcon={<AddIcon />}>Add Templates</Button>
        <Modal isOpen={isOpen} onClose={onClose} isCentered size='lg'>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <Text textAlign='center' color='purple.600'>Add Files From Template Repository</Text>
              <ModalCloseButton />
            </ModalHeader>
            <FormProvider {...form}>
              <ModalBody as='form' onSubmit={onSubmit}>
                <TableField name='templates' title='Repository Paths' />
                <ButtonGroup p={3} w='full' justifyContent='center'>
                  <SaveButton formState={form.formState} />
                </ButtonGroup>
              </ModalBody>
            </FormProvider>
          </ModalContent>
        </Modal>
      </>
  )
}