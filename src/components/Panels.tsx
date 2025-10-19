import { ButtonOptions } from "@chakra-ui/button"
import {
  Box,
  BoxProps,
  Center,
  Checkbox,
  Code,
  Divider,
  Flex,
  Heading,
  Link as Href,
  LinkProps as HrefProps,
  Image,
  ImgProps,
  ListIcon,
  ListItem,
  OrderedList,
  SimpleGrid,
  SimpleGridProps,
  Stack,
  Text,
  TextProps,
  UnorderedList,
} from "@chakra-ui/react"
import { useWindowSize } from "@react-hook/window-size"
import {
  AnimatePresence,
  AnimatePresenceProps,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion"
import "katex/dist/katex.min.css"
import { toInt } from "radash"
import React, { ReactNode } from "react"
import { RxDotFilled } from "react-icons/rx"
import ReactMarkdown from "react-markdown"
import {
  CodeProps,
  HeadingProps,
  LiProps,
  OrderedListProps,
  UnorderedListProps,
} from "react-markdown/lib/ast-to-react"
import { ReactMarkdownOptions } from "react-markdown/lib/react-markdown"
import { Link, LinkProps } from "react-router-dom"
import SyntaxHighlighter from "react-syntax-highlighter"
import { atomOneLight } from "react-syntax-highlighter/dist/cjs/styles/hljs"
import rehypeKatex from "rehype-katex"
import remarkGfm from "remark-gfm"
import RemarkMathPlugin from "remark-math"

const MotionBox = motion(Box)
const swap = (to: number) => (r: number) => ({
  x: 200 * r * to,
  zIndex: 0,
  opacity: 0,
})

type TaskViewProps = {
  children: [ReactNode, ReactNode, ReactNode]
}

export const TaskView = ({ children }: TaskViewProps) => {
  const size = useWindowSize()
  const x = useMotionValue(700)
  const width = useTransform(x, (value) => size[0] - 224 - value)
  return (
    <Flex
      flex={1}
      pos="relative"
      overflow="hidden"
      bg="base"
      borderTopWidth={1}
    >
      <motion.div
        style={{ width: x, marginRight: 2, padding: 10 }}
        children={children[0]}
      />
      <MotionBox
        pos="absolute"
        zIndex={1}
        opacity={0}
        drag="x"
        dragMomentum={false}
        bg="purple.600"
        h="full"
        w={2}
        dragConstraints={{ left: 200, right: size[0] * 0.5 }}
        style={{ x }}
        cursor="col-resize"
        key={JSON.stringify(size)}
        whileDrag={{ opacity: 0.18 }}
        whileHover={{ opacity: 0.13 }}
      />
      <motion.div
        style={{
          width,
          display: "flex",
          flexDirection: "column",
          borderInlineWidth: 1,
        }}
      >
        {children[1]}
      </motion.div>
      {children[2]}
    </Flex>
  )
}

type TaskIOProps = {
  children: [ReactNode, ReactNode, ReactNode, ReactNode]
}

export const TaskIO = ({ children }: TaskIOProps) => {
  const size = useWindowSize()
  const y = useMotionValue(size[1] * 0.7)

  return (
    <>
      {children[0]}
      <motion.div
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          position: "relative",
        }}
      >
        <motion.div
          style={{
            height: y,
            display: "flex",
            position: "relative",
          }}
        >
          {children[1]}
          {children[2]}
        </motion.div>
        <MotionBox
          pos="absolute"
          zIndex={1}
          opacity={0}
          drag="y"
          dragMomentum={false}
          bg="purple.600"
          w="full"
          h={2}
          dragConstraints={{ top: 100, bottom: size[1] - 150 }}
          style={{ y }}
          cursor="row-resize"
          key={JSON.stringify(size)}
          whileDrag={{ opacity: 0.18 }}
          whileHover={{ opacity: 0.13 }}
        />
        {children[3]}
      </motion.div>
    </>
  )
}

export const Underline = ({
  isActive,
  onClick,
  children,
}: BoxProps & ButtonOptions) => (
  <Box onClick={onClick} pos="relative" cursor="pointer">
    <Text
      color={isActive ? "purple.600" : "blackAlpha.700"}
      whiteSpace="nowrap"
      _hover={{ color: "purple.400" }}
      children={children}
    />
    {isActive && (
      <Box
        as={motion.div}
        layoutId="underline"
        initial={false}
        bg="purple.500"
        h={1}
        pos="absolute"
        bottom={-1}
        w="full"
        animate={{
          transition: { type: "spring", stiffness: 500, damping: 30 },
        }}
      />
    )}
  </Box>
)

export const Feature = ({
  custom,
  to,
  ...props
}: Partial<AnimatePresenceProps> & LinkProps & SimpleGridProps) => (
  <AnimatePresence initial={false} custom={custom.r} mode="popLayout">
    <motion.div
      key={custom.i}
      custom={custom.r}
      transition={{ duration: 0.3 }}
      initial="slideIn"
      exit="slideOut"
      variants={{
        slideIn: swap(1),
        slideOut: swap(-1),
        stay: { zIndex: 1, x: 0, opacity: 1 },
      }}
      animate="stay"
      style={{ display: "flex", flexGrow: 1 }}
    >
      <SimpleGrid layerStyle="card" flexGrow={1} {...props} as={Link} to={to} />
    </motion.div>
  </AnimatePresence>
)

const MarkdownImg = ({ src }: ImgProps) => <Image src={src} h="auto" pr={3} />
const MarkdownText = (props: TextProps) => (
  <Text {...props} pb={2} w="full" sx={{ hyphens: "auto" }} />
)
const MarkdownLink = (props: HrefProps) => <Href color="blue.500" {...props} />
const MarkdownHeading = ({ children, node: { tagName } }: HeadingProps) => {
  return (
    <Box py={2}>
      <Heading
        fontSize={`1${7 - (toInt(tagName[1]) || 5)}0%`}
        children={children}
      />
      {tagName === "h1" && <Divider />}
    </Box>
  )
}
const MarkdownUnorderedList = ({ children }: UnorderedListProps) => (
  <UnorderedList m={0} children={children} />
)
const MarkdownOrderedList = ({ children }: OrderedListProps) => (
  <OrderedList m={0} children={children} />
)
const MarkdownBlock = ({ children }: { children: React.ReactNode }) => (
  <Stack bg="blackAlpha.100" p={2} m={2} children={children} />
)
const MarkdownCode = ({ inline, children, className }: CodeProps) => {
  const language = className?.replace("language-", "") || ""

  return inline ? (
    <Code
      colorScheme="gray"
      bg="gray.175"
      children={children}
      wordBreak="break-word"
    />
  ) : (
    <SyntaxHighlighter
      children={String(children).replace(/\n$/, "")}
      style={atomOneLight}
      language={language}
      wrapLines
      customStyle={{ fontSize: "85%" }}
    />
  )
}
const MarkdownListItem = ({ checked, children }: LiProps) => (
  <ListItem pb={1} display="flex">
    <ListIcon as={checked === null ? RxDotFilled : Checkbox} mt={1} />
    <Box>{children}</Box>
  </ListItem>
)

export const Markdown = ({
  children,
  transformImageUri,
}: ReactMarkdownOptions) => (
  <ReactMarkdown
    children={children}
    remarkPlugins={[remarkGfm, RemarkMathPlugin]}
    rehypePlugins={[rehypeKatex]}
    transformImageUri={transformImageUri}
    components={{
      code: MarkdownCode,
      p: MarkdownText,
      a: MarkdownLink,
      h1: MarkdownHeading,
      h2: MarkdownHeading,
      h3: MarkdownHeading,
      h4: MarkdownHeading,
      h5: MarkdownHeading,
      li: MarkdownListItem,
      ul: MarkdownUnorderedList,
      ol: MarkdownOrderedList,
      blockquote: MarkdownBlock,
      img: MarkdownImg,
    }}
  />
)

export const Placeholder = () => (
  <Center pos="absolute" boxSize="full">
    <MotionBox
      transition={{
        duration: 3,
        ease: "easeInOut",
        times: [0, 0.2, 0.5, 0.8, 1],
        repeat: Infinity,
      }}
      borderColor="purple.100"
      borderWidth={0.5}
      boxSize={16}
      animate={{
        scale: [1, 1.5, 1.5, 1, 1],
        rotate: [0, 0, 270, 270, 0],
        borderRadius: ["20%", "20%", "50%", "50%", "20%"],
      }}
    />
  </Center>
)
