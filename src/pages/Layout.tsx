import {
  Avatar, Button, Center, Flex, HStack, Menu, MenuButton, MenuItem, MenuList, Spinner, VStack
} from '@chakra-ui/react'
import { useKeycloak } from '@react-keycloak/web'
import React, { useEffect, useState } from 'react'
import { AiOutlineAppstore, AiOutlineLogout } from 'react-icons/ai'
import { Outlet, useParams } from 'react-router-dom'
import { CachePolicies, IncomingOptions, Provider } from 'use-http'
import { LogoButton, NavbarButton } from '../components/Buttons'
import Navbar from './Navbar'

export default function Layout() {
  const { keycloak, initialized } = useKeycloak()
  const { courseURL } = useParams()
  const [fetchOptions, setFetchOptions] = useState<IncomingOptions>({ data: [], cachePolicy: CachePolicies.NO_CACHE })

  useEffect(() => {
    if (keycloak?.token)
      setFetchOptions({ ...fetchOptions, headers: { Authorization: `Bearer ${keycloak.token}` } })
  }, [keycloak.token])

  if (!initialized || !keycloak.authenticated || !fetchOptions.headers)
    return <Center minH='100vh'><Spinner size='xl' /></Center>

  const context = {
    isSupervisor: keycloak.hasRealmRole((courseURL ? courseURL+'-' : '') + 'supervisor'),
    isAssistant: keycloak.hasRealmRole((courseURL ? courseURL+'-' : '') + 'assistant'),
    userId: keycloak.idTokenParsed?.email,
    name: keycloak.idTokenParsed?.name,
  }

  return (
      <Provider url={`/api${courseURL ? '/courses/'+courseURL : ''}`} options={fetchOptions}>
        <VStack minH='100vh' spacing={0} bgImage='radial-gradient(#cda8ff1f 1px, #ffffff 1px)' bgSize='20px 20px'>
          <Flex minH='10vh' p={3} pb={1} gap={4} w='full' bg='white' borderBottomWidth={1} align='center' boxShadow='lg'>
            <LogoButton />
            <HStack spacing={3} flexGrow={1}>
            {courseURL ? <Navbar isSupervisor={context.isSupervisor} /> :
                <NavbarButton label='My Courses' to='/' icon={AiOutlineAppstore} />}
            </HStack>
            <Menu>
              {courseURL ?
                  <MenuButton as={Avatar} flexDir='column' cursor='pointer' name={context.name} size='sm' bg='purple.100' />
                  : <MenuButton as={Button} variant='ghost' rightIcon={<Avatar name={context.name} size='sm' bg='purple.100' />}>
                    {context.name?.split(' ')[0] || ''}
                  </MenuButton>}
              <MenuList minW='9rem'>
                <MenuItem icon={<AiOutlineLogout fontSize='1.2rem' />} onClick={() => keycloak.logout()}>Logout</MenuItem>
              </MenuList>
            </Menu>
          </Flex>
          <Outlet context={context} />
        </VStack>
      </Provider>
  )
}