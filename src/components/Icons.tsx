import { Icon } from '@chakra-ui/react'
import React from 'react'
import { BsCircleFill } from 'react-icons/bs'
import { ReactComponent as Class } from '../assets/class.svg'
import { ReactComponent as Practice } from '../assets/code-practice.svg'
import { ReactComponent as Theory } from '../assets/code-theory.svg'
import { ReactComponent as File } from '../assets/file.svg'
import { ReactComponent as Folder } from '../assets/folder.svg'
import { ReactComponent as House } from '../assets/house.svg'
import { ReactComponent as University } from '../assets/university.svg'

export const ClassIcon = Class
export const PracticeIcon = Practice
export const TheoryIcon = Theory
export const HouseIcon = House
export const UniversityIcon = University
export const FolderIcon = Folder
export const FileIcon = File

export const DirtyFileMark = () => <Icon as={BsCircleFill} position='absolute' top={-1} left={0} boxSize={2} color='orange.200'/>