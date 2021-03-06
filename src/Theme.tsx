import { extendTheme, ThemingProps } from '@chakra-ui/react'

const theme = extendTheme({
  fonts: { heading: '"DM Sans", sans-serif', body: '"DM Sans", sans-serif' },
  colors: {
    orange: {
      200: '#ffb460'
    },
    gray: {
      20: '#f7f9fd',
      70: '#f8f9fa',
      100: '#f6f9fd',
      200: '#e9edf2'
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
      600: '#6816ed',
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
      'green-dark': 'linear-gradient(120deg, #e2ffeb, #e2ffeb) padding-box,linear-gradient(120deg, #10dc4e, #41fb7a) border-box',

    }
  },
  shadows: {
    sm: '0px 3px 3px 1px #858f9d2e',
    md: '0px 3px 12px #858f9d2e',
    lg: '0px 2px 6px rgba(19, 18, 66, 0.07)',
    focus: '0px 2px 6px rgba(19, 18, 66, 0.07), 0px 0px 0px 1px #dcdcff',
    outline: '0 0 0 3px #6997ff36',
    hover: '0 30px 30px -25px #030407ba'
  },
  components: {
    Input: {
      defaultProps: { focusBorderColor: 'blue.100' },
      variants: {
        outline: {
          field: { rounded: '3xl', boxShadow: 'lg', _focus: { boxShadow: 'focus' } },
          addon: { rounded: '3xl' }
        },
        flushed: {
          field: { h: 8 }
        }
      }
    },
    Select: {
      defaultProps: { focusBorderColor: 'blue.100' },
      variants: {
        outline: {
          field: {
            rounded: '3xl', h: 12, boxShadow: 'lg', fontFamily: 'sans-serif', p: 0, pl: 4, borderWidth: 1,
            _focus: { boxShadow: 'focus', p: 0, pl: 4, borderWidth: 1 } }
        },
        flushed: {
          field: { h: 8 }
        }
      }
    },
    FormLabel: {
      baseStyle: { fontWeight: 500, mb: 1, ml: 3, textTransform: 'capitalize' }
    },
    FormError: {
      baseStyle: {
        text: { position: 'absolute', right: 0, bottom: -5 }
      }
    },
    Button: {
      variants: {
        round: {
          rounded: 'full', py: 7, px: 10, boxShadow: 'md', fontWeight: 700,
          bg: 'purple.500', color: 'white', _hover: { bg: 'purple.600', _disabled: { bg: 'purple.500' } }
        },
        'round-outline': {
          rounded: 'full', py: 7, px: 10, boxShadow: 'md', fontWeight: 700, borderWidth: 1,
          bg: 'white', borderColor: 'purple.500', color: 'purple.500', _hover: { bg: 'purple.50' }
        },
        dashed: {
          minH: '20vh', h: 'full', rounded: '2xl', border: '2px dashed', borderColor: 'gray.400',
          flexDir: 'column', gap: 3, color: 'purple.600', _hover: { bg: 'purple.50' }
        },
        nav: {
          color: 'gray.500', _hover: { bg: 'purple.50' }, _active: { color: 'white', bg: 'gradients.500' }, px: 3,
          'svg': { boxSize: '1.3rem', p: 0 },
        },
        hover: (props: ThemingProps) => ({
          p: 5, minH: '20vh', h: 'fit-content', maxW: 'xs', rounded: '2xl', color: 'white', position: 'relative',
          overflow: 'hidden', bg: `${props.colorScheme}.500`, boxShadow: 'hover',
          _hover: { transform: 'translateY(-0.5rem)' }, _focus: { bg: `${props.colorScheme}.600`, boxShadow: 'hover' }
        }),
        gradient: (props: ThemingProps) => ({
          bg: `gradients.${props.colorScheme}-light`, borderWidth: 3, borderColor: 'transparent',
          color: props.colorScheme + '.750', _hover: { _disabled: { bg: '' }, bg: `gradients.${props.colorScheme}-dark` }
        }),
        card: {
          rounded: 'xl', h: 'fit-content', borderWidth: 2, p: 3, boxShadow: 'lg', w: 'full', flexDir: 'column',
          alignItems: 'start', textAlign: 'start', whiteSpace: 'wrap', bg: 'white', borderColor: 'gray.200',
          cursor: 'pointer', _hover: { bg: 'gray.50' }, _checked: { bg: 'gray.50', borderColor: 'blue.500' }
        },
      }
    },
    Tabs: {
      variants: {
        enclosed: {
          tab: { py: 1, gap: 2, _selected: { bg: 'white', }, _hover: { color: 'blue.500' } }
        }
      }
    }
  },
  styles: {
    global: {
      '.hidden-panel': { w: '3rem', 'a': { borderColor: '#00000000 !important', cursor: 'auto' } }
    }
  }
})

export default theme