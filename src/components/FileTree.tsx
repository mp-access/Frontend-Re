import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Icon, Text } from '@chakra-ui/react'
import { dropRight, isMap, range } from 'lodash'
import React from 'react'
import { FolderIcon, LanugageIcon } from './Icons'

type NodeProps = { value: number, onClick: (file: TaskFileProps) => void }
type FileNodeProps = NodeProps & { data: TaskFileProps }
type FolderNodeProps = NodeProps & { name: string, node: Map<string, any> }
type RootNodeProps = NodeProps & { data: Array<TaskFileProps> }

const File = ({ data, value, onClick }: FileNodeProps) =>
    <AccordionItem border='0 solid transparent' bg={value === data.id ? 'blackAlpha.100' : 'inherit'}>
      <AccordionButton borderWidth={0} onClick={() => onClick(data)} fontSize='sm'>
        <Icon as={LanugageIcon(data.language)} ml={data.path.split('/').length * 7} mr={2} boxSize={4} />
        <Text>{data.name}</Text>
      </AccordionButton>
    </AccordionItem>

const Folder = ({ name, node, ...props }: FolderNodeProps) => {
  if (!isMap(node))
    return <File {...props} data={node} />
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

export function FileTree({ data, ...props }: RootNodeProps) {
  const taskTree = new Map()
  data.forEach(file => dropRight(file.path.split('/')).reduce((tree, folder) =>
      tree.set(folder, tree.get(folder) || new Map()).get(folder), taskTree).set(file.name, file))
  return (
      <Accordion fontFamily='Inter, Roboto, sans-serif' color='gray.600' allowMultiple
                 defaultIndex={range(taskTree.size)} border='0 solid transparent'>
        {[...taskTree.entries()].map(([folder, node]) => <Folder key={folder} name={folder} node={node} {...props} />)}
      </Accordion>
  )
}
