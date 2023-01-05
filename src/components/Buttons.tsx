import {
  Box, BoxProps, Button, ButtonProps, Center, Flex, HStack, IconButton, IconButtonProps, Input, Stack, TabProps, Tag,
  TagLabel, TagLeftIcon, Text, Tooltip
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import React from 'react'
import { BsArrowRight } from 'react-icons/bs'
import { Link, NavigateProps } from 'react-router-dom'
import { ActionIcon } from './Icons'
import { FcCalendar } from 'react-icons/fc'
import { EditIcon, InfoOutlineIcon } from '@chakra-ui/icons'
import { FormState } from 'react-hook-form'
import Dropzone from 'react-dropzone'
import { ImDownload } from 'react-icons/im'
import { useImport } from './Hooks'
import { flatMap, get, keys } from 'lodash'

const transitionStyle = { repeat: Infinity, repeatDelay: .7, duration: .5, ease: 'easeInOut' }
type SaveButtonProps = ButtonProps & { formState: FormState<any> }
type EventBoxProps = { selected: string, events: Record<string, Record<string, any[]>> }

export const LogoButton = () =>
    <Box as={Link} to='/courses' fontFamily='monospace' fontSize='4xl' pt={2}
         _hover={{ color: 'purple.500' }} children='ACCESS.' />

export const TooltipButton = ({ 'aria-label': label, icon, ...props }: IconButtonProps) =>
    <Tooltip placement='bottom-end' label={label}>
      <IconButton aria-label={label} icon={icon} fontSize='120%' {...props} rounded='md' />
    </Tooltip>

export const EditButton = ({ to, ...props }: NavigateProps & ButtonProps) =>
    <Button as={Link} to={to} variant='ghost' size='sm' leftIcon={<EditIcon />} children='Edit' {...props} />

export const NavButton = ({ onClick, icon, left, right, className }: Partial<IconButtonProps>) =>
    <IconButton aria-label='nav' size='sm' pos='absolute' bottom={-10} variant='ghost' p={1}
                icon={icon} onClick={onClick} left={left} right={right} isDisabled={className?.includes('disabled')} />
export const SaveButton = ({ formState: { isSubmitting }, ...props }: SaveButtonProps) =>
    <Button alignSelf='center' type='submit' {...props} isLoading={isSubmitting} children='Save' />

export const GoToButton = ({ children, ...props }: BoxProps) =>
    <HStack as={motion.div} fontSize='lg' fontWeight={600} color='purple.600'
            whileHover={{ x: [0, 2, 0, -2, 0, 2, 0], transition: transitionStyle }} {...props}>
      <Text>{children}</Text>
      <BsArrowRight />
    </HStack>

export const ImportButton = () => {
  const { onImport, isLoading } = useImport()
  return <Dropzone onDrop={(dropped) => dropped[0]?.text().then(data => onImport(JSON.parse(data)))}
                   multiple={false} children={({ getRootProps, getInputProps }) =>
      <Center h='full' {...getRootProps()}>
        <Button isLoading={isLoading} leftIcon={<ImDownload />}>Import</Button>
        <Input {...getInputProps()} size='sm' type='file' />
      </Center>} />
}
export const Counter = ({ children }: BoxProps) =>
    <Center rounded='md' bg='purple.100' px={2} py={0.5} color='purple.600' fontSize='sm'
            fontWeight={600} children={children} />

export const ActionButton = ({ name, ...props }: ButtonProps) =>
    <Button leftIcon={ActionIcon({ name })} children={name} {...props} />

export const ActionTab = ({ name }: TabProps) =>
    <HStack>{ActionIcon({ name })}<Text>{name}</Text></HStack>

export const EventBox = ({ selected, events }: EventBoxProps) =>
    <Stack p={2}>
      <HStack><FcCalendar /><Text fontWeight={500}>Events Today</Text></HStack>
      <Stack h={12} pos='relative' spacing={0}>
        <Text pos='absolute' top={0} left={5} fontSize='sm' color='blackAlpha.500'>No events planned.</Text>
        {flatMap(keys(events), key => get(events, [key, selected])?.map(a =>
            <HStack key={a.ordinalNum} rounded='lg' justify='space-between' pb={2} bg='base' zIndex={1}>
              <Flex>
                <Box boxSize={5} className={`cal-${key}`} bgPos={0} />
                <Text>{`Assignment ${a.ordinalNum} is ${key}.`}</Text>
              </Flex>
              <Text color='blackAlpha.600' textAlign='end'>{get(a, key + 'Time')}</Text>
            </HStack>))}
      </Stack>
    </Stack>

export const RankingInfo = () =>
    <Tooltip placement='bottom-end' label={'Ranking is based on your course score and reflects the results of all ' +
        'your submissions. You will receive a rank once you submit a solution to an active task.'}>
      <InfoOutlineIcon />
    </Tooltip>

export const Detail = ({ name, as }: ButtonProps) => <Tag><TagLeftIcon as={as} /><TagLabel>{name}</TagLabel></Tag>
