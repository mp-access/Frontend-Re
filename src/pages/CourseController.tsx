import {
  Button,
  ButtonGroup,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react"
import React from "react"
import { AiOutlineAudit, AiOutlineGithub } from "react-icons/ai"
import { Link } from "react-router-dom"
import { usePull } from "../components/Hooks"
import { useTranslation } from "react-i18next"

export default function CourseController() {
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure({
    onClose: () => window.location.reload(),
  })
  const { mutate: pull, isLoading } = usePull()
  return (
    <ButtonGroup variant="gradient">
      <Button as={Link} to="participants" leftIcon={<AiOutlineAudit />}>
        {t("Participants")}
      </Button>
      <Button leftIcon={<AiOutlineGithub />} onClick={onOpen}>
        Pull
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Text textAlign="center" color="purple.600">
              Update Course Content
            </Text>
            <ModalCloseButton />
          </ModalHeader>
          <ModalBody
            as={VStack}
            justifyContent="center"
            spacing={4}
            py={4}
            px={10}
          >
            <Text textAlign="center">
              Are you sure you want to pull the latest data from the course
              repository?
            </Text>
            <Button
              variant="round"
              isLoading={isLoading}
              onClick={() => pull()}
            >
              Pull
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </ButtonGroup>
  )
}
