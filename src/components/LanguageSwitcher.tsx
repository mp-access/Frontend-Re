import React from "react"
import { useTranslation } from "react-i18next"
import { Select } from "@chakra-ui/react"

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation()

  const changeLanguage = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = event.target.value
    i18n.changeLanguage(newLanguage, (err) => {
      if (err) return console.log("something went wrong loading", err)
      localStorage.setItem("language", newLanguage)
    })
  }

  return (
    <Select onChange={changeLanguage} defaultValue={i18n.language} width="auto">
      <option value="en">English</option>
      <option value="de">Deutsch</option>
    </Select>
  )
}
