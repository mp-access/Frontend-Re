import { chakra, Heading, Image, ImageProps, Link, ListItem, OrderedList, UnorderedList } from '@chakra-ui/react'
import React, { ComponentProps } from 'react'
import ReactMarkdown from 'react-markdown'
import { CodeProps } from 'react-markdown/lib/ast-to-react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atomOneLight } from 'react-syntax-highlighter/dist/cjs/styles/hljs'
import remarkGfm from 'remark-gfm'

const MarkdownBase = chakra(ReactMarkdown)
const HighlighterBase = chakra(SyntaxHighlighter)

const CodeHighlighter = ({ inline, children, ...props }: CodeProps) =>
    <HighlighterBase children={children} style={atomOneLight} {...props} language='python' wrapLongLines
                     fontSize='85%' whiteSpace='break-spaces' wordBreak='break-word'
                     {...(inline && { display: 'inline !important', p: '3px !important', PreTag: 'code' })} />

const ImgRenderer = ({ src }: ImageProps) =>
    <Image src={`data:image/png;base64,${src}`} h='auto' pr={3} />

export const MarkdownViewer = ({ children, data }: ComponentProps<typeof MarkdownBase>) =>
    <MarkdownBase children={children} fontSize='90%' remarkPlugins={[remarkGfm]}
                  wordBreak='break-word' whiteSpace='pre-wrap' overflow='auto' boxSize='full'
                  components={{
                    code: CodeHighlighter,
                    a: (props) => <Link color='blue.500' fontSize='95%' {...props} />,
                    h3: (props) => <Heading fontSize='lg' {...props} />,
                    h2: (props) => <Heading fontSize='xl' {...props} />,
                    li: ({ children }) => <ListItem children={children} />,
                    ul: ({ children }) => <UnorderedList children={children} />,
                    ol: ({ children }) => <OrderedList children={children} />,
                    img: ({ src }) =>
                        <ImgRenderer src={data.find((file: TaskFileProps) => file.name === src)?.bytes} />
                  }} />