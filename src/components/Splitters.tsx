import { chakra, Flex, useBreakpointValue } from '@chakra-ui/react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import React, { ComponentProps } from 'react'

const Panel = chakra(motion.div)

export const SplitVertical = (props: ComponentProps<typeof Panel>) => {
  const defaultWidth = useBreakpointValue({ base: 500, sm: 400, lg: 600 }) || 400
  const x = useMotionValue(defaultWidth)
  const width = useTransform(x, x => `${x + 6}px`)
  return (
      <Flex position='relative'>
        <Panel style={{ width }} h='full' {...props} />
        <Panel position='absolute' dragMomentum={false} drag='x' style={{ x }} cursor='col-resize' h='full' w='6px'
               dragConstraints={{ left: 300, right: defaultWidth + 300 }} transition='background 0.2s' bg='gray.200'
               _hover={{ bg: 'gray.300' }} _active={{ bg: 'gray.400' }} />
      </Flex>
  )
}

export const SplitHorizontal = (props: ComponentProps<typeof Panel>) => {
  const defaultHeight = useBreakpointValue({ base: 600, sm: 500, lg: 700 }) || 600
  const y = useMotionValue(defaultHeight)
  const height = useTransform(y, y => `${y + 3}px`)
  return (
      <Flex flexDir='column' position='relative'>
        <Panel style={{ height }} w='full' {...props} />
        <Panel position='absolute' dragMomentum={false} drag='y' style={{ y }} cursor='row-resize' w='full' h='6px'
               dragConstraints={{ top: 200, bottom: defaultHeight + 50 }} transition='background 0.2s' bg='gray.200'
               _hover={{ bg: 'gray.300' }} _active={{ bg: 'gray.400' }} />
      </Flex>
  )
}