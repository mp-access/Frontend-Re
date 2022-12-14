import {
  Box,
  Checkbox, Code, Heading, Image, Link, ListIcon, ListItem, OrderedList, Stack, Text, UnorderedList
} from '@chakra-ui/react'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import { ReactMarkdownOptions } from 'react-markdown/lib/react-markdown'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atomOneLight } from 'react-syntax-highlighter/dist/cjs/styles/hljs'
import remarkGfm from 'remark-gfm'
import RemarkMathPlugin from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { RxDotFilled } from 'react-icons/rx'
import 'katex/dist/katex.min.css'


export const MarkdownViewer = ({ children, transformImageUri }: ReactMarkdownOptions) =>
    <ReactMarkdown children={children} remarkPlugins={[remarkGfm, RemarkMathPlugin]} rehypePlugins={[rehypeKatex]}
                   transformImageUri={transformImageUri}
                   components={{
                     code: ({ inline, children, className }) => inline
                         ? <Code colorScheme='gray' bg='gray.175' children={children} />
                         : <SyntaxHighlighter children={String(children).replace(/\n$/, '')}
                                              style={atomOneLight} language={className} wrapLines
                                              customStyle={{ fontSize: '85%' }} />,
                     p: props => <Text {...props} pb={2} w='full' sx={{ hyphens: 'auto' }} />,
                     a: props => <Link color='blue.500' {...props} />,
                     h3: props => <Heading {...props} fontSize='125%' py={2} />,
                     h2: props => <Heading {...props} fontSize='150%' py={2} />,
                     li: ({ checked, children }) =>
                         <ListItem pb={1} display='flex'>
                           <ListIcon as={checked === null ? RxDotFilled : Checkbox} mt={1} />
                           <Box>{children}</Box>
                         </ListItem>,
                     ul: ({ children }) => <UnorderedList m={0} children={children} />,
                     ol: ({ children }) => <OrderedList m={0} children={children} />,
                     input: () => <></>,
                     blockquote: ({ children }) => <Stack bg='blackAlpha.100' p={2} m={2} children={children} />,
                     img: ({ src }) => <Image src={src} h='auto' pr={3} />
                   }} />