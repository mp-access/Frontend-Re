import { ButtonOptions } from '@chakra-ui/button'
import {
  Box, BoxProps, Center, Checkbox, Code, Flex, Heading, HeadingProps, Image, ImgProps, Input, Link as Href,
  LinkProps as HrefProps, ListIcon, ListItem, OrderedList, SimpleGrid, SimpleGridProps, Stack, Text, TextProps,
  UnorderedList
} from '@chakra-ui/react'
import { AnimatePresence, AnimatePresenceProps, motion, useMotionValue, useTransform } from 'framer-motion'
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
import { CodeProps, LiProps, OrderedListProps, UnorderedListProps } from 'react-markdown/lib/ast-to-react'
import { Link, LinkProps } from 'react-router-dom'

const MotionBox = motion(Box)
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
          <motion.div style={{ height: y, display: 'flex', position: 'relative' }}>
            {children[1]}
            {children[2]}
          </motion.div>
          <DragHandle drag='y' dragConstraints={{ top: 200, bottom: height - 150 }} style={{ y }} />
          {children[3]}
        </motion.div>
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

export const Feature = ({ custom, to, ...props }: Partial<AnimatePresenceProps> & LinkProps & SimpleGridProps) =>
    <AnimatePresence initial={false} custom={custom.r} mode='popLayout'>
      <motion.div key={custom.i} custom={custom.r} transition={{ duration: 0.3 }} initial='slideIn' exit='slideOut'
                  variants={{ slideIn: swap(1), slideOut: swap(-1), stay: { zIndex: 1, x: 0, opacity: 1 } }}
                  animate='stay' style={{ display: 'flex', flexGrow: 1 }}>
        <SimpleGrid layerStyle='card' flexGrow={1} {...props} as={Link} to={to} />
      </motion.div>
    </AnimatePresence>

export const Screen = (props: SimpleGridProps) =>
    <motion.div style={{ display: 'flex', flexGrow: 1, width: '100vw', overflow: 'hidden' }}
                transition={{ duration: 0.5 }} children={<Flex flexGrow={1} {...props} />} />

const toBlock = (content: any) => String(content).replace(/\n$/, '')

const MarkdownImg = ({ src }: ImgProps) => <Image src={src} h='auto' pr={3} />
const MarkdownText = (props: TextProps) => <Text {...props} pb={2} w='full' sx={{ hyphens: 'auto' }} />
const MarkdownLink = (props: HrefProps) => <Href color='blue.500' {...props} />
const MarkdownHeading = (props: HeadingProps) => <Heading {...props} py={2} />
const MarkdownInput = (props: ComponentProps<any>) => props.type === 'checkbox' ? <></> : <Input {...props} />
const MarkdownUnorderedList = ({ children }: UnorderedListProps) => <UnorderedList m={0} children={children} />
const MarkdownOrderedList = ({ children }: OrderedListProps) => <OrderedList m={0} children={children} />
const MarkdownBlock = ({ children }: ComponentProps<any>) =>
    <Stack bg='blackAlpha.100' p={2} m={2} children={children} />
const MarkdownCode = ({ inline, children, className }: CodeProps) => inline
    ? <Code colorScheme='gray' bg='gray.175' children={children} />
    : <SyntaxHighlighter children={toBlock(children)} style={atomOneLight} language={className}
                         wrapLines customStyle={{ fontSize: '85%' }} />
const MarkdownListItem = ({ checked, children }: LiProps) =>
    <ListItem pb={1} display='flex'>
      <ListIcon as={checked === null ? RxDotFilled : Checkbox} mt={1} />
      <Box>{children}</Box>
    </ListItem>

export const Markdown = ({ children, transformImageUri }: ReactMarkdownOptions) =>
    <ReactMarkdown children={children} remarkPlugins={[remarkGfm, RemarkMathPlugin]} rehypePlugins={[rehypeKatex]}
                   transformImageUri={transformImageUri}
                   components={{
                     code: MarkdownCode, p: MarkdownText, a: MarkdownLink, h3: MarkdownHeading, h2: MarkdownHeading,
                     li: MarkdownListItem, ul: MarkdownUnorderedList, ol: MarkdownOrderedList, input: MarkdownInput,
                     blockquote: MarkdownBlock, img: MarkdownImg
                   }} />

export const Placeholder = () =>
    <Center pos='absolute' boxSize='full'>
      <MotionBox transition={{ duration: 3, ease: 'easeInOut', times: [0, 0.2, 0.5, 0.8, 1], repeat: Infinity }}
                 borderColor='purple.100' borderWidth={0.5} boxSize={16}
                 animate={{
                   scale: [1, 1.5, 1.5, 1, 1], rotate: [0, 0, 270, 270, 0],
                   borderRadius: ['20%', '20%', '50%', '50%', '20%']
                 }} />
    </Center>
