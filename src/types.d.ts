declare interface CourseProps {
  id: number;
  url: string;
  title: string;
  description: string;
  university: string;
  semester: string;
  startDate: string;
  endDate: string;
  points: number;
  activeAssignmentsCount: number;
  assignments: Array<AssignmentProps>;
}

declare interface AssignmentProps {
  id: number;
  url: string;
  title: string;
  ordinalNum: number;
  description: string;
  startDate: string;
  endDate: string;
  published: boolean;
  pastDue: boolean;
  active: boolean;
  maxPoints: number;
  points: number;
  tasksCount: number;
  defaultTaskNum: number;
}

declare interface TaskProps {
  id: number;
  title: string;
  ordinalNum: number;
  description: string;
  type: string;
  published: boolean;
  graded: boolean;
  maxPoints: number;
  limited: boolean;
  maxAttempts: number;
  remainingAttempts: number;
  points: number;
}

declare interface TaskWorkspaceProps extends TaskProps {
  files: Array<TaskFileProps>;
  submissions: Array<SubmissionProps>;
}

declare interface TaskFileProps {
  id: number;
  name: string;
  language: string;
  editable: boolean;
  image: boolean;
  template: string;
  content: string;
}

declare interface SubmissionProps {
  id: number;
  name: string;
  userId: string;
  valid: boolean;
  graded: boolean;
  createdAt: string;
  points: number;
  maxPoints: number;
  stdOut: string;
  answer: string;
  files: Array<SubmissionFileProps>;
}

declare interface SubmissionFileProps {
  id: number;
  content: string;
}

declare interface StudentProps {
  firstName: string;
  lastName: string;
  email: string;
  points: number;
}

declare interface CourseContext {
  isAssistant: boolean;
  isSupervisor: boolean;
  userId: string;
  name?: string;
}
