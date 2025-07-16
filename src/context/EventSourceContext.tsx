import { useKeycloak } from "@react-keycloak/web"
import { createContext, useContext, useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { EventSource } from "extended-eventsource"

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

  useEffect(() => {
    if (!token || !courseSlug) return

    const eventSource = new EventSource(
      `/api/courses/${courseSlug}/subscribe`,
      {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
        retry: 3000,
      },
    )

    eventSourceRef.current = eventSource
    setTick((t) => t + 1) // force re-render so context provider updates value

    return () => {
      eventSource.close()
    }
  }, [courseSlug, keycloak.token, token])

  return (
    <EventSourceContext.Provider
      value={{ eventSource: eventSourceRef.current }}
    >
      {children}
    </EventSourceContext.Provider>
  )
}

export const useEventSource = () => useContext(EventSourceContext)
