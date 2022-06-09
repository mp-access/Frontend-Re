import { Heading, Image, Link, ListItem, OrderedList, UnorderedList } from '@chakra-ui/react'
import React, { ComponentProps } from 'react'
import { CodeProps } from 'react-markdown/lib/ast-to-react'
import { atomOneLight } from 'react-syntax-highlighter/dist/cjs/styles/hljs'
import remarkGfm from 'remark-gfm'
import { ChakraHighlighter, ChakraMarkdown } from '../../components/Base'

export default function MarkdownViewer({ task }: { task: TaskWorkspaceProps }) {

  function CodeHighlighter({ inline, children, ...props }: CodeProps) {
    const inlineStyle = { display: 'inline !important', p: '3px !important', PreTag: 'code' }
    return <ChakraHighlighter children={children} style={atomOneLight} {...props} language='python' wrapLongLines
                              fontSize='85%' whiteSpace='break-spaces' wordBreak='break-word' {...(inline ? inlineStyle : {})} />
  }

  function ImageRenderer(props: ComponentProps<any>) {
    const imageName = props.src?.replace('resource/', '')
    const imageBytes = task.files?.find(f => f.name === imageName)?.content
    return <Image src={`data:image/png;base64,${imageBytes || ''}`} h='auto' />
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

  return <ChakraMarkdown children={task.description} fontSize='90%' components={components} remarkPlugins={[remarkGfm]}
                         maxW='99%' pl={2} py={1} pr={0} wordBreak='break-word' whiteSpace='pre-wrap' />
}