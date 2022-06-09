import React from 'react'
import { ChakraFileTree } from '../../components/Base'
import { FileIcon, FolderIcon } from '../../components/Icons'

type FileTreeProps = { index: number, setIndex: any, task: TaskWorkspaceProps }

export default function FileTree({ index, setIndex, task }: FileTreeProps) {
  const taskTree = {
    label: 'task_'+task.ordinalNum, icon: <FolderIcon />, isExpanded: true,
    children: task.files.map(file => ({ label: file.name, icon: <FileIcon /> }))
  }
  return <ChakraFileTree selectedNode={'node-1.'+(index+1)} data={[taskTree]} fontSize='xs' maxW='95%'
                         onNodeSelect={event => setIndex(event.nodePath[1])} __css={{ 'ul': { listStyle: 'none' } }} />
}