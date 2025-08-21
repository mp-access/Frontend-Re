import { createContext, useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useExamples } from "../components/Hooks"

type ExampleStatusContextType =
  | {
      hasInteractive: false
    }
  | {
      hasInteractive: true
      exampleSlug: string
    }

type ExampleStatusContextValue = {
  status: ExampleStatusContextType
  setInteractive: (slug: string) => void
  clearInteractive: () => void
}

export const ExampleStatusContext = createContext<ExampleStatusContextValue>({
  status: { hasInteractive: false },
  setInteractive: () => {},
  clearInteractive: () => {},
})

export const ExampleStatusProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { courseSlug } = useParams()
  const { data: examples } = useExamples({ enabled: !!courseSlug })
  const [status, setStatus] = useState<ExampleStatusContextType>({
    hasInteractive: false,
  })

  useEffect(() => {
    if (!courseSlug || !examples) return

    const interactiveExample = examples.find(
      (example) => example.status === "Interactive",
    )

    if (interactiveExample) {
      setStatus({ hasInteractive: true, exampleSlug: interactiveExample.slug })
    } else {
      setStatus({ hasInteractive: false })
    }
  }, [courseSlug, examples])

  const setInteractive = (slug: string) =>
    setStatus({ hasInteractive: true, exampleSlug: slug })

  const clearInteractive = () => setStatus({ hasInteractive: false })

  return (
    <ExampleStatusContext.Provider
      value={{ status, setInteractive, clearInteractive }}
    >
      {children}
    </ExampleStatusContext.Provider>
  )
}
