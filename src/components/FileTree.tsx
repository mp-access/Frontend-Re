import { Box, HStack, Icon, Text, useBoolean } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { dropRight, isMap } from 'lodash'
import React, { ComponentProps } from 'react'
import { FolderIcon, TypeIcon } from './Icons'

const getFolder = (tree: Map<string, any>, node: string) => tree.set(node, tree.get(node) || new Map()).get(node)
const createTree = (data: any[]) => {
  const taskFolders = new Map()
  data.forEach((file: TaskFileProps) => dropRight(file.path.split('/'))
      .reduce((tree, folder) => getFolder(tree, folder), taskFolders).set(file.name, file))
  return taskFolders
}

const File = ({ content, value, onChange }: ComponentProps<any>) =>
    <motion.li>
      <HStack as={motion.div} layout initial='collapsed' animate='open' exit='collapsed'
              cursor='pointer' _hover={{ color: 'gray.550' }} onClick={() => onChange(content)}
              bg={value === content.id ? 'blackAlpha.50' : 'transparent'}
              variants={{ open: { opacity: 1, height: 'auto' }, collapsed: { opacity: 0, height: 0 } }}>
        <Icon as={TypeIcon(content.language)} my={2} ml={2 + (content.path.split('/').length - 1) * 6} boxSize={4} />
        <Text>{content.name}</Text>
      </HStack>
    </motion.li>

const Folder = ({ label, content, ...props }: ComponentProps<any>) => {
  const [isExpanded, { toggle }] = useBoolean(true)
  return (
      <motion.ul layout>
        <HStack as={motion.div} layout onClick={toggle} cursor='pointer' _hover={{ color: 'gray.550' }}>
          <Icon as={FolderIcon} m={2} boxSize={4} />
          <Text>{label}</Text>
        </HStack>
        <AnimatePresence>
          {isExpanded && [...content.keys()].map(folder =>
              <Node key={folder} label={folder} content={content.get(folder)} {...props} />)}
        </AnimatePresence>
      </motion.ul>
  )
}

const Node = (props: ComponentProps<any>) => isMap(props.content) ? <Folder {...props} /> : <File {...props} />

export const FileTree = ({ data, ...props }: ComponentProps<any>) =>
    <Box fontFamily='Inter, Roboto, sans-serif' fontSize='sm' color='gray.600'>
      {[...createTree(data).entries()].map(([folder, content]) =>
          <Node key={folder} label={folder} content={content} {...props} />)}
    </Box>

