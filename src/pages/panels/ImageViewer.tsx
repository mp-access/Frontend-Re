import { Center, Image } from '@chakra-ui/react'
import React from 'react'

export default function ImageViewer({ bytes }: { bytes: string }) {
  return (
      <Center p={2} top='5.5vh' position='absolute' bg='white' h='calc(100% - 5vh)' w='full' zIndex={2}>
        <Image src={`data:image/png;base64,${bytes}`} h='auto' />
      </Center>
  )
}