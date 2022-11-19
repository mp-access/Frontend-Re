import { Box, BoxProps, chakra, Flex, FlexProps, Text, useBreakpointValue } from '@chakra-ui/react'
import { AnimatePresence, motion, useMotionValue } from 'framer-motion'
import React, { ComponentProps } from 'react'
import { ButtonOptions } from '@chakra-ui/button'

const Panel = chakra(motion.div)
const swap = (to: boolean) => (dir: boolean) => ({ x: 200 * ((dir && !to) ? 1 : -1), zIndex: 0, opacity: 0 })

export const SplitVertical = ({ children }: FlexProps) => {
  const defaultWidth = useBreakpointValue({ base: 500, sm: 400, lg: 600 }) || 400
  const x = useMotionValue(defaultWidth)
  return (
      <Flex pos='relative'>
        <Panel style={{ width: x }} mr={1} children={children} />
        <Panel pos='absolute' dragMomentum={false} drag='x' style={{ x }} cursor='col-resize' h='full' w={1}
               dragConstraints={{ left: defaultWidth - 200, right: defaultWidth + 300 }} transition='background 0.2s'
               bg='blackAlpha.200' _hover={{ bg: 'blackAlpha.300' }} _active={{ bg: 'blackAlpha.400' }} />
      </Flex>
  )
}

export const SplitHorizontal = ({ children }: FlexProps) => {
  const defaultHeight = useBreakpointValue({ base: 600, sm: 500, lg: 700 }) || 600
  const y = useMotionValue(defaultHeight)
  return (
      <Flex flexDir='column' pos='relative'>
        <Panel style={{ height: y }} mb={1} children={children} />
        <Panel pos='absolute' dragMomentum={false} drag='y' style={{ y }} cursor='row-resize' w='full' h={1}
               dragConstraints={{ top: defaultHeight - 400, bottom: defaultHeight + 50 }} transition='background 0.2s'
               bg='blackAlpha.200' _hover={{ bg: 'blackAlpha.300' }} _active={{ bg: 'blackAlpha.400' }} />
      </Flex>
  )
}

export const Underline = ({ isActive, onClick, children }: BoxProps & ButtonOptions) =>
    <Box onClick={onClick} pos='relative' cursor='pointer'>
      <Text color={isActive ? 'purple.600' : 'blackAlpha.700'} _hover={{ color: 'purple.400' }} children={children} />
      {isActive &&
        <Panel layoutId='underline' initial={false} bg='purple.500' h={1} pos='absolute' bottom={-1}
               w='full' animate={{ transition: { type: 'spring', stiffness: 500, damping: 30 } }} />}
    </Box>

export const Feature = ({ custom, children }: ComponentProps<typeof motion.div>) =>
    <AnimatePresence initial={false} custom={custom.from} mode='popLayout'>
      <motion.div key={custom.to} custom={custom.from} initial='initial' exit='exit' style={{ height: '100%' }}
                  transition={{ x: { type: 'spring', stiffness: 75, damping: 20 }, opacity: { duration: 0.6 } }}
                  animate={{ zIndex: 1, x: 0, opacity: 1 }} variants={{ initial: swap(true), exit: swap(false) }}>
        <Flex as={motion.div} layerStyle='feature'>
          {children}
        </Flex>
      </motion.div>
    </AnimatePresence>
