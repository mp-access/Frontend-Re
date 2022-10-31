import React, { ComponentProps } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import enLocale from '@fullcalendar/core/locales/en-gb'
import { motion } from 'framer-motion'
import { Link, NavLink } from 'react-router-dom'
import { Box, chakra, HStack, Progress, Text } from '@chakra-ui/react'
import { divide } from 'lodash'

const NavLinkBase = chakra(NavLink)

export const Card = (props: ComponentProps<typeof NavLinkBase>) =>
    <NavLinkBase boxSize='full' display='flex' flexDir='column' alignItems='center' justifyContent='center'
                 rounded='1.5rem' transition='all 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms' bg='gradients.purple-light'
                 borderWidth={2} boxShadow='card' _hover={{ boxShadow: 'hover' }} borderColor='gray.250'
                 style={({ isActive }) => (isActive ? { borderColor: 'transparent' } : {})} {...props} />

export const ProgressBar = ({ value = 0, max = 1, w = '3xs' }) =>
    <HStack w={w}>
      <HStack h={3} w='full' rounded='2xl' bg='gray.200' position='relative' overflow='hidden'>
        <Box as={motion.div} position='absolute' top={0} left={0} right={0} h='full' bg='green.300' transformOrigin={0}
             style={{ scaleX: divide(value, max || 1) }} />
      </HStack>
      <Text w={6} fontSize='70%'>{Math.round(divide(value, max || 1) * 100)}%</Text>
    </HStack>

const pointsToProgress = (points?: number, max?: number) => (points && max) ? Math.round(points * 100 / max) : 0

export function ScoreProgress({ value, max }: any) {
  const progress = pointsToProgress(value, max)
  return (
      <HStack w='full' minW='10rem'>
        <Progress value={progress} size='sm' w='full' colorScheme='green' bg='gray.200' />
        <Text fontWeight={400} fontSize='0.7rem'>{progress}%</Text>
      </HStack>
  )
}

export const LogoButton = () =>
    <Text as={Link} to='/' fontFamily='"Courier Prime", monospace' fontSize='2.5rem' fontWeight={400}
          lineHeight={1} mt={3} _hover={{ color: 'purple.500' }} children='ACCESS.' />

export const Calendar = () =>
    <FullCalendar plugins={[dayGridPlugin]} initialView='dayGridMonth' locale={enLocale}
                  buttonText={{ today: 'Today' }} />