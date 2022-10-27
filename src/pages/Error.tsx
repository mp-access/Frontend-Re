import { Button, Center, Heading, Icon, Text, VStack } from '@chakra-ui/react'
import React from 'react'
import { GrUndo } from 'react-icons/gr'
import { Link } from 'react-router-dom'
import { LogoButton } from '../components/Common'
import { RobotIcon } from '../components/Icons'

const Error = () =>
    <Center h='full' bg='gray.100'>
      <VStack p={12} spacing={10} bg='white' rounded='3xl'>
        <LogoButton />
        <Heading>Oh no, something went wrong...</Heading>
        <Text>The page you are looking for does not exist.</Text>
        <Button as={Link} to={-1 as any} variant='solid' colorScheme='blue' size='lg' leftIcon={<GrUndo />}>
          Go Back
        </Button>
        <Icon as={RobotIcon} boxSize='2xs' />
      </VStack>
    </Center>

export default Error