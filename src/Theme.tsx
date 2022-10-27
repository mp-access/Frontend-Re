import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  fonts: { heading: '"DM Sans", sans-serif', body: '"DM Sans", sans-serif' },
  colors: {
    orange: {
      200: '#ffb460'
    },
    gray: {
      15: '#f3f3f3',
      20: '#f7f9fd',
      70: '#f8f9fa',
      100: '#f6f9fd',
      200: '#e9edf2',
      250: '#d7d9e2',
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
    lavender: {
      500: '#8940ff',
      600: '#6816ed'
    },
    purple: {
      100: '#ded8fd',
      200: '#d2c7ff',
      500: '#9576ff',
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
      500: 'linear-gradient(115deg, #923aff, #5e63ff)',
      'purple-light': 'linear-gradient(#fff, #fff) padding-box, linear-gradient(115deg, #923aff, #5e63ff) border-box',
      'purple-gray': 'linear-gradient(#f7f9fd, #f7f9fd) padding-box, linear-gradient(115deg, #923aff, #5e63ff) border-box',
      'purple-dark': 'linear-gradient(#f4f0ff, #f4f0ff) padding-box,linear-gradient(115deg, #923aff, #5e63ff) border-box',
      'green-light': 'linear-gradient(120deg, #f8fffa, #f8fffa) padding-box,linear-gradient(120deg, #10dc4e, #41fb7a) border-box',
      'green-dark': 'linear-gradient(120deg, #e2ffeb, #e2ffeb) padding-box,linear-gradient(120deg, #10dc4e, #41fb7a) border-box'
    }
  },
  shadows: {
    xs: '0 0 4px 1px #e3e3e3',
    sm: '0px 3px 3px 1px #858f9d2e',
    md: '0px 3px 12px #858f9d2e',
    lg: '0px 2px 6px rgba(19, 18, 66, 0.07)',
    focus: '0px 2px 6px rgba(19, 18, 66, 0.07), 0px 0px 0px 1px #dcdcff',
    outline: '0 0 0 3px #6997ff36',
    card: 'rgb(215 217 226) 0px 1px 2px 0px',
    hover: 'rgb(42 48 57 / 20%) 0px 2px 16px 0px',
    line: '0px -1px 2px 0px #e6e6e6 inset'
  },
  components: {
    Button: {
      defaultProps: { colorScheme: 'purple' },
      variants: {
        'round': {
          rounded: 'full', py: 6, px: 8, boxShadow: 'md', fontWeight: 700, bg: 'purple.500', color: 'white',
          _hover: { bg: 'purple.600', _disabled: { bg: 'purple.500' } }
        },
        'roundBorder': {
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
      'ul, li': { listStyle: 'none', padding: 0, margin: 0 }
    }
  }
})

export default theme