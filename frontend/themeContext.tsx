import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Provider as PaperProvider, DefaultTheme, MD3DarkTheme } from 'react-native-paper';

interface ThemeContextData {
  temaEscuro: boolean;
  toggleTema: () => void;
  paperTheme: typeof DefaultTheme; // usa typeof DefaultTheme para tipar
}

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [temaEscuro, setTemaEscuro] = useState(false);

  const toggleTema = () => setTemaEscuro(old => !old);

  const paperTheme = temaEscuro ? MD3DarkTheme : DefaultTheme;

  return (
    <ThemeContext.Provider value={{ temaEscuro, toggleTema, paperTheme }}>
      <PaperProvider theme={paperTheme}>
        {children}
      </PaperProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);

export default ThemeProvider;
