import {
  Button, ButtonGroup, FormLabel, HStack, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader,
  ModalOverlay, Stack, Text, useDisclosure
} from '@chakra-ui/react'
import { AddIcon } from '@chakra-ui/icons'
import React from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useFieldArray, useForm } from 'react-hook-form'
import { range } from 'lodash'

export default function TemplateCreator() {
  const { refetch: refreshFiles } = useQuery<TemplateFileProps[]>(['files'])
  const { mutateAsync: createFile } = useMutation<string, object, object>(['files'])
  const { isOpen, onOpen, onClose } = useDisclosure({ onClose: refreshFiles })
  const { register, control, handleSubmit, formState } = useForm()
  const { fields, append } = useFieldArray({ name: 'paths', control })
  const onSubmit = handleSubmit(data => createFile(data).then(onClose))
  return (
      <>
        <Button onClick={onOpen} variant='ghost' size='sm' leftIcon={<AddIcon />}>Add File</Button>
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <Text textAlign='center' color='purple.600'>Add Template File</Text>
              <ModalCloseButton />
            </ModalHeader>
            <ModalBody>
              <Stack>
                <HStack justify='space-between'>
                  <FormLabel>Repository File Paths</FormLabel>
                  <Button size='sm' variant='ghost' onClick={() => append('')}
                          leftIcon={<AddIcon />} children='Add' />
                </HStack>
                {range(fields.length || 1).map(i =>
                    <Input variant='outline' key={i} {...register(`paths.${i}`)} placeholder='Enter value' />)}
                <ButtonGroup p={3} w='full' justifyContent='center'>
                  <Button isLoading={formState.isSubmitting} onClick={onSubmit} children='Submit' />
                </ButtonGroup>
              </Stack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </>
  )
}