import React, { useState, useRef, useEffect } from "react"
import { humanFileSize } from "./Util"
import { useTranslation } from "react-i18next"
import {
  Button,
  Modal,
  ModalOverlay,
  Box,
  ModalContent,
  Text,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Textarea,
} from "@chakra-ui/react"
import axios from "axios"

export const DumpModal: React.FC<{
  slug: string
}> = ({ slug }) => {
  const { i18n, t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dumpSize, setDumpSize] = useState("")
  const [abort, setAbort] = useState<AbortController|null>(null)
  const initialRef = React.useRef(null)


  const openModal = () => setIsOpen(true)
  const closeModal = () => {
    if (abort) {
      abort.abort()
    }
    setIsOpen(false)
  }

  const hasFilePicker = () => {
    try {
      showSaveFilePicker
      return true
    } catch {
      return false
    }
  }

  async function downloadLargeFile(url: string, filename: string) {
    setDumpSize("")
    const controller = new AbortController()
    const signal = controller.signal
    setAbort(controller)
    try {
      let handle = await showSaveFilePicker({
        suggestedName: filename
      });
      let writable = await handle.createWritable();

      let readable = (
        await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': localStorage.getItem("access-auth")  ?? '',
            'Accept': '*/*',
          },
          signal: signal
        })
      ).body;

      if (readable == null) {
        throw new Error("Could not fetch dump")
      }

      let totalBytes = 0;
      const trackProgress = new TransformStream({
        transform(chunk, controller) {
          totalBytes += chunk.length;
          setDumpSize(humanFileSize(totalBytes));
          controller.enqueue(chunk);
        }
      });

      await readable.pipeThrough(trackProgress).pipeTo(writable);

      setAbort(null)
      setLoading(false)
      closeModal()
      }
    catch {
      setLoading(false)
      return
    }
  }

  const handleApply = async () => {
    setLoading(true)
    downloadLargeFile(`/api/courses/${slug}/dump`, `${slug}_dump.zip`)
  }

  return (
    <>
      <Button ml={2} mb={2} rounded="md" onClick={openModal}>
        {t("Dump")}
      </Button>

      <Modal
        initialFocusRef={initialRef}
        isOpen={isOpen}
        onClose={closeModal}
        size="full"
        closeOnEsc={false}
      >
        <ModalOverlay />
        <ModalContent
          rounded="md"
          display="flex"
          flexDirection="column"
          maxHeight="90vh"
          minHeight="20vh"
          minWidth="10vh"
          maxWidth="90vh"
          margin="5vh"
        >
          <ModalHeader>{t("Download data dump")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody
            flex="1"
            display="flex"
            flexDirection="column"
            pl={6}
            pr={6}
          >
            <Text>
              {loading ? t("dump_downloading") : (hasFilePicker() ? t("dump_help"): t("dump_impossible"))}
            </Text>
            <Text
              style={
                {
                  display: loading ? "block" : "none",
                  fontVariantNumeric: "tabular-nums",
                  fontFeatureSettings: "tnum",
                  fontFamily: 'monospace',
                  textAlign: 'right'
                }
              }>
              {`${dumpSize}`}
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleApply}
              isDisabled={!hasFilePicker()}
              isLoading={loading}
              ml={2}
            >
              {t("Download")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
