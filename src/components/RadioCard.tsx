import { Box, useRadio, UseRadioProps } from "@chakra-ui/react"

export const RadioCard = (
  props: UseRadioProps & { children: React.ReactNode }, // TODO: double check typing
) => {
  const { getInputProps, getRadioProps } = useRadio(props)

  const input = getInputProps()
  const checkbox = getRadioProps()

  return (
    <Box as="label">
      <input {...input} />
      <Box
        {...checkbox}
        cursor="pointer"
        borderWidth="1px"
        borderRadius="md"
        boxShadow="md"
        _checked={{
          bg: "purple.600",
          color: "white",
          borderColor: "purple.600",
        }}
        _focus={{
          boxShadow: "outline",
        }}
        px={4}
        py={2}
      >
        {props.children}
      </Box>
    </Box>
  )
}
