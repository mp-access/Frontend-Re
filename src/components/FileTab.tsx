import { CloseButton, Flex, Text, UseDisclosureProps } from '@chakra-ui/react'
import { AnimatePresence, Reorder } from 'framer-motion'
import React from 'react'

type FileTabProps = UseDisclosureProps & { value: TaskFileProps }
type FileTabsProps = {
  values: TaskFileProps[], defaultValue: number,
  onSelect: (file: TaskFileProps) => void, onReorder: (files: TaskFileProps[]) => void
}

export const FileTab = ({ value, isOpen, onOpen, onClose }: FileTabProps) =>
    <Flex as={Reorder.Item} value={value} id={value.id.toString()} whileDrag={{ opacity: 1 }}
          alignItems='baseline' borderColor='blackAlpha.200' borderWidth={1} borderBottomWidth={0} bg='base'
          px={2} py={1} roundedTop='lg' cursor='pointer' layerStyle='file' pos='relative' lineHeight={1.8}
          initial={{ opacity: 0, y: 30 }} exit={{ opacity: 0, y: 20, transition: { duration: 0.3 } }}
          animate={{ opacity: isOpen ? 1 : 0.6, y: 0, transition: { duration: 0.15 } }}>
      <Text whiteSpace='nowrap' px={1} onClick={onOpen} children={value.name} />
      <CloseButton size='sm' isDisabled={isOpen} onClick={onClose} />
    </Flex>

export const FileTabs = ({ values, defaultValue, onReorder, onSelect }: FileTabsProps) =>
    <Reorder.Group as='ul' axis='x' onReorder={onReorder} values={values} className='filetabs'>
      <AnimatePresence initial={false}>
        {values.map(value =>
            <FileTab key={value.id} value={value} isOpen={value.id === defaultValue} onOpen={() => onSelect(value)}
                     onClose={() => onReorder(values.filter(openFile => openFile.id !== value.id))} />)}
      </AnimatePresence>
    </Reorder.Group>