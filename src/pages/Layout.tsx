import { ChevronRightIcon } from '@chakra-ui/icons'
import {
  Avatar, Breadcrumb, BreadcrumbItem, Button, Flex, HStack, Icon, IconButton, Menu, MenuButton, MenuItem, MenuList,
  SimpleGrid, Spinner, Text, useMediaQuery, VStack
} from '@chakra-ui/react'
import { useKeycloak } from '@react-keycloak/web'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { AiOutlineAppstore, AiOutlineLogout } from 'react-icons/ai'
import { Link, Outlet, useLocation, useParams } from 'react-router-dom'
import { LogoButton } from '../components/Buttons'
import { TimeCountDown } from '../components/Statistics'

export default function Layout() {
  const [showMyCourses] = useMediaQuery('(min-width: 1100px)')
  const location = useLocation()
  const { keycloak } = useKeycloak()
  const { courseURL, assignmentURL, taskURL } = useParams()
  const { data: course } = useQuery<CourseProps>(['courses', courseURL], { enabled: !!courseURL })
  const { data: assignment } = useQuery<AssignmentProps>(['assignments', assignmentURL], { enabled: !!assignmentURL })
  const task = assignment?.tasks.find(task => task.url === taskURL)
  const context = {
    user: keycloak.idTokenParsed,
    isCreator: keycloak.hasRealmRole('supervisor'),
    isSupervisor: !!courseURL && keycloak.hasRealmRole(courseURL + '-supervisor'),
    isAssistant: !!courseURL && keycloak.hasRealmRole(courseURL + '-assistant')
  }

  if (location.state?.refresh)
    keycloak.clearToken()

  return (
      <SimpleGrid columns={1} templateRows='auto 1fr' bg='bg' boxSize='full'>
        <Flex justify='space-between' px={3} w='full' bg='base' borderBottomWidth={1} align='center' boxShadow='lg'>
          <HStack p={3}>
            <LogoButton />
            <Breadcrumb separator={<ChevronRightIcon color='gray.500' />}>
              {(!(taskURL && assignment?.active) || showMyCourses) &&
                <BreadcrumbItem>
                  <Button as={Link} to='/' variant='gradient-solid' leftIcon={<Icon as={AiOutlineAppstore} />}>
                    My Courses
                  </Button>
                </BreadcrumbItem>}
              {courseURL && course &&
                <BreadcrumbItem>
                  <Button as={Link} to={`/courses/${courseURL}`} variant='link'
                          colorScheme='gray' fontWeight={500} children={course.title} />
                </BreadcrumbItem>}
              {assignmentURL && assignment &&
                <BreadcrumbItem>
                  <Button as={Link} to={`/courses/${courseURL}/assignments/${assignment.url}`} variant='link'
                          colorScheme='gray' fontWeight={500} children={`Assignment ${assignment.ordinalNum}`} />
                </BreadcrumbItem>}
              {taskURL && task &&
                <BreadcrumbItem>
                  <Button as={Link} to={`/courses/${courseURL}/assignments/${assignmentURL}/tasks/${task.url}`}
                          variant='link' colorScheme='gray' fontWeight={500} children='Task' mr={1} />
                  {assignment?.tasks.map(t =>
                      <IconButton key={t.id} variant='gradient' rounded='md' size='sm' mx={1} lineHeight={1} as={Link}
                                  to={`/courses/${courseURL}/assignments/${assignmentURL}/tasks/${t.url}`}
                                  borderColor={t.id === task?.id ? 'transparent' : 'gray.300'} aria-label='task'
                                  icon={<Text fontSize={{ base: 'md', xl: 'lg' }}>{t.ordinalNum}</Text>} />)}
                </BreadcrumbItem>}
            </Breadcrumb>
          </HStack>
          {taskURL && assignment?.active &&
            <HStack>
              <Text color='blackAlpha.600' fontSize='xs' whiteSpace='nowrap'>DUE IN</Text>
              <TimeCountDown values={assignment.countDown} h={16} />
            </HStack>}
          <Menu>
            <MenuButton as={Button} variant='ghost' fontWeight={400} minH={10}
                        rightIcon={<Avatar size='sm' bg='purple.100' />} children={context.user?.name} />
            <MenuList minW={40} zIndex={2}>
              <MenuItem icon={<AiOutlineLogout fontSize='120%' />} onClick={() => keycloak.logout()}>
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
        <VStack justify='start' overflow='auto' spacing={0}>
          {taskURL && <Spinner pos='absolute' top='50%' />}
          <Outlet context={context} />
        </VStack>
      </SimpleGrid>
  )
}

