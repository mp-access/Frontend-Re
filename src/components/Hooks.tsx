import { useMonaco } from '@monaco-editor/react'
import { Uri } from 'monaco-editor'

export const useCodeEditor = () => {
  const monaco = useMonaco()
  const getEditedContent = (path: string) => monaco?.editor.getModel(Uri.file(path))?.getValue()
  return { getEditedContent }
}