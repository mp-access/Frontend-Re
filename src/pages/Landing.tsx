import {
  Box, Button, ButtonGroup, Center, Divider, Highlight, HStack, Icon, Stack, Text, VStack
} from '@chakra-ui/react'
import { useKeycloak } from '@react-keycloak/web'
import React from 'react'
import Typewriter from 'typewriter-effect'
import { LogoButton } from '../components/Buttons'
import { SWITCHIcon } from '../components/Icons'

export function Landing() {
  const { keycloak } = useKeycloak()
  const idpHint = 'switch-edu-id'
  const redirectUri = window.location.origin + '/courses'
  return (
      <Stack h='full' p={3}>
        <HStack w='full' px={3} justify='space-between'>
          <LogoButton />
          <ButtonGroup variant='ghost'>
            <Button>Contact</Button>
          </ButtonGroup>
        </HStack>
        <Center flexGrow={1}>
          <Stack w='lg'>
            <Typewriter onInit={writer => writer.typeString('Hello, <text class="purple">ACCESS</text>!').start()} />
            <Text fontSize='2xl' lineHeight='tall'>
              Learn & teach <b>programming</b> skills
              <Highlight query='supervised course' styles={{ px: '1', bg: 'purple.75' }}>
                {' in a supervised course environment.'}
              </Highlight>
            </Text>
          </Stack>
          <VStack layerStyle='feature' w='xs' spacing={4}>
            <VStack>
              <Text fontSize='lg'>{'Looking for your courses?'}</Text>
              <Button size='lg' colorScheme='gray' borderWidth={2} flexDir='column' gap={3} fontWeight={400} p={4}
                      w='2xs' h='auto' rounded='lg' onClick={() => keycloak.login({ idpHint, redirectUri })}>
                Login with
                <Icon as={SWITCHIcon} boxSize='auto' px={2} />
              </Button>
              <Button variant='ghost' onClick={() => keycloak.login({ redirectUri })}>
                Not a student?
              </Button>
            </VStack>
            <Box w='full' pos='relative' textAlign='center'>
              <Divider borderColor='gray.300' py={2} />
              <Text pos='absolute' px={1} top={1} textShadow='float' marginInline='auto' left={0} right={0}>or</Text>
            </Box>
            <VStack p={2} textAlign='center'>
              <Text>{'Want to create a new course?'}</Text>
              <Button size='lg' variant='outline' onClick={() => keycloak.login({ idpHint, redirectUri })}>
                Get Started
              </Button>
            </VStack>
          </VStack>
        </Center>
      </Stack>
  )
}