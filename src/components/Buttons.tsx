import React from 'react'
import { Link } from 'react-router-dom'
import { Text } from '@chakra-ui/react'

export const LogoButton = () =>
    <Text as={Link} to='/' fontFamily='"Courier Prime", monospace' fontSize='2.5rem' fontWeight={400}
          lineHeight={1} mt={3} _hover={{ color: 'purple.500' }} children='ACCESS.' />
