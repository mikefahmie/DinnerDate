// components/Auth.tsx - Complete file with HeaderLogo
import React, { useState } from 'react'
import {
  Alert,
  View,
  AppState,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import {
  Button,
  Input,
  Text,
  Card,
  Header,
} from '@rneui/themed'
import { useForm, Controller, SubmitHandler } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { supabase } from '../lib/supabase'
import { useTheme } from '../hooks/useTheme'
import Logo from './Logo'
import HeaderLogo from './HeaderLogo'

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

type AuthMode = 'login' | 'signup'

// Define TypeScript interfaces
interface LoginFormData {
  email: string
  password: string
}

interface SignupFormData {
  email: string
  password: string
  confirmPassword: string
}

// Validation schemas
const loginSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .required('Password is required'),
}).required()

const signupSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
})

export default function Auth() {
  const { theme, styles, colors } = useTheme()
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [loading, setLoading] = useState(false)

  // Login form
  const {
    control: loginControl,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLoginForm,
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // Signup form
  const {
    control: signupControl,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
    reset: resetSignupForm,
  } = useForm<SignupFormData>({
    resolver: yupResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange', // This helps with real-time validation
  })

  // Reset forms when switching modes
  const switchToSignup = () => {
    resetSignupForm() // Clear signup form
    setAuthMode('signup')
  }

  const switchToLogin = () => {
    resetLoginForm() // Clear login form
    setAuthMode('login')
  }

  const signInWithEmail: SubmitHandler<LoginFormData> = async (data) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        Alert.alert('Login Error', error.message)
      }
      // Success is handled by the auth state change listener in App.tsx
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred')
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  const signUpWithEmail: SubmitHandler<SignupFormData> = async (data) => {
    try {
      setLoading(true)

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      })

      if (error) {
        Alert.alert('Signup Error', error.message)
        return
      }

      if (!authData.session) {
        Alert.alert(
          'Check Your Email!', 
          'Please check your inbox for email verification, then you can sign in.',
          [{ 
            text: 'OK', 
            onPress: () => {
              resetSignupForm() // Clear the form
              switchToLogin() // Use the switch function
            }
          }]
        )
      } else {
        // User is immediately signed in (email confirmation disabled)
        Alert.alert('Welcome!', 'Your account has been created successfully.')
        resetSignupForm() // Clear the form
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred')
      console.error('Signup error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    Alert.prompt(
      'Reset Password',
      'Enter your email address to receive a password reset link:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Reset Link',
          onPress: async (email) => {
            if (email) {
              setLoading(true)
              const { error } = await supabase.auth.resetPasswordForEmail(email)
              setLoading(false)
              
              if (error) {
                Alert.alert('Error', error.message)
              } else {
                Alert.alert('Check Your Email', 'Password reset link has been sent!')
              }
            }
          }
        }
      ],
      'plain-text'
    )
  }

  if (authMode === 'login') {
    return (
      <KeyboardAvoidingView 
        key="login-form" // Force remount when switching modes
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Header
          centerComponent={<HeaderLogo height={28} />}
          backgroundColor={colors.primary}
        />
        
        <View style={styles.content}>
          <Card containerStyle={styles.card}>
            {/* Logo */}
            <Logo 
              size="large" 
              showText={false} 
              style={{ marginBottom: theme.spacing.xl }} 
            />

            <Text style={[styles.h1, { textAlign: 'center', marginBottom: theme.spacing.sm }]}>
              Welcome Back
            </Text>
            <Text style={[styles.secondaryText, { 
              textAlign: 'center', 
              marginBottom: theme.spacing.xxl 
            }]}>
              Find your perfect dinner spot together
            </Text>

            <Controller
              control={loginControl}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email"
                  placeholder="you@example.com"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  errorMessage={loginErrors.email?.message}
                  leftIcon={{ type: 'font-awesome', name: 'envelope', color: colors.primary }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              )}
            />

            <Controller
              control={loginControl}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Password"
                  placeholder="Your password"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  errorMessage={loginErrors.password?.message}
                  leftIcon={{ type: 'font-awesome', name: 'lock', color: colors.primary }}
                  secureTextEntry
                  autoComplete="current-password"
                />
              )}
            />

            <Button
              title={loading ? 'Signing In...' : 'Sign In'}
              onPress={handleLoginSubmit(signInWithEmail)}
              loading={loading}
              disabled={loading}
              buttonStyle={styles.buttonPrimary}
              titleStyle={styles.buttonText}
            />

            <Button
              title="Forgot Password?"
              onPress={handleForgotPassword}
              type="clear"
              titleStyle={[styles.secondaryText, { 
                color: colors.primary, 
                marginTop: theme.spacing.md 
              }]}
            />

            <View style={[styles.divider, { marginVertical: theme.spacing.xl }]} />

            <Button
              title="Don't have an account? Sign Up"
              onPress={switchToSignup}
              buttonStyle={styles.buttonSecondary}
              titleStyle={styles.buttonTextSecondary}
            />
          </Card>
        </View>
      </KeyboardAvoidingView>
    )
  }

  // Signup Mode
  return (
    <KeyboardAvoidingView 
      key="signup-form" // Force remount when switching modes
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header
        centerComponent={<HeaderLogo height={28} />}
        backgroundColor={colors.primary}
      />
      
      <View style={styles.content}>
        <Card containerStyle={styles.card}>
          {/* Logo */}
          <Logo 
            size="large" 
            showText={false} 
            style={{ marginBottom: theme.spacing.xl }} 
          />

          <Text style={[styles.h1, { textAlign: 'center', marginBottom: theme.spacing.sm }]}>
            Create Your Account
          </Text>
          <Text style={[styles.secondaryText, { 
            textAlign: 'center', 
            marginBottom: theme.spacing.xxl 
          }]}>
            Find the perfect restaurant for your next date night
          </Text>

          {/* Email Input */}
          <Controller
            control={signupControl}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email"
                placeholder="you@example.com"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                errorMessage={signupErrors.email?.message}
                leftIcon={{ type: 'font-awesome', name: 'envelope', color: colors.primary }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                textContentType="emailAddress"
              />
            )}
          />

          {/* Password Input */}
          <Controller
            control={signupControl}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Password"
                placeholder="At least 6 characters"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                errorMessage={signupErrors.password?.message}
                leftIcon={{ type: 'font-awesome', name: 'lock', color: colors.primary }}
                secureTextEntry
                autoComplete="new-password"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="newPassword"
              />
            )}
          />

          {/* Confirm Password Input */}
          <Controller
            control={signupControl}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                errorMessage={signupErrors.confirmPassword?.message}
                leftIcon={{ type: 'font-awesome', name: 'lock', color: colors.primary }}
                secureTextEntry
                autoComplete="new-password"
              />
            )}
          />

          {/* Submit Button */}
          <Button
            title={loading ? 'Creating Account...' : 'Create Account'}
            onPress={handleSignupSubmit(signUpWithEmail)}
            loading={loading}
            disabled={loading}
            buttonStyle={styles.buttonPrimary}
            titleStyle={styles.buttonText}
          />

          {/* Switch to Login */}
          <Button
            title="Already have an account? Sign In"
            onPress={switchToLogin}
            type="clear"
            titleStyle={[styles.secondaryText, { 
              color: colors.primary, 
              marginTop: theme.spacing.lg 
            }]}
          />
        </Card>
      </View>
    </KeyboardAvoidingView>
  )
}