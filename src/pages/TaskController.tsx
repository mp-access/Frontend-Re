import {
  Button, ButtonGroup, Center, HStack, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader,
  ModalOverlay, Stack, Text, useDisclosure, useNumberInput
} from '@chakra-ui/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Select } from 'chakra-react-select'
import React, { ComponentProps } from 'react'
import { FaCog, FaHistory } from 'react-icons/fa'

export default function TaskController({ task, value, defaultValue, onChange }: ComponentProps<any>) {
  const { isOpen, onClose } = useDisclosure()
  const { data: students } = useQuery<StudentProps[]>(['students'])

  const min = task.remainingAttempts
  const { valueAsNumber, ...input } = useNumberInput({ step: 1, defaultValue: min, min, max: task.maxAttempts })
  const { mutate: override, isLoading } = useMutation<any, any, object>(['students'], { onSuccess: onClose })
  const addAttempts = () => override({ taskId: task.id, userId: value, addAttempts: valueAsNumber - min })

  return (
      <HStack>
        <Stack w='2xs' fontSize='sm' bg='base' rounded='lg'>
          <Select placeholder='View as student...' value={{ email: value }} getOptionValue={data => data?.email}
                  getOptionLabel={data => data?.email} options={students}
                  controlShouldRenderValue={value !== defaultValue} isClearable focusBorderColor='blue.600'
                  onChange={newValue => onChange(newValue?.email || defaultValue)} />
        </Stack>
        <ButtonGroup isAttached pos='relative'>
          <Button leftIcon={<FaCog />} children='Control' isLoading={isLoading} />
          <Button borderLeftWidth={1} borderColor='purple.100' leftIcon={<FaHistory />} children='Re-Grade'
                  isLoading={isLoading} />
        </ButtonGroup>
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <Text textAlign='center' color='purple.600'>Override Student Settings</Text>
              <ModalCloseButton />
            </ModalHeader>
            <ModalBody>
              <Text>Student: <b>{value}</b></Text>
              <HStack my={4}>
                <Text whiteSpace='nowrap'>Remaining attempts:</Text>
                <ButtonGroup size='sm'>
                  <Button {...input.getDecrementButtonProps()}>-</Button>
                  <Input {...input.getInputProps()} textAlign='center' p={0} size='sm' maxW='3rem' />
                  <Button {...input.getIncrementButtonProps()}>+</Button>
                </ButtonGroup>
              </HStack>
              <Center p={3}>
                <Button isDisabled={valueAsNumber <= min} isLoading={isLoading} variant='round' children='Confirm'
                        onClick={addAttempts} />
              </Center>
            </ModalBody>
          </ModalContent>
        </Modal>
      </HStack>
  )
}