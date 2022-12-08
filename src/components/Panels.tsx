import {
  Box, BoxProps, Center, Heading, Image, ImageProps, SimpleGrid, SimpleGridProps, Stack, StackProps, Text,
  useBreakpointValue, useDisclosure
} from '@chakra-ui/react'
import { AnimatePresence, motion, useMotionValue } from 'framer-motion'
import React, { ComponentProps, PropsWithChildren } from 'react'
import { ButtonOptions } from '@chakra-ui/button'
import { ChevronLeftIcon } from '@chakra-ui/icons'

const swap = (to: number) => (r: number) => ({ x: 200 * r * to, zIndex: 0, opacity: 0 })

const SplitBar = (props: ComponentProps<any>) =>
    <Box as={motion.div} pos='absolute' zIndex={1} boxSize='full' cursor='col-resize' bg='black' opacity={0.08}
         dragMomentum={false} whileDrag={{ opacity: 0.18 }} whileHover={{ opacity: 0.13 }} {...props} />

export const SidePanel = ({ children }: StackProps) => {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true })
  return (
      <Stack minW={10} bg='blackAlpha.200' borderColor='blackAlpha.300' borderLeftWidth={1} pos='relative'>
        <Box as={motion.button} pos='absolute' top={2} left={1} bg='purple.100' color='purple.600' rounded='full'
             animate={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} onClick={onToggle} boxSize={7}
             _hover={{ bg: 'purple.200' }}
             children={<ChevronLeftIcon boxSize={7} />} />
        <Stack as={motion.div} initial={false} animate={isOpen ? 'open' : 'collapsed'} overflow='auto' p={1}
               variants={{ open: { width: '20vw', opacity: 1 }, collapsed: { width: 0, opacity: 0 } }}>
          <Heading fontSize='md' pl={10} pb={2}>Activity</Heading>
          {children}
        </Stack>
      </Stack>
  )
}

export const SplitVertical = ({ children }: PropsWithChildren<any>) => {
  const w = useBreakpointValue({ base: 300, lg: 400, xl: 600 }) || 300
  const x = useMotionValue(w)
  return (
      <motion.div style={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        <motion.div style={{ display: 'flex', position: 'relative' }}>
          <motion.div style={{ width: x }} children={children[0]} />
          <SplitBar drag='x' dragConstraints={{ left: 200, right: w + 100 }} style={{ x }} w={1} cursor='col-resize' />
        </motion.div>
        {children[1]}
      </motion.div>
  )
}

export const SplitHorizontal = ({ children }: PropsWithChildren<any>) => {
  const h = useBreakpointValue({ base: 400, lg: 500 }) || 400
  const y = useMotionValue(h)
  return (
      <Stack as={motion.div} pl={1} spacing={1} flexGrow={1} overflow='hidden'>
        <motion.div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <motion.div style={{ height: y }} children={children[0]} />
          <SplitBar drag='y' dragConstraints={{ top: 300, bottom: h + 20 }} style={{ y }} h={1} cursor='row-resize' />
        </motion.div>
        {children[1]}
      </Stack>
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
                  animate='stay' style={{ display: 'flex', width: '100%', height: '100%' }}
                  variants={{ slideIn: swap(1), slideOut: swap(-1), stay: { zIndex: 1, x: 0, opacity: 1 } }}>
        <Box layerStyle='card' boxSize='full' {...props} />
      </motion.div>
    </AnimatePresence>

export const ImagePanel = ({ src }: ImageProps) =>
    <Center p={2} position='absolute' bottom={0} bg='white' boxSize='full' zIndex={3}>
      <Image src={`data:image/png;base64,${src}`} h='auto' />
    </Center>

export const Screen = (props: SimpleGridProps) =>
    <motion.div style={{ display: 'flex', flexGrow: 1, width: '100vw', overflow: 'hidden', zIndex: 1 }}
                transition={{ duration: 0.5 }} animate='stay'
                variants={{ move: { opacity: 0, y: -5 }, stay: { opacity: 1, y: 0 } }} initial='move' exit='move'
                children={<SimpleGrid {...props} />} />