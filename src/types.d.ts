declare interface CourseOverview {
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
}

declare interface AssignmentOverview {
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
  defaultTaskURL: string;
}

declare interface TaskOverview {
  id: number;
  url: string;
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
  text: boolean;
}

declare interface TaskProps extends TaskOverview {
  files: Array<TaskFileProps>;
  submissions: Array<SubmissionProps>;
}

declare interface TaskFileProps {
  id: number;
  name: string;
  path: string;
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
  hint: string;
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

declare interface UserContext {
  isCreator: boolean;
  user: any;
  isAssistant: boolean;
  isSupervisor: boolean;
}
