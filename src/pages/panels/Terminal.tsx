import { HStack, Stack, Text } from '@chakra-ui/react'
import React from 'react'
import { Scroll } from '../../components/Base'


export default function Terminal({ submissions }: { submissions: Array<SubmissionProps> }) {

  return (
      <Scroll h='full'>
        <Stack h='full' spacing={0} p={2} fontSize='sm' color='whiteAlpha.900'
               fontFamily='"Source Code Pro", monospace' fontWeight={600} lineHeight={1.3}>
          <Stack spacing={4} maxH='5vh'>
            {submissions.map(submission =>
                <Stack key={submission.id} spacing={0}>
                  <HStack align='start'>
                    <Text whiteSpace='nowrap' color='orange.300'>{'>'}</Text>
                    <Text whiteSpace='pre-wrap'>
                      Running {submission.name}...
                    </Text>
                  </HStack>
                  <HStack align='start'>
                    <Text whiteSpace='nowrap' color='orange.300'>$</Text>
                    <Text whiteSpace='pre-wrap' color={submission.stdOut ? 'inherit' : 'whiteAlpha.600'}>
                      {submission.stdOut || 'No output'}
                    </Text>
                  </HStack>
                </Stack>)}
          </Stack>
        </Stack>
      </Scroll>
  )
}
