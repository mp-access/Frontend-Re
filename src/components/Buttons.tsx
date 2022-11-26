import React from 'react'
import { Link } from 'react-router-dom'
import { BoxProps, Center, HStack, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { BsArrowRight } from 'react-icons/bs'

const transitionStyle = { repeat: Infinity, repeatDelay: .7, duration: .5, ease: 'easeInOut' }

export const LogoButton = () =>
    <Text as={Link} to='/' fontFamily='"Courier Prime", monospace' fontSize='2.5rem' fontWeight={400}
          lineHeight={1} mt={3} _hover={{ color: 'purple.500' }} children='ACCESS.' />

export const GoToButton = ({ children, ...props }: BoxProps) =>
    <HStack as={motion.div} fontSize='lg' fontWeight={600} color='purple.600'
            whileHover={{ x: [0, 2, 0, -2, 0, 2, 0], transition: transitionStyle }} {...props}>
      <Text>{children}</Text>
      <BsArrowRight />
    </HStack>

export const Counter = ({ children }: BoxProps) =>
    <Center rounded='md' bg='purple.100' p={0.5} w={6} color='purple.600' fontWeight={600} children={children} />