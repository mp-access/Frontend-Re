import { ButtonOptions } from '@chakra-ui/button'
import {
  Box, BoxProps, Checkbox, Code, Flex, Heading, Image, Link, ListIcon, ListItem, OrderedList, SimpleGridProps, Stack,
  Text, UnorderedList
} from '@chakra-ui/react'
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion'
import React, { ComponentProps, PropsWithChildren } from 'react'
import { useWindowHeight, useWindowWidth } from '@react-hook/window-size'
import { ReactMarkdownOptions } from 'react-markdown/lib/react-markdown'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import RemarkMathPlugin from 'remark-math'
import rehypeKatex from 'rehype-katex'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atomOneLight } from 'react-syntax-highlighter/dist/cjs/styles/hljs'
import { RxDotFilled } from 'react-icons/rx'

const swap = (to: number) => (r: number) => ({ x: 200 * r * to, zIndex: 0, opacity: 0 })

const DragHandle = ({ drag, cursor, ...props }: ComponentProps<any>) =>
    <Box as={motion.div} pos='absolute' zIndex={1} drag={drag || 'x'} w={drag ? 'full' : 2} h={drag ? 2 : 'full'}
         cursor={drag ? 'row-resize' : 'col-resize'} bg='purple.600' opacity={0} dragMomentum={false}
         whileDrag={{ opacity: 0.18 }} whileHover={{ opacity: 0.13 }} {...props} />

export const SplitVertical = ({ children, ...props }: ComponentProps<any>) => {
  const width = useWindowWidth()
  const left = useMotionValue(300)
  const editor = useTransform(left, value => width - 224 - value)
  return (
      <Flex flexGrow={1} pos='relative' overflow='hidden' {...props}>
        <motion.div style={{ width: left, marginRight: 2 }} children={children[0]} />
        <DragHandle dragConstraints={{ left: 300, right: width * 0.5 }} style={{ x: left }} />
        <motion.div style={{ width: editor, display: 'flex', flexDirection: 'column', borderInlineWidth: 1 }}>
          {children[1]}
        </motion.div>
        {children[2]}
      </Flex>
  )
}

export const SplitHorizontal = ({ children }: PropsWithChildren<any>) => {
  const height = useWindowHeight()
  const y = useMotionValue(height * 0.7)
  return (
      <>
        {children[0]}
        <motion.div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, position: 'relative' }}>
          <motion.div style={{ height: y, display: 'flex' }} children={children[1]} />
          <DragHandle drag='y' dragConstraints={{ top: 200, bottom: height - 150 }} style={{ y }} />
          {children[2]}
        </motion.div>
        {children[3]}
      </>
  )
}

export const Underline = ({ isActive, onClick, children }: BoxProps & ButtonOptions) =>
    <Box onClick={onClick} pos='relative' cursor='pointer'>
      <Text color={isActive ? 'purple.600' : 'blackAlpha.700'} whiteSpace='nowrap'
            _hover={{ color: 'purple.400' }} children={children} />
      {isActive &&
        <Box as={motion.div} layoutId='underline' initial={false} bg='purple.500' h={1} pos='absolute' bottom={-1}
             w='full' animate={{ transition: { type: 'spring', stiffness: 500, damping: 30 } }} />}
    </Box>

export const Feature = ({ custom, ...props }: ComponentProps<any>) =>
    <AnimatePresence initial={false} custom={custom.r} mode='popLayout'>
      <motion.div key={custom.i} custom={custom.r} transition={{ duration: 0.3 }} initial='slideIn' exit='slideOut'
                  variants={{ slideIn: swap(1), slideOut: swap(-1), stay: { zIndex: 1, x: 0, opacity: 1 } }}
                  animate='stay' style={{ display: 'flex', flexGrow: 1 }}>
        <Stack layerStyle='card' flexGrow={1} {...props} />
      </motion.div>
    </AnimatePresence>

export const Screen = (props: SimpleGridProps) =>
    <motion.div style={{ display: 'flex', flexGrow: 1, width: '100vw', overflow: 'hidden' }}
                transition={{ duration: 0.5 }} children={<Flex flexGrow={1} {...props} />} />

const toBlock = (content: any) => String(content).replace(/\n$/, '')

export const Markdown = ({ children, transformImageUri }: ReactMarkdownOptions) =>
    <ReactMarkdown children={children} remarkPlugins={[remarkGfm, RemarkMathPlugin]} rehypePlugins={[rehypeKatex]}
                   transformImageUri={transformImageUri}
                   components={{
                     code: ({ inline, children, className }) => inline
                         ? <Code colorScheme='gray' bg='gray.175' children={children} />
                         : <SyntaxHighlighter children={toBlock(children)} style={atomOneLight} language={className}
                                              wrapLines customStyle={{ fontSize: '85%' }} />,
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