declare interface CourseFeature {
  id: number;
  url: string;
  title: string;
  description: string;
  university: string;
  semester: string;
  startDate: string;
  endDate: string;
}

declare interface CourseOverview extends CourseFeature {
  maxPoints: number;
  points: number;
  avgPoints: number;
  assignmentsCount: number;
}

declare interface CourseProps extends CourseOverview {
  activeAssignments: Array<AssignmentProps>;
  pastAssignments: Array<AssignmentOverview>;
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
  activeRange: string;
  remainingTime: Array<TimeCountProps>;
  published: boolean;
  pastDue: boolean;
  active: boolean;
  maxPoints: number;
  points: number;
  avgPoints: number;
  tasksCount: number;
}

declare interface AssignmentProps extends AssignmentOverview {
  tasks: Array<TaskOverview>;
}

declare interface TimeCountProps {
  name: string;
  current: number;
  max: number;
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
  files: Array<TaskFileProps>;
  submissions: Array<SubmissionProps>;
}

declare interface TaskFileProps {
  id: number;
  name: string;
  path: string;
  mime: string;
  language: string;
  editable: boolean;
  open: boolean;
  image: boolean;
  bytes: string;
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
  nextAttemptAt: string;
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

declare interface UserContext {
  isCreator: boolean;
  user: KeycloakTokenParsed;
  isAssistant: boolean;
  isSupervisor: boolean;
}
