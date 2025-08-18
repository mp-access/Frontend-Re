import {
  Button,
  Center,
  Heading,
  HStack,
  Stack,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react"
import { usePoints } from "../components/Hooks"
import { Link } from "react-router-dom"
import { take } from "lodash"
import { Select } from "chakra-react-select"

export function SupervisorZone() {
  const { data: participants } = usePoints()
  if (!participants) return <></>
  return (
    <Stack flexGrow={1} p={4}>
      <TableContainer py={2}>
        <Heading fontSize="lg" textAlign="center" my={4}>
          Top Participants
        </Heading>
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th isNumeric>Points</Th>
            </Tr>
          </Thead>
          <Tbody>
            {take(participants, 3).map((participant) => (
              <Tr key={participant.email}>
                <Td>
                  {participant.firstName} {participant.lastName}
                </Td>
                <Td isNumeric>{participant.points}</Td>
              </Tr>
            ))}
          </Tbody>
          <TableCaption>
            {participants.length ? (
              <Button as={Link} to="supervisor/participants" variant="link">
                All Participants
              </Button>
            ) : (
              <Center color="gray.400">No participants found.</Center>
            )}
          </TableCaption>
        </Table>
      </TableContainer>
    </Stack>
  )
}

interface TaskControllerProps {
  value: string
  defaultValue: string
  onChange: (value: string) => void
  hideStudentName: boolean
}

export function TaskController({
  value,
  defaultValue,
  onChange,
  hideStudentName,
}: TaskControllerProps) {
  const { data: participants } = usePoints()
  return (
    <HStack p={1} w="full">
      <Stack fontSize="sm" flexGrow={1}>
        <Select
          placeholder="View as participant..."
          value={{ email: value }}
          getOptionValue={(data) => data?.email}
          getOptionLabel={(data) =>
            hideStudentName ? "Anonymous Student" : data?.email
          }
          options={participants}
          size="sm"
          controlShouldRenderValue={value !== defaultValue}
          isClearable
          focusBorderColor="purple.600"
          onChange={(newValue) => onChange(newValue?.email || defaultValue)}
        />
      </Stack>
    </HStack>
  )
}
