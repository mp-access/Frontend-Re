declare interface CourseOverview {
  id: number;
  url: string;
  title: string;
  description: string;
  university: string;
  semester: string;
  startDate: string;
  endDate: string;
  maxPoints: number;
  points: number;
  avgPoints: number;
  activeAssignments: Array<AssignmentProps>;
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
  avgPoints: number;
  tasksCount: number;
}

declare interface AssignmentProps extends AssignmentOverview {
  tasks: Array<TaskOverview>;
}

declare interface TaskOverview {
  id: number;
  url: string;
  title: string;
  ordinalNum: number;
  instructions: string;
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
  language: string;
  editable: boolean;
  image: boolean;
  bytes: string;
  template: string;
  content: string;
}

declare interface SubmissionProps {
  id: number;
  name: string;
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
}

declare interface StudentProps {
  firstName: string;
  lastName: string;
  email: string;
  points: number;
}

declare interface UserContext {
  isCreator: boolean;
  user: KeycloakProfile;
  isAssistant: boolean;
  isSupervisor: boolean;
}
