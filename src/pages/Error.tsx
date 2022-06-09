import { Button, Center, Heading, Icon, Text, VStack } from '@chakra-ui/react'
import { GrUndo } from 'react-icons/gr'
import { Link } from 'react-router-dom'
import { ReactComponent as Robot } from '../assets/robot.svg'
import { LogoButton } from '../components/Buttons'

export default function Error() {

  return (
      <Center minH='100vh' bg='gray.100'>
        <VStack p={12} spacing={10} bg='white' rounded='3xl'>
          <LogoButton />
          <Heading>Oh no, something went wrong...</Heading>
          <Text>The page you are looking for does not exist.</Text>
          <Button as={Link} to={-1 as any} variant='solid' colorScheme='blue' size='lg' leftIcon={<GrUndo />}>
            Go Back
          </Button>
          <Icon as={Robot} boxSize='2xs' />
        </VStack>
      </Center>
  )
}
