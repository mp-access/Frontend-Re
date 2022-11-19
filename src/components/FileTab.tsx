import { chakra } from '@chakra-ui/react'
import { Reorder } from 'framer-motion'
import React, { ComponentProps } from 'react'

const FileTabBase = chakra(Reorder.Item)

export const FileTab = ({ isSelected, value, onClick, ...props }: ComponentProps<any>) =>
    <FileTabBase value={value} id={`${value.id}`} roundedTop='lg' display='flex' alignItems='baseline'
                 borderWidth={1} borderBottomWidth={0} borderColor='blackAlpha.300'
                 bg='base' initial={{ opacity: 0, y: 30 }} _hover={{ color: 'purple.600' }}
                 exit={{ opacity: 0, y: 20, transition: { duration: 0.3 } }} whileDrag={{ opacity: 1 }}
                 animate={{ opacity: isSelected ? 1 : 0.6, y: 0, transition: { duration: 0.15 } }} {...props} />