import { Box, chakra } from '@chakra-ui/react'
import { TabPanel } from 'primereact/tabview'
import { ComponentProps } from 'react'
import ReactMarkdown from 'react-markdown'
import { DateTimePicker, Option, Picklist, Tree } from 'react-rainbow-components'
import SyntaxHighlighter from 'react-syntax-highlighter'

export const ChakraFileTree = chakra(Tree)
export const ChakraPicklist = chakra(Picklist)
export const ChakraDateTimePicker = chakra(DateTimePicker)
export const ChakraOption = chakra(Option)
export const ChakraMarkdown = chakra(ReactMarkdown)
export const ChakraHighlighter = chakra(SyntaxHighlighter)

export const HiddenPanel = chakra(TabPanel)

export function Scroll(props: ComponentProps<any>) {
  const style = {
    transition: 'all 3s ease-in-out',
    '&:hover': { '&::-webkit-scrollbar-thumb': { visibility : 'visible' } },
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      width: '10px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'var(--chakra-colors-purple-500)',
      borderRadius: '24px',
      visibility: 'hidden',
    },
  }
  return <Box sx={style} w='full' h='full' overflowY='scroll' {...props} />
}