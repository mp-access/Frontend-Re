import {
  Box, chakra, Checkbox, Flex, Heading, Image, ImageProps, Link, ListIcon, ListItem, OrderedList, Stack, Text,
  UnorderedList
} from '@chakra-ui/react'
import React, { ComponentProps } from 'react'
import ReactMarkdown from 'react-markdown'
import { CodeProps } from 'react-markdown/lib/ast-to-react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atomOneLight } from 'react-syntax-highlighter/dist/cjs/styles/hljs'
import remarkGfm from 'remark-gfm'
import { tail } from 'lodash'

const MarkdownBase = chakra(ReactMarkdown)
const HighlighterBase = chakra(SyntaxHighlighter)

const CodeHighlighter = ({ inline, children, ...props }: CodeProps) =>
    <HighlighterBase children={children} style={atomOneLight} {...props} language='python' wrapLongLines
                     fontSize='85%' whiteSpace='break-spaces' wordBreak='break-word'
                     {...(inline && { display: 'inline !important', p: '3px !important', PreTag: 'code' })} />

const ImgRenderer = ({ src }: ImageProps) =>
    <Image src={src} h='auto' pr={3} />

export const MarkdownViewer = ({ children, data }: ComponentProps<typeof MarkdownBase>) =>
    <MarkdownBase children={children} remarkPlugins={[remarkGfm]} p={2}
                  wordBreak='break-word' overflow='auto' gap={2} display='flex' flexDir='column'
                  components={{
                    code: CodeHighlighter,
                    p: (props) => <Text {...props} />,
                    a: (props) => <Link color='blue.500' fontSize='95%' {...props} />,
                    h3: (props) => <Heading fontSize='lg' {...props} />,
                    h2: (props) => <Heading fontSize='xl' {...props} />,
                    li: ({ children }) =>
                        <ListItem as={Flex} pb={1}>
                          <ListIcon as={Checkbox} pt={1} />
                          <Box>{tail(children)}</Box>
                        </ListItem>,
                    ul: ({ children }) => <UnorderedList ml={1} children={children} />,
                    ol: ({ children }) => <OrderedList children={children} />,
                    input: () => <Checkbox />,
                    blockquote: ({ children }) => <Stack bg='blackAlpha.100' p={2} m={2} children={children} />,
                    img: ({ src }) =>
                        <ImgRenderer src={data.find((file: TaskFileProps) => file.name === src)?.template} />
                  }} />