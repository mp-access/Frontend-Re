import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Icon, Text } from '@chakra-ui/react'
import { dropRight, isMap, range } from 'lodash'
import React from 'react'
import { FolderIcon, LanugageIcon } from './Icons'

type NodeProps = { id: number, onClick: (file: TaskFileProps) => void }
type FileNodeProps = NodeProps & { file: TaskFileProps }
type FolderNodeProps = NodeProps & { name: string, node: Map<string, any> }
type RootNodeProps = NodeProps & { files: Array<TaskFileProps> }

const File = ({ file, id, onClick }: FileNodeProps) =>
    <AccordionItem border='0 solid transparent' bg={id === file.id ? 'blackAlpha.100' : 'inherit'}>
      <AccordionButton borderWidth={0} onClick={() => onClick(file)} fontSize='sm'>
        <LanugageIcon name={file.language} ml={file.path.split('/').length * 6} mr={2} boxSize={4} />
        <Text>{file.name}</Text>
      </AccordionButton>
    </AccordionItem>

const Folder = ({ name, node, ...props }: FolderNodeProps) => {
  if (!isMap(node))
    return <File {...props} file={node} />
  return (
      <AccordionItem borderWidth={0}>
        <AccordionButton borderWidth={0} fontSize='sm'>
          <AccordionIcon />
          <Icon as={FolderIcon} mx={2} boxSize={4} />
          <Text>{name}</Text>
        </AccordionButton>
        <AccordionPanel p={0}>
          {[...node.keys()].map(folder => <Folder key={folder} name={folder} node={node.get(folder)} {...props} />)}
        </AccordionPanel>
      </AccordionItem>
  )
}

export function FileTree({ files, ...props }: RootNodeProps) {
  const taskTree = new Map()
  files.forEach(file => dropRight(file.path.split('/')).reduce((tree, folder) =>
      tree.set(folder, tree.get(folder) || new Map()).get(folder), taskTree).set(file.name, file))
  return (
      <Accordion fontFamily='file' color='gray.600' allowMultiple defaultIndex={range(taskTree.size)}>
        {[...taskTree.entries()].map(([folder, node]) => <Folder key={folder} name={folder} node={node} {...props} />)}
      </Accordion>
  )
}
