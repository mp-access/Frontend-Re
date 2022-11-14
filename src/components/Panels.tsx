import {
  Box, Center, chakra, Flex, Heading, HStack, Icon, Tag, TagLabel, Text, useBreakpointValue
} from '@chakra-ui/react'
import { formatDistance, parseISO } from 'date-fns'
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion'
import React, { ComponentProps, useState } from 'react'
import { AssignmentScore, TasksOverview } from './Statistics'
import { AiOutlineClockCircle } from 'react-icons/ai'

const Panel = chakra(motion.div)

export const SplitVertical = (props: ComponentProps<typeof Panel>) => {
  const defaultWidth = useBreakpointValue({ base: 500, sm: 400, lg: 600 }) || 400
  const x = useMotionValue(defaultWidth)
  const width = useTransform(x, x => `${x + 6}px`)
  return (
      <Flex position='relative'>
        <Panel style={{ width }} sx={{ '::-webkit-scrollbar': { w: 0 } }} h='full' overflow='scroll' {...props} />
        <Panel position='absolute' dragMomentum={false} drag='x' style={{ x }} cursor='col-resize' h='full' w='6px'
               dragConstraints={{ left: defaultWidth - 200, right: defaultWidth + 300 }} transition='background 0.2s'
               bg='gray.200' _hover={{ bg: 'gray.300' }} _active={{ bg: 'gray.400' }} />
      </Flex>
  )
}

export const SplitHorizontal = (props: ComponentProps<typeof Panel>) => {
  const defaultHeight = useBreakpointValue({ base: 600, sm: 500, lg: 700 }) || 600
  const y = useMotionValue(defaultHeight)
  const height = useTransform(y, y => `${y + 3}px`)
  return (
      <Flex flexDir='column' position='relative'>
        <Panel style={{ height }} w='full' {...props} />
        <Panel position='absolute' dragMomentum={false} drag='y' style={{ y }} cursor='row-resize' w='full' h='6px'
               dragConstraints={{ top: 200, bottom: defaultHeight + 50 }} transition='background 0.2s' bg='gray.200'
               _hover={{ bg: 'gray.300' }} _active={{ bg: 'gray.400' }} />
      </Flex>
  )
}

export function Carousel({ data }: { data: Array<AssignmentProps> }) {
  const [featured, setFeatured] = useState({ i: 0, dir: 1 })
  const swap = (to = 1) => (dir: number) => ({ x: 200 * dir * to, zIndex: 0, opacity: 0 })
  return (
      <Box layerStyle='segment'>
        <HStack px={4} justify='space-between' mb={4}>
          <HStack>
            <Heading fontSize='xl'>Active Assignments</Heading>
            <Center rounded='md' bg='purple.100' p={0.5} w={6} color='purple.600' fontWeight={600}>
              {data.length}
            </Center>
          </HStack>
          <HStack spacing={4}>
            {data.map((assignment, i) =>
                <Box key={i} onClick={() => setFeatured({ i, dir: featured.i > i ? 1 : -1 })} pos='relative'>
                  <Text color={(featured.i === i) ? 'purple.600' : 'blackAlpha.700'} cursor='pointer'
                        _hover={{ color: 'purple.400' }} children={`Assignment ${assignment.ordinalNum}`} />
                  {(featured.i === i) &&
                    <Panel layoutId='underline' initial={false} bg='purple.500' h={1} pos='absolute' bottom={-1}
                           w='full' animate={{ transition: { type: 'spring', stiffness: 500, damping: 30 } }} />}
                </Box>)}
          </HStack>
        </HStack>
        <AnimatePresence initial={false} custom={featured.dir} mode='popLayout'>
          <motion.div key={featured.i} custom={featured.dir} initial='initial' exit='exit' style={{ height: '100%' }}
                      transition={{ x: { type: 'spring', stiffness: 75, damping: 20 }, opacity: { duration: 0.6 } }}
                      animate={{ zIndex: 1, x: 0, opacity: 1 }} variants={{ initial: swap(), exit: swap(-1) }}>
            <Flex as={motion.div} h='25vh' overflow='hidden' layerStyle='feature'>
              <Box pos='absolute' bg='gradients.405' w='full' h='4xl' rounded='full' left='15%' bottom={5} />
              <Box p={4} zIndex={1}>
                <Text fontSize='xs'>ASSIGNMENT {data[featured.i].ordinalNum}</Text>
                <Heading fontSize='lg'>{data[featured.i].title}</Heading>
                <Tag gap={1} colorScheme='whiteAlpha' my={2}>
                  <Icon as={AiOutlineClockCircle} boxSize={4} color='purple.50' />
                  <TagLabel>
                    Due in {formatDistance(parseISO(data[featured.i].endDate), new Date())}
                  </TagLabel>
                </Tag>
                <Text noOfLines={3} fontSize='sm'>{data[featured.i].description}</Text>
              </Box>
              <TasksOverview data={data[featured.i].tasks} />
              <AssignmentScore data={data[featured.i]} />
            </Flex>
          </motion.div>
        </AnimatePresence>
      </Box>
  )
}