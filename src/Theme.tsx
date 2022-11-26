import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  fonts: { heading: '"DM Sans", sans-serif', body: '"DM Sans", sans-serif' },
  semanticTokens: {
    colors: {
      bg: {
        default: 'linear-gradient(180deg,#f8f7f8,#f5f3f7)',
        _dark: 'linear-gradient(180deg,#f8f7f8,#f5f3f7)'
      },
      base: {
        default: 'white',
        _dark: 'blackAlpha.900'
      },
      mid: {
        default: '#d6c9ff73',
        _dark: 'blackAlpha.600'
      }
    }
  },
  layerStyles: {
    card: {
      p: 5, bg: 'base', borderWidth: 1, boxShadow: 'lg', rounded: '3xl', _hover: { boxShadow: 'hover' }
    },
    segment: { p: 6, bg: 'base', rounded: '2xl', boxShadow: 'segment' },
    feature: {
      rounded: '3xl', bg: 'gradients.400', color: 'base', overflow: 'hidden', p: 4, _hover: { boxShadow: 'hover' }
    }
  },
  colors: {
    orange: {
      200: '#ffb460'
    },
    gray: {
      10: '#f1f1f1',
      15: '#f3f3f3',
      100: '#f6f9fd',
      150: '#fcfcfc',
      200: '#e9edf2',
      250: '#d7d9e2',
      450: '#1F1E1E',
      550: '#1F1E1E'
    },
    yellow: {
      400: '#fdd983'
    },
    green: {
      300: '#51e7b0',
      500: '#3dcb99',
      600: '#21ad7c',
      750: '#019b03'
    },
    purple: {
      75: '#ece8ff',
      100: '#ded8fd',
      200: '#d2c7ff',
      500: '#9576ff',
      600: '#8147ff',
      750: '#3b0fd2'
    },
    blue: {
      50: '#edf6ff',
      100: '#d6ecff',
      300: '#69b8ff',
      400: '#369FFF',
      500: '#369FFF',
      600: '#1785e8',
      800: '#003680'
    },
    red: {
      500: '#ff4f22',
      600: '#e62d2d'
    },
    gradients: {
      100: 'linear-gradient(115deg, #eddeff, #d6d7ff)',
      200: 'linear-gradient(145deg, #ffffff, #e7e7ff)',
      400: 'linear-gradient(115deg, #9057ff, #6a33d6)',
      405: 'linear-gradient(140deg, #9057ff, #6a33d6)',
      500: 'linear-gradient(115deg, #923aff, #5e63ff)',
      'purple-light': 'linear-gradient(#fff, #fff) padding-box, linear-gradient(115deg, #923aff, #5e63ff) border-box',
      'purple-gray': 'linear-gradient(#f7f9fd, #f7f9fd) padding-box, linear-gradient(115deg, #923aff, #5e63ff) border-box',
      'purple-dark': 'linear-gradient(#f4f0ff, #f4f0ff) padding-box,linear-gradient(115deg, #923aff, #5e63ff) border-box',
      'green-light': 'linear-gradient(#fff, #fff) padding-box,linear-gradient(120deg, #10dc4e, #41fb7a) border-box',
      'green-dark': 'linear-gradient(120deg, #e2ffeb, #e2ffeb) padding-box,linear-gradient(120deg, #10dc4e, #41fb7a) border-box'
    }
  },
  shadows: {
    xs: '0 0 4px 1px #e3e3e3',
    sm: '0px 3px 3px 1px #858f9d2e',
    md: '0px 3px 12px #858f9d2e',
    lg: '0px 2px 6px rgba(19, 18, 66, 0.07)',
    card: '#d7d9e2 0px 1px 2px 0px',
    hover: '#2a303933 0px 2px 16px 0px',
    callout: '#0000000d 5px 0px 15px, #00000008 4px 0px 6px',
    segment: '#0000000a -2px 0px 6px, #0000000a -2px 0px 15px'
  },
  components: {
    Code: { defaultProps: { colorScheme: 'whiteAlpha' }, variants: { subtle: { bg: 'transparent' } } },
    Tag: { defaultProps: { colorScheme: 'blackAlpha' } },
    Button: {
      defaultProps: { colorScheme: 'purple' },
      variants: {
        'round': {
          rounded: 'full', py: 6, px: 8, boxShadow: 'md', fontWeight: 700, bg: 'purple.500', color: 'white',
          _hover: { bg: 'purple.600', _disabled: { bg: 'purple.500' } }
        },
        'border': {
          rounded: 'full', py: 6, px: 8, boxShadow: 'md', fontWeight: 700, borderWidth: 1, bg: 'white',
          borderColor: 'purple.500', color: 'purple.500', _hover: { bg: 'purple.50' }
        },
        'nav': { color: 'white', bg: 'gradients.500', px: 3, _hover: { filter: 'brightness(1.2)' } },
        'gradient': ({ colorScheme = 'purple' }) => ({
          bg: `gradients.${colorScheme}-light`, color: colorScheme + '.750', borderColor: 'transparent',
          transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms', borderWidth: 3, rounded: 'lg', boxShadow: 'card',
          _hover: { _disabled: { bg: '' }, bg: `gradients.${colorScheme}-dark` }
        })
      }
    }
  },
  styles: {
    global: {
      'html, body, #root': { h: 'full' },
      '::-webkit-scrollbar': { h: 3, w: 3, bg: 'transparent', ':horizontal': { bg: 'transparent' } },
      '::-webkit-scrollbar-corner': { bg: 'transparent' },
      '::-webkit-scrollbar-thumb': { borderRadius: 6, bg: 'transparent' },
      ':hover::-webkit-scrollbar-thumb': { bg: 'mid' },
      'ul, li': { listStyle: 'none', padding: 0, margin: 0 }
    }
  }
})

export default theme