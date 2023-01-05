import { ChevronRightIcon } from '@chakra-ui/icons'
import {
  Avatar, Breadcrumb, BreadcrumbItem, Button, Flex, HStack, Menu, MenuButton, MenuItem, MenuList, SimpleGrid, Spinner
} from '@chakra-ui/react'
import { useKeycloak } from '@react-keycloak/web'
import React from 'react'
import { AiOutlineLogout } from 'react-icons/ai'
import { Link, Outlet, useMatches, useParams } from 'react-router-dom'
import { LogoButton } from '../components/Buttons'
import { useAssignment, useCourse } from '../components/Hooks'

export default function Layout() {
  const { keycloak } = useKeycloak()
  const { courseURL } = useParams()

  if (!keycloak.token)
    return <Spinner pos='absolute' left='50%' top='50%' />

  if (courseURL && !keycloak.hasRealmRole(courseURL))
    throw new Response('Not Found', { status: 404 })

  const context = {
    user: keycloak.idTokenParsed,
    isCreator: keycloak.hasRealmRole('supervisor'),
    isSupervisor: !!courseURL && keycloak.hasRealmRole(courseURL + '-supervisor'),
    isAssistant: !!courseURL && keycloak.hasRealmRole(courseURL + '-assistant')
  }

  return (
      <SimpleGrid columns={1} templateRows='auto 1fr' bg='bg' boxSize='full' justifyItems='center' pos='relative'>
        <Flex justify='space-between' px={3} w='full' h={16} align='center'>
          <HStack p={3}>
            <LogoButton />
            {courseURL && <CourseNav />}
          </HStack>
          <Menu>
            <MenuButton as={Avatar} bg='purple.200' boxSize={10} _hover={{ boxShadow: 'lg' }} cursor='pointer' mx={2} />
            <MenuList minW={40}>
              <MenuItem icon={<AiOutlineLogout fontSize='120%' />} children='Logout'
                        onClick={() => keycloak.logout({ redirectUri: window.location.origin })} />
            </MenuList>
          </Menu>
        </Flex>
        <Outlet context={context} />
      </SimpleGrid>
  )
}

function CourseNav() {
  const matches = useMatches()
  const { courseURL, assignmentURL, taskURL } = useParams()
  const { data: course } = useCourse()
  const { data: assignment } = useAssignment()
  const task = assignment?.tasks.find(task => task.url === taskURL)

  if (!course)
    return <></>

  return (
      <Breadcrumb layerStyle='float' separator={<ChevronRightIcon color='gray.500' />} pr={3}>
        <BreadcrumbItem>
          <Button as={Link} to={`/courses/${courseURL}`} variant='gradient' children={course.title} />
        </BreadcrumbItem>
        {matches.filter(match => match.handle).map(match =>
            <BreadcrumbItem key={match.id}>
              <Button as={Link} to={match.pathname} variant='link' colorScheme='gray'
                      children={`${assignment && match.handle === 'assignment' ? 'Assignment ' + assignment.ordinalNum : match.handle}`} />
            </BreadcrumbItem>)}
        {taskURL && task &&
          <BreadcrumbItem>
            <Button as={Link} to={`/courses/${courseURL}/assignments/${assignmentURL}/tasks/${task.url}`}
                    variant='link' colorScheme='gray' children='Task' mr={1} />
            {assignment?.tasks.map(t =>
                <Button key={t.id} as={Link} mx={1} size='sm' children={t.ordinalNum} variant='ghost' boxSize={8}
                        isActive={t.id === task?.id}
                        to={`/courses/${courseURL}/assignments/${assignmentURL}/tasks/${t.url}`} />)}
          </BreadcrumbItem>}
      </Breadcrumb>
  )
}
