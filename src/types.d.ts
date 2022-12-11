declare interface CourseFeature {
  id: number;
  url: string;
  title: string;
  description: string;
  university: string;
  semester: string;
  startDate: string;
  endDate: string;
  studentsCount: number;
  onlineCount: number;
  feedback: string;
}

declare interface CourseOverview extends CourseFeature {
  maxPoints: number;
  points: number;
  assignmentsCount: number;
  events: Array<CourseEventProps>;
}

declare interface CourseProps extends CourseOverview {
  activeAssignments: Array<AssignmentProps>;
  pastAssignments: Array<AssignmentOverview>;
  rank: number;
}

declare interface AssignmentOverview {
  id: number;
  url: string;
  name: string;
  title: string;
  ordinalNum: number;
  description: string;
  startDate: string;
  endDate: string;
  duration: string;
  countDown: Array<TimerProps>;
  published: boolean;
  pastDue: boolean;
  active: boolean;
  maxPoints: number;
  points: number;
  tasksCount: number;
}

declare interface AssignmentProps extends AssignmentOverview {
  tasks: Array<TaskOverview>;
}

declare interface TaskOverview {
  id: number;
  url: string;
  name: string;
  title: string;
  ordinalNum: number;
  instructions: string;
  active: boolean;
  published: boolean;
  avgPoints: number;
  maxPoints: number;
  maxAttempts: number;
  remainingAttempts: number;
  points: number;
}

declare interface TaskProps extends TaskOverview {
  nextAttemptAt: string;
  files: Array<TaskFileProps>;
  submissions: Array<SubmissionProps>;
}

declare interface TaskFileProps {
  id: number;
  name: string;
  path: string;
  language: string;
  editable: boolean;
  open: boolean;
  image: boolean;
  template: string;
  content: string;
}

declare interface SubmissionProps {
  id: number;
  name: string;
  type: string;
  valid: boolean;
  graded: boolean;
  createdAt: string;
  points: number;
  maxPoints: number;
  output: string;
  files: Array<SubmissionFileProps>;
}

declare interface SubmissionFileProps {
  id: number;
  content: string;
  taskFileId: number;
}

declare interface StudentProps {
  firstName: string;
  lastName: string;
  email: string;
  points: number;
}

declare interface TimerProps {
  name: string;
  current: number;
  max: number;
}

declare interface CourseEventProps {
  type: string;
  description: string;
  date: string;
  time: string;
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
