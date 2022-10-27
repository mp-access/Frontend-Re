import { chakra, Heading, Image, Link, ListItem, OrderedList, UnorderedList } from '@chakra-ui/react'
import React, { ComponentProps } from 'react'
import ReactMarkdown from 'react-markdown'
import { CodeProps } from 'react-markdown/lib/ast-to-react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atomOneLight } from 'react-syntax-highlighter/dist/cjs/styles/hljs'
import remarkGfm from 'remark-gfm'

const MarkdownBase = chakra(ReactMarkdown)
const HighlighterBase = chakra(SyntaxHighlighter)

export default function Description({ task }: { task: TaskProps }) {

  function CodeHighlighter({ inline, children, ...props }: CodeProps) {
    return <HighlighterBase children={children} style={atomOneLight} {...props} language='python' wrapLongLines
                            fontSize='85%' whiteSpace='break-spaces' wordBreak='break-word'
                            {...(inline && { display: 'inline !important', p: '3px !important', PreTag: 'code' })} />
  }

  function ImageRenderer({ src }: ComponentProps<any>) {
    const imageName = src?.replace('resource/', '')
    const imageBytes = task.files?.find(f => f.name === imageName)?.template
    return <Image src={`data:image/png;base64,${imageBytes || ''}`} h='auto' pr={3} />
  }

  const components = {
    code: CodeHighlighter,
    a: (props: ComponentProps<any>) => <Link color='blue.500' fontSize='95%' {...props} />,
    h3: (props: ComponentProps<any>) => <Heading fontSize='lg' {...props} />,
    h2: (props: ComponentProps<any>) => <Heading fontSize='xl' {...props} />,
    li: ({ children }: ComponentProps<any>) => <ListItem children={children} />,
    ul: ({ children }: ComponentProps<any>) => <UnorderedList children={children} />,
    ol: ({ children }: ComponentProps<any>) => <OrderedList children={children} />,
    img: ImageRenderer
  }

  return <MarkdownBase children={task.description} fontSize='90%' components={components} remarkPlugins={[remarkGfm]}
                       wordBreak='break-word' whiteSpace='pre-wrap' overflow='auto' boxSize='full' />
}