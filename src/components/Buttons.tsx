import {
  Box,
  BoxProps,
  Button,
  ButtonProps,
  Center,
  Flex,
  HStack,
  Icon,
  IconButton,
  IconButtonProps,
  Stack,
  TabProps,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react"
import React from "react"
import { Link } from "react-router-dom"
import { ActionIcon } from "./Icons"
import { FcCalendar } from "react-icons/fc"
import { InfoOutlineIcon } from "@chakra-ui/icons"
import { flatMap, get, keys } from "lodash"
import Countdown, { CountdownProps } from "react-countdown"
import { useTranslation } from "react-i18next"

type EventBoxProps = {
  selected: string
  events: Record<string, Record<string, AssignmentProps[]>>
}

export const LogoButton = () => (
  <Box
    as={Link}
    to="/courses"
    fontFamily="monospace"
    fontSize="4xl"
    pt={2}
    _hover={{ color: "purple.500" }}
    children="ACCESS."
  />
)

export const TooltipIconButton = ({
  "aria-label": label,
  icon,
  ...props
}: IconButtonProps) => (
  <Tooltip placement="bottom-end" label={label}>
    <IconButton
      aria-label={label}
      icon={icon}
      {...props}
      fontSize="120%"
      rounded="md"
    />
  </Tooltip>
)

export const Counter = ({ children }: BoxProps) => (
  <Center
    rounded="md"
    bg="purple.100"
    px={2}
    py={0.5}
    color="purple.600"
    fontSize="sm"
    fontWeight={600}
    children={children}
  />
)

export const ActionButton = ({ name, ...props }: ButtonProps) => (
  <Button leftIcon={ActionIcon({ name })} children={name} {...props} />
)

export const ActionTab = ({ name }: TabProps) => (
  <HStack>
    {ActionIcon({ name })}
    <Text>{name}</Text>
  </HStack>
)

export const EventBox = ({ selected, events }: EventBoxProps) => {
  const { t } = useTranslation()
  return (
    <Stack p={2}>
      <HStack>
        <FcCalendar />
        <Text fontWeight={500}>{t("Events Today")}</Text>
      </HStack>
      <Stack h={12} pos="relative" spacing={0}>
        <Text
          pos="absolute"
          top={0}
          left={5}
          fontSize="sm"
          color="blackAlpha.500"
        >
          {t("No events planned")}.
        </Text>
        {flatMap(keys(events), (key) =>
          get(events, [key, selected])?.map((a) => (
            <HStack
              key={a.ordinalNum}
              rounded="lg"
              justify="space-between"
              pb={2}
              bg="base"
              zIndex={1}
            >
              <Flex>
                <Box boxSize={5} className={`cal-${key}`} bgPos={0} />
                <Text>{`Assignment ${a.ordinalNum} is ${key}.`}</Text>
              </Flex>
              <Text color="blackAlpha.600" textAlign="end">
                {get(a, key + "Time")}
              </Text>
            </HStack>
          ))
        )}
      </Stack>
    </Stack>
  )
}

export const RankingInfo = () => (
  <Tooltip
    placement="bottom-end"
    label={
      "Ranking is based on your course score and reflects the results of all " +
      "your submissions. You will receive a rank once you submit a solution to an active task."
    }
  >
    <InfoOutlineIcon />
  </Tooltip>
)

export const UseContextInfo = () => (
  <Tooltip
    placement="bottom-end"
    minW="md"
    label={
      <Text p={1}>
        <b>Task File</b>
        {` = Always visible, included in all evaluations.`}
        <br />
        <b>Solution File</b>
        {` = Released after assignment deadline.`}
        <br />
        <b>Instructions File</b>
        {` = Markdown content, always visible.`}
        <br />
        <b>Grading File</b>
        {` = Included in graded evaluations, not released.`}
      </Text>
    }
  >
    <InfoOutlineIcon />
  </Tooltip>
)

export const Detail = ({ title, as }: ButtonProps) => (
  <HStack>
    <Icon
      boxSize={6}
      p={0.5}
      as={as}
      color="blackAlpha.500"
      bg="purple.75"
      rounded="full"
    />
    <Text fontSize="sm" whiteSpace="nowrap" letterSpacing="tight">
      {title}
    </Text>
  </HStack>
)

export const NextAttemptAt = ({ date, onComplete }: CountdownProps) => (
  <VStack fontWeight={500} spacing={0} py={3} borderBottomWidth={1}>
    <Text pb={1} color="purple.600">
      {"No attempts left!"}
    </Text>
    <Text fontSize="sm" fontWeight={400}>
      {"Try again in"}
    </Text>
    <Countdown date={date} daysInHours onComplete={onComplete} />
  </VStack>
)
