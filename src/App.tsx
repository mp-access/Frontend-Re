import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import '@fontsource/courier-prime/400.css'
import '@fontsource/dm-sans/400.css'
import '@fontsource/dm-sans/500.css'
import '@fontsource/dm-sans/700.css'
import '@fontsource/source-code-pro'
import { ReactKeycloakProvider } from '@react-keycloak/web'
import Keycloak from 'keycloak-js'
import 'primeicons/primeicons.css'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import './assets/PrimeReactTheme.css'
import Navigation from './Navigation'
import theme from './Theme'

const keycloak = new Keycloak({
  url: process.env.REACT_APP_AUTH_SERVER_URL,
  realm: 'access',
  clientId: 'access-frontend'
})

export default function App() {
  return (
      <React.StrictMode>
        <ReactKeycloakProvider authClient={keycloak} initOptions={{ onLoad: 'login-required' }}>
          <ChakraProvider theme={theme}>
            <ColorModeScript />
            <BrowserRouter>
              <Navigation />
            </BrowserRouter>
          </ChakraProvider>
        </ReactKeycloakProvider>
      </React.StrictMode>
  )
}