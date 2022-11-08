import { ChevronRightIcon } from '@chakra-ui/icons'
import {
  Avatar, Breadcrumb, BreadcrumbItem, Button, Center, Flex, HStack, Icon, Menu, MenuButton, MenuItem, MenuList, Stack
} from '@chakra-ui/react'
import { useKeycloak } from '@react-keycloak/web'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { AiOutlineAppstore, AiOutlineLogout } from 'react-icons/ai'
import { Link, Outlet, useParams, useRouteLoaderData } from 'react-router-dom'
import { LogoButton } from './Common'

export default function Layout() {
  const { keycloak } = useKeycloak()
  const { assignmentURL, courseURL } = useParams()
  const { data: course } = useQuery<CourseOverview>(['courses', courseURL], { enabled: !!courseURL })
  const { data: assignments } = useQuery<AssignmentOverview[]>(['assignments'], { enabled: !!assignmentURL })
  const { user } = useRouteLoaderData('user') as UserContext
  const assignment = assignments?.find(assignment => assignment.url === assignmentURL)

  return (
      <Stack bg='bg' minH='full'>
        <Flex justify='space-between' p={3} w='full' bg='base' borderBottomWidth={1} align='center' boxShadow='lg'>
          <HStack>
            <LogoButton />
            <Breadcrumb separator={<ChevronRightIcon color='gray.500' />}>
              <BreadcrumbItem>
                <Button as={Link} to={courseURL ? `/courses/${courseURL}` : '/'} variant='nav'
                        leftIcon={<Icon as={AiOutlineAppstore} />} children={course?.title || 'My Courses'} />
              </BreadcrumbItem>
              {assignment &&
                <BreadcrumbItem>
                  <Button as={Link} to={`/courses/${courseURL}/assignments/${assignment.url}`} variant='link'
                          colorScheme='gray' children={assignment.title} />
                </BreadcrumbItem>}
            </Breadcrumb>
          </HStack>
          <Menu>
            <MenuButton as={Button} variant='ghost' fontWeight={400} rightIcon={<Avatar size='sm' bg='purple.100' />}>
              {user.name}
            </MenuButton>
            <MenuList minW='9rem'>
              <MenuItem icon={<AiOutlineLogout fontSize='1.2rem' />} onClick={() => keycloak.logout()}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
        <Center flexGrow={1} flexDir='column'>
          <Outlet />
        </Center>
      </Stack>
  )
}

