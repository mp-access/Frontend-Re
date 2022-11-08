import { ReactComponent as File } from '../assets/file.svg'
import { ReactComponent as Folder } from '../assets/folder.svg'
import { ReactComponent as GitHub } from '../assets/github.svg'
import { ReactComponent as Python } from '../assets/python.svg'
import { ReactComponent as R } from '../assets/r.svg'
import { ReactComponent as Robot } from '../assets/robot.svg'
import { ReactComponent as Star } from '../assets/star.svg'

export const FolderIcon = Folder
export const FileIcon = File
export const RobotIcon = Robot
export const PythonIcon = Python
export const RIcon = R
export const StarIcon = Star
export const GitHubIcon = GitHub

export const TypeIcon = (language: string) => {
  switch (language) {
    case 'python':
      return PythonIcon
    case 'r':
      return RIcon
    default:
      return FileIcon
  }
}