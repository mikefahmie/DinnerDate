// screens/AuthScreen.tsx
import React, { useState } from 'react'
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native'
import { Button, Input } from '@rneui/themed'
import { useTheme } from '../hooks/useTheme'
import { supabase } from '../lib/supabase'
import Logo from '../components/Logo'

interface AuthScreenProps {
  onAuthSuccess: () => void
  onGuestMode: () => void
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess, onGuestMode }) => {
  const { theme, styles: commonStyles } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) {
      Alert.alert('Sign In Error', error.message)
    } else {
      onAuthSuccess()
    }
    setLoading(false)
  }

  async function signUpWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) {
      Alert.alert('Sign Up Error', error.message)
    } else {
      Alert.alert(
        'Success!', 
        'Please check your email for the confirmation link.',
        [{ text: 'OK', onPress: () => setIsSignUp(false) }]
      )
    }
    setLoading(false)
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      padding: theme.spacing.screenPadding,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    welcomeText: {
      fontSize: theme.typography.fontSize.h1,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    subtitleText: {
      fontSize: theme.typography.fontSize.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.xxl,
    },
    form: {
      marginBottom: theme.spacing.xl,
    },
    input: {
      marginBottom: theme.spacing.lg,
    },
    primaryButton: {
      marginBottom: theme.spacing.md,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      height: theme.spacing.buttonHeight,
    },
    secondaryButton: {
      marginBottom: theme.spacing.md,
      backgroundColor: 'transparent',
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.borderRadius.md,
      height: theme.spacing.buttonHeight,
    },
    secondaryButtonTitle: {
      color: theme.colors.textPrimary,
    },
    guestButton: {
      backgroundColor: 'transparent',
      height: theme.spacing.buttonHeight,
    },
    guestButtonTitle: {
      color: theme.colors.textMuted,
      fontSize: theme.typography.fontSize.secondary,
    },
    switchMode: {
      backgroundColor: 'transparent',
      marginTop: theme.spacing.lg,
    },
    switchModeTitle: {
      color: theme.colors.primary,
      fontSize: theme.typography.fontSize.secondary,
    },
    socialSection: {
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
    },
    socialSeparator: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: theme.spacing.lg,
    },
    separatorLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.divider,
    },
    separatorText: {
      marginHorizontal: theme.spacing.md,
      color: theme.colors.textMuted,
      fontSize: theme.typography.fontSize.caption,
    },
  })

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Logo size="large" showText={false} style={{ marginBottom: theme.spacing.lg }} />
          <Text style={styles.welcomeText}>
            {isSignUp ? 'Join DinnerDate' : 'Welcome Back'}
          </Text>
          <Text style={styles.subtitleText}>
            Discover your perfect dinner spot in Ann Arbor
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            leftIcon={{ type: 'feather', name: 'mail' }}
            onChangeText={(text) => setEmail(text)}
            value={email}
            placeholder="your@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
            containerStyle={styles.input}
          />
          <Input
            label="Password"
            leftIcon={{ type: 'feather', name: 'lock' }}
            onChangeText={(text) => setPassword(text)}
            value={password}
            secureTextEntry={true}
            placeholder="Your password"
            containerStyle={styles.input}
          />

          <Button
            title={isSignUp ? 'Create Account' : 'Continue with Email'}
            disabled={loading}
            onPress={isSignUp ? signUpWithEmail : signInWithEmail}
            buttonStyle={styles.primaryButton}
            loading={loading}
          />

          <Button
            title={isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            onPress={() => setIsSignUp(!isSignUp)}
            buttonStyle={styles.switchMode}
            titleStyle={styles.switchModeTitle}
          />
        </View>

        <View style={styles.socialSection}>
          <View style={styles.socialSeparator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>or</Text>
            <View style={styles.separatorLine} />
          </View>

          <Button
            title="Continue with Google"
            buttonStyle={styles.secondaryButton}
            titleStyle={styles.secondaryButtonTitle}
            icon={{ type: 'font-awesome', name: 'google', color: theme.colors.textPrimary }}
            onPress={() => {
              // TODO: Implement Google Sign In
              Alert.alert('Coming Soon', 'Google Sign In will be available soon!')
            }}
          />

          <Button
            title="Continue with Apple"
            buttonStyle={styles.secondaryButton}
            titleStyle={styles.secondaryButtonTitle}
            icon={{ type: 'font-awesome', name: 'apple', color: theme.colors.textPrimary }}
            onPress={() => {
              // TODO: Implement Apple Sign In
              Alert.alert('Coming Soon', 'Apple Sign In will be available soon!')
            }}
          />
        </View>

        <Button
          title="Browse as Guest"
          buttonStyle={styles.guestButton}
          titleStyle={styles.guestButtonTitle}
          onPress={onGuestMode}
        />
      </View>
    </ScrollView>
  )
}

export default AuthScreen