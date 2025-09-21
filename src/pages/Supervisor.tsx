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
import { Select } from "chakra-react-select"
import { take } from "lodash"
import { Link } from "react-router-dom"
import { useUsers } from "../components/Hooks"

export function SupervisorZone() {
  const { data: participants } = useUsers()
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
  obfuscateUserId: boolean
}

export function TaskController({
  value,
  defaultValue,
  onChange,
  obfuscateUserId,
}: TaskControllerProps) {
  const { data: participants } = useUsers()
  return (
    <HStack p={1} w="full">
      <Stack fontSize="sm" flexGrow={1}>
        <Select
          placeholder="View as participant..."
          value={{ email: value }}
          getOptionValue={(data) => data?.email}
          getOptionLabel={(data) =>
            obfuscateUserId ? `User ${btoa(data?.email)}` : data?.email
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
