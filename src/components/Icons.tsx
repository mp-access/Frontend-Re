import File from "../assets/file.svg?react"
import Folder from "../assets/folder.svg?react"
import GitHub from "../assets/github.svg?react"
import FolderOpen from "../assets/folder-open.svg?react"
import Python from "../assets/python.svg?react"
import R from "../assets/r.svg?react"
import Robot from "../assets/robot.svg?react"
import Test from "../assets/test.svg?react"
import Run from "../assets/run.svg?react"
import SWITCH from "../assets/switch-edu-id.svg?react"
import {
  AspectRatio,
  AvatarProps,
  Icon,
  IconProps,
  Image,
} from "@chakra-ui/react"
import React from "react"

export const FolderIcon = Folder
export const RobotIcon = Robot
export const SWITCHIcon = SWITCH
export const GitHubIcon = GitHub

const icons: Record<string, any> = {
  Test: Test,
  Run: Run,
  python: Python,
  r: R,
  md: File,
  "folder-false": Folder,
  "folder-true": FolderOpen,
}

export const LanguageIcon = ({ name = "", ...props }: IconProps) => (
  <Icon as={icons[name] || File} {...props} />
)

export const NodeIcon = ({ name = "", ...props }: IconProps) => (
  <Icon as={icons[name] || File} {...props} />
)

export const ActionIcon = ({ name = "", ...props }: IconProps) => (
  <Icon as={icons[name] || Run} {...props} />
)

export const CourseAvatar = ({ src, ...props }: AvatarProps) => {
  return (
    <AspectRatio {...props} ratio={1} h="full" minW={36} boxSize={36}>
      {src ? <Image src={src} rounded="2xl" /> : <Icon as={Run} />}
    </AspectRatio>
  )
}
