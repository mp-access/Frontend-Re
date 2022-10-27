import { chakra } from '@chakra-ui/react'
import { Reorder } from 'framer-motion'
import React, { ComponentProps } from 'react'

const FileTabBase = chakra(Reorder.Item)

export const FileTab = ({ isSelected, value, onClick, ...props }: ComponentProps<any>) =>
    <FileTabBase value={value} id={`${value.id}`} roundedTop='lg' display='flex' alignItems='baseline'
                 borderWidth={1} bg='white' initial={{ opacity: 0, y: 30 }}
                 exit={{ opacity: 0, y: 20, transition: { duration: 0.3 } }}
                 whileHover={{ color: '#333333' }} whileDrag={{ backgroundColor: '#e3e3e3' }}
                 animate={{
                   opacity: 1, backgroundColor: isSelected ? '#fff' : '#f3f3f3', y: 0,
                   color: isSelected ? '#333333' : '#999999', transition: { duration: 0.15 }
                 }} {...props} />