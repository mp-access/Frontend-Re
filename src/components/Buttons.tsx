import {
  Box, BoxProps, Button, ButtonProps, Center, Flex, HStack, Input, Stack, TabProps, Tag, TagLabel, TagLeftIcon, Text,
  Tooltip
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

const transitionStyle = { repeat: Infinity, repeatDelay: .7, duration: .5, ease: 'easeInOut' }
type SaveButtonProps = ButtonProps & { formState: FormState<any> }

export const LogoButton = () =>
    <Box as={Link} to='/courses' fontFamily='monospace' fontSize='4xl' pt={2}
         _hover={{ color: 'purple.500' }} children='ACCESS.' />

export const EditButton = ({ to, ...props }: NavigateProps & ButtonProps) =>
    <Button as={Link} to={to} variant='ghost' size='sm' leftIcon={<EditIcon />} children='Edit' {...props} />

export const SaveButton = ({ formState: { isSubmitting }, ...props }: SaveButtonProps) =>
    <Button alignSelf='center' type='submit' {...props} isLoading={isSubmitting} children='Save' />

export const GoToButton = ({ children, ...props }: BoxProps) =>
    <HStack as={motion.div} fontSize='lg' fontWeight={600} color='purple.600'
            whileHover={{ x: [0, 2, 0, -2, 0, 2, 0], transition: transitionStyle }} {...props}>
      <Text>{children}</Text>
      <BsArrowRight />
    </HStack>

export const UploadButton = ({ onSubmit }: { onSubmit: Function }) =>
    <Dropzone onDrop={(dropped) => dropped[0]?.text().then(data => onSubmit(JSON.parse(data)))} multiple={false}
              children={({ getRootProps, getInputProps }) =>
                  <Center h='full' {...getRootProps()}>
                    <Button leftIcon={<ImDownload />}>Import</Button>
                    <Input {...getInputProps()} size='sm' type='file' />
                  </Center>} />
export const Counter = ({ children }: BoxProps) =>
    <Center rounded='md' bg='purple.100' px={2} py={0.5} color='purple.600' fontSize='sm'
            fontWeight={600} children={children} />

export const ActionButton = ({ name, ...props }: ButtonProps) =>
    <Button leftIcon={ActionIcon({ name })} children={name} {...props} />

export const ActionTab = ({ name }: TabProps) =>
    <HStack>{ActionIcon({ name })}<Text>{name}</Text></HStack>

export const EventBox = ({ event }: { event?: CourseEventProps }) =>
    <Stack p={2}>
      <HStack><FcCalendar /><Text fontWeight={500}>Events Today</Text></HStack>
      {!event && <Text p={1} fontSize='sm' color='blackAlpha.500'>No events planned.</Text>}
      {event &&
        <HStack py={1} rounded='lg' justify='space-between'>
          <Flex>
            <Box boxSize={5} className={'cal-' + event.category} bgPos={0} />
            <Text>{event.description}</Text>
          </Flex>
          <Text color='blackAlpha.600' textAlign='end'>{event.time}</Text>
        </HStack>}
    </Stack>

export const RankingInfo = () =>
    <Tooltip placement='bottom-end' label={'Ranking is based on your course score and reflects the results of all ' +
        'your submissions. You will receive a rank once you submit a solution to an active task.'}>
      <InfoOutlineIcon />
    </Tooltip>

export const Detail = ({ name, as }: ButtonProps) => <Tag><TagLeftIcon as={as} /><TagLabel>{name}</TagLabel></Tag>
