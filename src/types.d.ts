declare interface CourseOverview {
  id: number;
  url: string;
  title: string;
  avatar: string;
  university: string;
  semester: string;
  startDate: string;
  endDate: string;
  duration: string;
  studentsCount: number;
  onlineCount: number;
  maxPoints: number;
  points: number;
}

declare interface CourseProps extends CourseOverview {
  description: string;
  assignments: Array<AssignmentProps>;
  events: Array<CourseEventProps>;
  rank: number;
}

declare interface CourseEventProps {
  id: number;
  category: string;
  description: string;
  date: string;
  time: string;
}

declare interface AssignmentProps {
  id: number;
  url: string;
  title: string;
  ordinalNum: number;
  description: string;
  publishedDate: string;
  publishedTime: string;
  dueDate: string;
  dueTime: string;
  duration: string;
  countDown: Array<TimerProps>;
  published: boolean;
  pastDue: boolean;
  active: boolean;
  maxPoints: number;
  points: number;
  tasks: Array<TaskOverview>;
}

declare interface TaskOverview {
  id: number;
  url: string;
  ordinalNum: number;
  title: string;
  maxPoints: number;
  maxAttempts: number;
  active: boolean;
  avgPoints: number;
  remainingAttempts: number;
  points: number;
}

declare interface TaskProps extends TaskOverview {
  instructions: string;
  files: Array<TaskFileProps>;
  submissions: Array<SubmissionProps>;
  nextAttemptAt: string;
}

declare interface TaskFileProps {
  id: number;
  path: string;
  name: string;
  language: string;
  editable: boolean;
  image: boolean;
  template: string;
  latest: string;
}

declare interface TaskInfo {
  id: number;
  assignmentId: number;
  url: string;
  ordinalNum: number;
  title: string;
  maxPoints: number;
  maxAttempts: number;
  dockerImage: string;
  runCommand: string;
  testCommand: string;
  gradeCommand: string;
  timeLimit: number;
  taskFiles: Array<TaskFileInfo>;
}

declare interface TaskFileInfo {
  id: number;
  context: string;
  editable: boolean;
  templateId: string;
  templatePath: string;
}

declare interface TemplateFileProps {
  id: number;
  path: string;
  name: string;
  language: string;
  image: boolean;
  content: string;
  link: string;
}

declare interface SubmissionProps {
  id: number;
  ordinalNum: number;
  name: string;
  command: string;
  valid: boolean;
  graded: boolean;
  createdAt: string;
  points: number;
  maxPoints: number;
  output: string;
  files: Array<SubmissionFileProps>;
}

declare interface NewSubmissionProps {
  restricted: boolean,
  command: string,
  files: Array<{ taskFileId: number, content: string }>
}

declare type WorkspaceProps = Partial<SubmissionProps>

declare interface SubmissionFileProps {
  id: number;
  content: string;
  taskFileId: number;
}

declare interface TimerProps {
  name: string;
  current: number;
  max: number;
}

declare interface StudentProps {
  firstName: string;
  lastName: string;
  email: string;
  points: number;
}

declare interface UserContext {
  isCreator: boolean;
  user: CurrentUser;
  isAssistant: boolean;
  isSupervisor: boolean;
}

declare interface CurrentUser {
  given_name: string;
  email: string;
}
