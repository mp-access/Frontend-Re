import { useToast } from "@chakra-ui/react"
import { useKeycloak } from "@react-keycloak/web"
import { EventSource } from "extended-eventsource"
import { createContext, useContext, useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { useHeartbeat } from "../components/Hooks"

type EventSourceContextType = {
  eventSource: EventSource | null
}

const EventSourceContext = createContext<EventSourceContextType>({
  eventSource: null,
})

export const EventSourceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const eventSourceRef = useRef<EventSource | null>(null)
  const { keycloak } = useKeycloak()
  const { courseSlug } = useParams()
  const token = keycloak.token
  const [, setTick] = useState(0)
  const [emitterId, setEmitterId] = useState<string | null>(null)
  const { sendHeartbeat } = useHeartbeat()
  const toast = useToast()

  useEffect(() => {
    if (!token || !courseSlug || eventSourceRef.current !== null) return

    const eventSource = new EventSource(
      `/api/courses/${courseSlug}/subscribe`,
      {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
        retry: 3000,
      },
    )
    eventSource.addEventListener("emitter-id", (event: MessageEvent) => {
      setEmitterId(event.data)
    })

    eventSourceRef.current = eventSource
    setTick((t) => t + 1) // force re-render so context provider updates value

    return () => {
      eventSource.close()
    }
  }, [courseSlug, keycloak.token, token])

  useEffect(() => {
    if (!emitterId || !courseSlug) return

    const interval = setInterval(
      () => {
        try {
          sendHeartbeat(emitterId)
        } catch (e) {
          toast({
            title: "Heartbeat failed",
            status: "error",
          })
        }
      },
      60000, // 1 minute heartbeat
    )

    return () => clearInterval(interval)
  }, [emitterId, courseSlug, keycloak.token, sendHeartbeat, toast])

  return (
    <EventSourceContext.Provider
      value={{ eventSource: eventSourceRef.current }}
    >
      {children}
    </EventSourceContext.Provider>
  )
}

export const useEventSource = () => useContext(EventSourceContext)
