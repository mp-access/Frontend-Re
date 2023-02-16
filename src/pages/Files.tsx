import {
  Box, Button, ButtonGroup, Heading, HStack, Icon, IconButton, Modal, ModalBody, ModalCloseButton, ModalContent,
  ModalHeader, ModalOverlay, SimpleGrid, Stack, Table, Tbody, Td, Text, Th, Thead, Tr, useDisclosure
} from '@chakra-ui/react'
import { AddIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import React from 'react'
import { FormProvider } from 'react-hook-form'
import { useCreatorForm, useTemplateFiles } from '../components/Hooks'
import { FormField } from '../components/Fields'
import { SaveButton, TooltipButton } from '../components/Buttons'
import { FcDataConfiguration } from 'react-icons/fc'
import { BsGithub } from 'react-icons/bs'
import { FiFilePlus, FiRefreshCw } from 'react-icons/fi'

export default function Files() {
  const { submit, data: templateFiles } = useTemplateFiles()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const form = useCreatorForm('templates')
  const onSubmit = form.handleSubmit(data => submit({ templates: data.templates?.split('\n') }).then(onClose))

  if (!templateFiles)
    return <></>

  return (
      <SimpleGrid columns={1} templateRows='auto auto 1fr' layerStyle='segment' mx='auto' my={4}
                  overflow='hidden' maxW='container.md' maxH='95%'>
        <HStack w='full'>
          <Icon as={FcDataConfiguration} boxSize={8} mb={1} />
          <Heading mx={2} fontSize='2xl' h={8}>Files Manager</Heading>
          <Button variant='ghost' colorScheme='green' leftIcon={<FiRefreshCw />} children='Refresh All'
                  onClick={() => submit({ templates: templateFiles.map(f => f.path) })} />
          <Box flexGrow={1} />
          <Button onClick={onOpen} variant='ghost' leftIcon={<AddIcon />}>Add Template</Button>
          <TooltipButton title='Soon!' variant='ghost' leftIcon={<FiFilePlus color='green.400' fontSize='110%' />}
                         children='Upload' isDisabled />
          <Modal isOpen={isOpen} onClose={onClose} isCentered size='lg'>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>
                <Text textAlign='center' color='purple.600'>Add Files From Template Repository</Text>
                <ModalCloseButton />
              </ModalHeader>
              <FormProvider {...form}>
                <ModalBody as='form' onSubmit={onSubmit}>
                  <Text p={4}>
                    {`Upload your new template files to the ACCESS template repository, then enter below the `}
                    {`relative paths to the files.`}
                  </Text>
                  <FormField name='templates' title='Repository Paths' form='text' />
                  <ButtonGroup p={3} w='full' justifyContent='center'>
                    <SaveButton formState={form.formState} />
                  </ButtonGroup>
                </ModalBody>
              </FormProvider>
            </ModalContent>
          </Modal>
        </HStack>
        <Stack p={3} pb={5}>
          <Text>
            {`Add template files from the `}
            <Button variant='link' rightIcon={<ExternalLinkIcon />} iconSpacing={1} target='_blank' colorScheme='blue'
                    as='a' href={templateFiles[0]?.link.split('/blob')[0]} children='ACCESS Templates Repository' />
            {` or upload your own files to make them available within this course.`}
          </Text>
          <Text>
            {`Refresh `}
            <Icon as={FiRefreshCw} h={3} mt={1} w={4} color='green.400' />
            {` one or all template files to fetch the latest content from the repository.`}
          </Text>
        </Stack>
        <Stack overflow='auto'>
          <Table size='sm'>
            <Thead pos='sticky' bg='base' zIndex={1} top={0}>
              <Tr>
                <Th>File Path</Th>
                <Th>View</Th>
                <Th>Last Update</Th>
                <Th>Refresh</Th>
              </Tr>
            </Thead>
            <Tbody>
              {templateFiles.map(file =>
                  <Tr key={file.id}>
                    <Td minW='xs'>{file.path}</Td>
                    <Td>
                      <Button variant='link' rightIcon={<ExternalLinkIcon />} fontWeight={400} children=''
                              leftIcon={<BsGithub color='black' fontSize='120%' />}
                              as='a' href={file.link} iconSpacing={1} target='_blank' colorScheme='blue' />
                    </Td>
                    <Td>{file.updatedAt}</Td>
                    <Td textAlign='center'>
                      <IconButton aria-label='refresh' icon={<FiRefreshCw fontSize='120%' />} variant='ghost'
                                  size='sm' colorScheme='green' onClick={() => submit({ templates: [file.path] })} />
                    </Td>
                  </Tr>)}
            </Tbody>
          </Table>
        </Stack>
      </SimpleGrid>
  )
}