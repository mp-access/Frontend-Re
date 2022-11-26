import { ReactComponent as File } from '../assets/file.svg'
import { ReactComponent as Folder } from '../assets/folder.svg'
import { ReactComponent as GitHub } from '../assets/github.svg'
import { ReactComponent as Python } from '../assets/python.svg'
import { ReactComponent as R } from '../assets/r.svg'
import { ReactComponent as Robot } from '../assets/robot.svg'
import { ReactComponent as Star } from '../assets/star.svg'
import { ReactComponent as Course1 } from '../assets/course-1.svg'
import { ReactComponent as Course2 } from '../assets/course-2.svg'
import { ReactComponent as Course3 } from '../assets/course-3.svg'

export const FolderIcon = Folder
export const FileIcon = File
export const RobotIcon = Robot
export const PythonIcon = Python
export const RIcon = R
export const StarIcon = Star
export const GitHubIcon = GitHub
export const Course1Icon = Course1
export const Course2Icon = Course2
export const Course3Icon = Course3

export const LanugageIcon = (language: string) => {
  switch (language) {
    case 'python':
      return PythonIcon
    case 'r':
      return RIcon
    default:
      return FileIcon
  }
}

export const CourseIcon = (index: number) => {
  switch (index.toString()) {
    case '0':
      return Course1Icon
    case '1':
      return Course2Icon
    case '2':
      return Course3Icon
  }
}