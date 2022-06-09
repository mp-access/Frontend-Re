import { Spinner } from '@chakra-ui/react'
import Editor from '@monaco-editor/react'
import React from 'react'

export default function CodeEditor({ file, onChange }: { file: TaskFileProps, onChange: any }) {
  const options: any = {
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    ...(!file.editable && { wordWrap: 'on', lineNumbers: 'off' }) }
  return <Editor height='calc(100% - 5vh)' width='100%' theme='light' loading={<Spinner />} path={file.id.toString()}
                 language={file.language} value={file.content || file.template} onChange={onChange} options={options} />
}