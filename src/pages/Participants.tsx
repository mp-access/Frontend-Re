import {
  Button,
  Center,
  Heading,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react"
import axios from "axios"
import { useParams } from "react-router-dom"
import { usePoints, useStudentExampleSubmissions } from "../components/Hooks"

export default function Participants() {
  const { courseSlug } = useParams()
  const { data: participants } = usePoints()
  const { data: exampleSubmissions } = useStudentExampleSubmissions()

  const downloadAssignmentPoints = async () => {
    const response = await axios.get<Blob>(`/courses/${courseSlug}/assignmentPoints`, {
      responseType: 'blob',
      headers: { 'Accept': 'text/csv' }
    });
    const link = document.createElement('a');
    // why the weird casting?
    // response above is a Blob { size: ..., type: "text/csv" }
    // but createObjectURL sees it as AxiosResponse<Blob, any>
    // and also, response.data is undefiend. ¯\_(ツ)_/¯
    link.href = window.URL.createObjectURL(response as unknown as Blob);
    const currentDate = new Date().toISOString().split('T')[0];
    link.download = `${courseSlug}_assignment_points_${currentDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }


  if (!participants) return <></>
  return (
    <VStack>
      <TableContainer p={8} my={4} layerStyle="segment">
        <Heading m={2} mt={0} fontSize="3xl">
          {participants.length} Participants
        </Heading>
        <Button ml={2} mb={2} rounded="md" onClick={downloadAssignmentPoints}>
          Download Assignment points as CSV
        </Button>
        <Table maxW="container.sm">
          <Thead>
            <Tr>
              <Th>Username</Th>
              <Th>Registered in course as</Th>
              <Th>Also known as</Th>
              <Th>Last Name</Th>
              <Th>First Name</Th>
              <Th>Email</Th>
              <Th>Points</Th>
              <Th>Example Submissions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {participants.map((participant) => (
              <Tr key={participant.username || participant.registrationId}>
                <Td>{participant.username}</Td>
                <Td>{participant.registrationId}</Td>
                <Td>{participant.otherId}</Td>
                <Td>{participant.lastName}</Td>
                <Td>{participant.firstName}</Td>
                <Td>{participant.email}</Td>
                <Td>{participant.points?.toFixed(2)}</Td>
                <Td>
                  {(
                    (participant.username &&
                      exampleSubmissions?.submissionsCount?.[
                        participant.username
                      ]) ||
                    0
                  ).toFixed(0)}
                </Td>
              </Tr>
            ))}
          </Tbody>
          <TableCaption>
            {!participants.length && (
              <Center color="gray.400">No participants found.</Center>
            )}
          </TableCaption>
        </Table>
      </TableContainer>
    </VStack>
  )
}
