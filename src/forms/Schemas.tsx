import { array, boolean, date, number, object, setLocale, string } from 'yup'

setLocale({
  mixed: { oneOf: () => 'Please select one of the options' },
  string: {
    min: context => `Enter at least ${context.min} characters`,
    max: context => `Over the limit of ${context.max} characters`,
  },
  array: {
    min: context => `Enter at least ${context.min} values`
  },
})

export const selectionOptions: Record<string, Array<string>> = {
  'organization': ['university', 'private'],
  'assignmentType': ['homework', 'in class'],
  'university': ['Universität Zürich', 'ETH Zürich'],
  'semester': ['Spring 2022', 'Fall 2022'],
  'taskType': ['CODE', 'CODE_SNIPPET', 'SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TEXT'],
  'fileType': ['EDITABLE', 'READ_ONLY', 'RESTRICTED', 'GRADING'],
  'extension': ['PY', 'R', 'TXT'],
}

export const fileSchema = object({
  name: string(),
  extension: string().ensure().oneOf(selectionOptions['extension']),
  fileType: string().ensure().oneOf(selectionOptions['fileType']),
  restricted: boolean().default(false),
  readOnly: boolean().default(false),
  grading: boolean().default(false),
})

export const baseSchema = object({
  url: string().ensure().label('URL').min(3)
      .matches(/[a-zA-Z0-9-]/, 'Please enter only letters, numbers or dash (-)').required(),
  name: string().ensure().min(1).required(),
  firstName: string().ensure().min(1).required(),
  lastName: string().ensure().min(1).required(),
  description: string().ensure().max(200),
  catalogue: string().ensure(),
  organization: string().ensure().oneOf(selectionOptions['organization']),
  university: string().ensure().default(selectionOptions['university'][0]),
  semester: string().ensure(),
  assignmentType: string().ensure().oneOf(selectionOptions['assignmentType']),
  startDate: date().required(),
  endDate: date().required(),
  taskType: string().ensure().oneOf(selectionOptions['taskType']),
  files: array().of(fileSchema).default([
    { name: 'main', extension: 'PY', fileType: 'EDITABLE' },
    { name: 'main_tests', extension: 'PY', fileType: 'EDITABLE' },
    { name: 'grading_tests', extension: 'PY', fileType: 'GRADING' },
    { name: 'solutions', extension: 'PY', fileType: 'RESTRICTED' },
  ]),
  limited: boolean().default(true),
  graded: boolean().default(true),
  maxAttempts: number(),
  maxPoints: number(),
  students: array().default([]).of(string().ensure().email((context) =>
      <p>The file you uploaded contains a non-valid email value: "{context.value}".<br/>
      Please check the content of the file and upload it again.</p>))
})