tailwind.config = {
   theme: {
      extend: {
        colors: {
          transparent: 'transparent',
          current: 'currentColor',
          white: '#ffffff',
          primary: {
            100: '#CEF2FF',
            200: '#A7E9FF',
            300: '#6BE0FF',
            400: '#26CAFF',
            500: '#00A3FF',
            600: '#0079FF',
            700: '#005EFF',
            800: '#0050E6',
            900: '#0049B3'
          },
          dark: {
            100: '#0B2E46',
            200: '#284258',
            300: '#42576C',
            400: '#5B6D7F',
            500: '#758493',
            600: '#8F9BA8',
          },

        },
        aspectRatio: {
          '4/3': '4/3',
          '16/9': '16/9'
        },
        fontFamily: {
          sans: ['Montserrat', 'sans-serif'],
        },
        spacing: {
          1: '8px',
          2: '12px',
          3: '16px',
          4: '24px',
          5: '32px',
          6: '48px',
          sm: '8px',
          md: '12px',
          lg: '16px',
          xl: '24px'
        },
        borderRadius: {
          '4xl': '2rem'
        },
        screens: {
          sm: '480px',
      
          md: '768px',
          lg: '976px',
          xl: '1440px',
        },
      }
    }
  }
  