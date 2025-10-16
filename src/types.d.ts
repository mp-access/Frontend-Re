declare interface CourseOverview {
  id: number
  slug: string
  logo: string
  overrideStart: string
  overrideEnd: string
  participantCount: number
  onlineCount: number
  maxPoints: number
  points: number
  information: Record<string, CourseInformation>
  supervisors: Array<{ name: string }>
  assistants: Array<{ name: string }>
}

declare interface CourseInformation {
  id: number
  language: string
  title: string
  description: string
  university: string
  period: string
}

declare interface CourseProps extends CourseOverview {
  assignments: Array<AssignmentProps>
  hasVisibleExamples: boolean
  events: Array<CourseEventProps>
  rank: number
}

declare interface CourseMetaProps {
  header?: string
  description?: string
  slug?: string
  repository?: string
  repositoryBranch?: string
  repositoryUser?: string
  repositoryPassword?: string
  webhookSecret?: string
}

declare interface CourseEventProps {
  id: number
  category: string
  description: string
  date: string
  time: string
}

declare interface AssignmentProps {
  id: number
  slug: string
  information: Record<string, AssignmentInformation>
  ordinalNum: number
  start: string
  end: string
  publishedDate: string
  publishedTime: string
  dueDate: string
  dueTime: string
  countDown: Array<TimerProps>
  published: boolean
  pastDue: boolean
  active: boolean
  maxPoints: number
  points: number
  tasks: Array<TaskOverview>
}

declare interface AssignmentInformation {
  id: number
  language: string
  title: string
  description: string
}

type TaskStatus = "Planned" | "Interactive" | "Active" | "Closed"

declare interface TaskOverview {
  id: number
  slug: string
  information: Record<string, TaskInformation>
  ordinalNum: number
  maxPoints: number
  maxAttempts: number
  timeLimit: number
  status: TaskStatus
  avgPoints: number
  remainingAttempts: number
  points: number
  start: string | null
  end: string | null
  runCommandAvailable: boolean
  testCommandAvailable: boolean
  gradeCommandAvailable: boolean
}

declare interface TaskInformation {
  id: number
  language: string
  title: string
  instructionsFile: string
}

declare interface TaskProps extends TaskOverview {
  instructions: string
  files: Array<TaskFileProps>
  submissions: Array<SubmissionProps>
  nextAttemptAt: string
  deadline: string | null
}

declare interface TaskFileProps {
  id: number
  path: string
  name: string
  mimeType: string
  editable: boolean
  binary: boolean
  template: string
  templateBinary: string
  content: string
}

declare interface TaskInfo {
  id: number
  assignmentId: number
  slug: string
  ordinalNum: number
  title: string
  maxPoints: number
  maxAttempts: number
  attemptRefill: number
  dockerImage: string
  runCommand: string
  testCommand: string
  gradeCommand: string
  timeLimit: number
  taskFiles: Array<TaskFileInfo>
}

declare interface TaskFileInfo {
  id: number
  context: string
  editable: boolean
  templateId: string
  templatePath: string
}

declare interface TemplateFileProps {
  id: number
  path: string
  name: string
  mimeType: string
  image: boolean
  content: string
  link: string
  updatedAt: string
}

declare interface SubmissionProps {
  id: number
  ordinalNum: number
  name: string
  command: string
  valid: boolean
  graded: boolean
  createdAt: string
  points: number
  maxPoints: number
  output: string
  files: Array<SubmissionFileProps>
  persistentResultFiles: Array<PersistenResultFileProps>
  embedding: Array<number>
  testsPassed: Array<number>
}

declare interface NewSubmissionProps {
  restricted: boolean
  command: string
  files: Array<{ taskFileId: number; content: string }>
}

declare interface PublishExampleProps {
  duration: number
}

declare type WorkspaceProps = Partial<SubmissionProps>

declare interface SubmissionFileProps {
  id: number
  content: string
  taskFileId: number
}

declare interface PersistentResultFileProps {
  id: number
  path: string
  mimeType: string
  content: string
  contentBinary: string
  binary: boolean
}

declare interface TimerProps {
  name: string
  current: number
  max: number
}

declare interface ParticipantProps {
  firstName: string
  lastName: string
  email: string
  points: number
  registrationId?: string
  otherId?: string
  username?: string
}

declare interface ExampleSubmissionsCount {
  submissionsCount: Record<string, number>
}

declare interface UserContext {
  isCreator: boolean
  user: CurrentUser
  isAssistant: boolean
  isSupervisor: boolean
}

declare interface CurrentUser {
  given_name: string
  email: string
}

declare interface ExampleInformation {
  participantsOnline: number
  totalParticipants: number
  numberOfReceivedSubmissions: number
  numberOfProcessedSubmissions: number
  numberOfProcessedSubmissionsWithEmbeddings: number
  passRatePerTestCase: Record<string, number>
  avgPoints: number
}

declare interface SubmissionSsePayload {
  submissionId: number
  studentId: string
  date: string
  points: number | null
  testsPassed: number[]
  content: Record<string, string>
}

declare interface Bookmark {
  submissionId: number
  studentId: string
  testsPassed: number[]
  selectedFileName: string | null
  filters: {
    testCaseSelection: Record<string | boolean>
    exactMatch: boolean
    categorySelected: boolean
  }
}

declare interface DistributionBin {
  lowerBoundary: number
  upperBoundary: number
  numberOfSubmissions: number
}

declare interface PointDistribution {
  pointDistribution: DistributionBin[]
}

declare interface ExampleSubmissionsDTO extends ExampleInformation {
  submissions: SubmissionSsePayload[]
}

declare interface ExampleResetSsePayload {
  exampleSlug: string
}

declare interface InteractiveExampleDTO {
  exampleSlug: string | null
}

declare interface ExamplePublicationDTO {
  startDate: string
  endDate: string
}
