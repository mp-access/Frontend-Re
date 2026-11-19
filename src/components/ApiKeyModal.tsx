import {
  Alert,
  AlertDescription,
  AlertIcon,
  Badge,
  Button,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  useClipboard,
  useDisclosure,
  VStack,
} from "@chakra-ui/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { format, parseISO } from "date-fns"
import React, { useState } from "react"
import { AiOutlineKey } from "react-icons/ai"
import { useTranslation } from "react-i18next"

type ApiKeyStatus = {
  exists: boolean
  expired: boolean
  createdAt: string | null
  expiresAt: string | null
}

type GeneratedApiKey = {
  key: string
  createdAt: string
  expiresAt: string
}

const formatDate = (date: string | null) =>
  date ? format(parseISO(date), "dd.MM.yyyy HH:mm") : "-"

/**
 * Lets the supervisor of a course create or regenerate the course API key (X-API-Key).
 * The key is valid for 12 months and is only shown once, right after it was generated.
 */
export const ApiKeyModal: React.FC<{ slug: string }> = ({ slug }) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [generated, setGenerated] = useState<GeneratedApiKey | null>(null)
  const [confirmRegenerate, setConfirmRegenerate] = useState(false)
  const { onCopy, hasCopied, setValue } = useClipboard("")

  const statusKey = ["courses", slug, "api-key"]
  const { data: status, isLoading: statusLoading } = useQuery<ApiKeyStatus>(
    statusKey,
    { enabled: isOpen && !!slug },
  )

  const { mutate: generate, isLoading: generating } = useMutation<
    GeneratedApiKey,
    AxiosError
  >(() => axios.post(`/courses/${slug}/api-key`), {
    onSuccess: (data) => {
      setGenerated(data)
      setValue(data.key)
      setConfirmRegenerate(false)
      queryClient.invalidateQueries(statusKey)
    },
  })

  const close = () => {
    // the plain key is never shown again once the dialog is closed
    setGenerated(null)
    setValue("")
    setConfirmRegenerate(false)
    onClose()
  }

  const hasKey = !!status?.exists

  const statusBadge = () => {
    if (!status) return null
    if (!status.exists) return <Badge>{t("api_key_none")}</Badge>
    if (status.expired)
      return <Badge colorScheme="red">{t("api_key_expired")}</Badge>
    return <Badge colorScheme="green">{t("api_key_active")}</Badge>
  }

  return (
    <>
      <Button
        ml={2}
        mb={2}
        rounded="md"
        leftIcon={<AiOutlineKey />}
        onClick={onOpen}
      >
        {t("API key")}
      </Button>
      <Modal isOpen={isOpen} onClose={close} isCentered size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("API key")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody as={VStack} align="stretch" spacing={4}>
            <Text>{t("api_key_help")}</Text>
            {statusLoading ? (
              <Spinner alignSelf="center" />
            ) : (
              <VStack align="stretch" spacing={1}>
                <HStack>
                  <Text fontWeight="bold">{t("Status")}:</Text>
                  {statusBadge()}
                </HStack>
                {hasKey && (
                  <>
                    <Text>
                      {t("api_key_created")}:{" "}
                      {formatDate(status?.createdAt ?? null)}
                    </Text>
                    <Text>
                      {t("api_key_expires")}:{" "}
                      {formatDate(status?.expiresAt ?? null)}
                    </Text>
                  </>
                )}
              </VStack>
            )}
            {generated && (
              <VStack align="stretch" spacing={2}>
                <Alert status="warning" rounded="md">
                  <AlertIcon />
                  <AlertDescription>{t("api_key_shown_once")}</AlertDescription>
                </Alert>
                <InputGroup>
                  <Input
                    value={generated.key}
                    isReadOnly
                    fontFamily="monospace"
                    pr="5.5rem"
                    onFocus={(e) => e.target.select()}
                  />
                  <InputRightElement width="5.5rem">
                    <Button size="sm" onClick={onCopy}>
                      {hasCopied ? t("Copied") : t("Copy")}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </VStack>
            )}
            {confirmRegenerate && (
              <Alert status="error" rounded="md">
                <AlertIcon />
                <AlertDescription>
                  {t("api_key_regenerate_warning")}
                </AlertDescription>
              </Alert>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={close}>
              {t("Close")}
            </Button>
            {!statusLoading && !hasKey && (
              <Button
                colorScheme="blue"
                ml={2}
                isLoading={generating}
                onClick={() => generate()}
              >
                {t("Create API key")}
              </Button>
            )}
            {!statusLoading && hasKey && !confirmRegenerate && (
              <Button
                colorScheme="blue"
                ml={2}
                onClick={() => setConfirmRegenerate(true)}
              >
                {t("Regenerate API key")}
              </Button>
            )}
            {confirmRegenerate && (
              <Button
                colorScheme="red"
                ml={2}
                isLoading={generating}
                onClick={() => generate()}
              >
                {t("Confirm regenerate")}
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
