// App.tsx - Updated with centralized theme
import React, { useState, useEffect } from 'react'
import { View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ThemeProvider } from '@rneui/themed'
import { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import { rneTheme } from './theme/createRNEUITheme'
import { useTheme } from './hooks/useTheme'
import Auth from './components/Auth'
import Account from './components/Account'

function AppContent() {
  const { styles } = useTheme()
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <View style={styles.container}>
      {session && session.user ? (
        <Account key={session.user.id} session={session} />
      ) : (
        <Auth />
      )}
    </View>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider theme={rneTheme}>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  )
}