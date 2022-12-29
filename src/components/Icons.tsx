import { ReactComponent as CourseAlt } from '../assets/course-alt.svg'
import { ReactComponent as File } from '../assets/file.svg'
import { ReactComponent as Folder } from '../assets/folder.svg'
import { ReactComponent as Python } from '../assets/python.svg'
import { ReactComponent as R } from '../assets/r.svg'
import { ReactComponent as Robot } from '../assets/robot.svg'
import { ReactComponent as Test } from '../assets/test.svg'
import { ReactComponent as Run } from '../assets/run.svg'
import { ReactComponent as SWITCH } from '../assets/switch-edu-id.svg'
import { AvatarProps, Icon, IconProps, Image } from '@chakra-ui/react'
import React from 'react'

export const FolderIcon = Folder
export const FileIcon = File
export const RobotIcon = Robot
export const SWITCHIcon = SWITCH

const actions: Record<string, any> = { 'Test': Test, 'Run': Run }
const languages: Record<string, any> = { 'python': Python, 'r': R }

export const LanugageIcon = ({ name = '', ...props }: IconProps) => <Icon as={languages[name] || FileIcon} {...props} />

export const ActionIcon = ({ name = '', ...props }: IconProps) => <Icon as={actions[name] || Run} {...props} />

export const CourseAvatar = ({ src }: AvatarProps) =>
    <Image src={src} fallback={<Icon as={CourseAlt} rounded='2xl' boxSize={36} />} rounded='2xl' boxSize={36} />