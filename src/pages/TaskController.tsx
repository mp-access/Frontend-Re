import {
  Button, ButtonGroup, Center, HStack, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader,
  ModalOverlay, Stack, Text, Tooltip, useDisclosure, useNumberInput
} from '@chakra-ui/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Select } from 'chakra-react-select'
import React, { ComponentProps } from 'react'
import { AiOutlineControl } from 'react-icons/ai'

export default function TaskController({ task, value, defaultValue, onChange }: ComponentProps<any>) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { data: students } = useQuery<StudentProps[]>(['students'])

  const min = task.remainingAttempts
  const { valueAsNumber, ...input } = useNumberInput({ step: 1, defaultValue: min, min, max: task.maxAttempts })
  const { mutate: override, isLoading } = useMutation<any, any, object>(['students'], { onSuccess: onClose })
  const addAttempts = () => override({ taskId: task.id, userId: value, addAttempts: valueAsNumber - min })

  return (
      <HStack>
        <Stack w='3xs' bg='base'>
          <Select placeholder='View as student...' value={{ email: value }} getOptionValue={data => data?.email}
                  getOptionLabel={data => data?.email} options={students}
                  controlShouldRenderValue={value !== defaultValue}
                  onChange={newValue => onChange(newValue?.email || defaultValue)} />
        </Stack>
        <Tooltip label='Override student settings'>
          <IconButton aria-label='adjust' icon={<AiOutlineControl size='100%' />} colorScheme='gray' p={1}
                      color='gray.600' onClick={onOpen} isDisabled={value === defaultValue} />
        </Tooltip>
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