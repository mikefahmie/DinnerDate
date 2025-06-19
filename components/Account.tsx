// components/Account.tsx - Updated with centralized theme
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { View, Alert } from 'react-native'
import { Button, Input, Text, Card, Header, Avatar } from '@rneui/themed'
import { Session } from '@supabase/supabase-js'
import { useTheme } from '../hooks/useTheme'
import HeaderLogo from './HeaderLogo'

export default function Account({ session }: { session: Session }) {
  const { theme, styles, colors } = useTheme()
  const [loading, setLoading] = useState(false)
  const [fullName, setFullName] = useState('')
  const [website, setWebsite] = useState('')

  useEffect(() => {
    if (session) getProfile()
  }, [session])

  async function getProfile() {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const user = session.user
      setFullName(user.user_metadata?.full_name || '')
      setWebsite(user.user_metadata?.website || '')
      
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile() {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          website: website,
        }
      })

      if (error) {
        throw error
      }
      
      Alert.alert('Success', 'Profile updated successfully!')
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          onPress: () => supabase.auth.signOut(),
          style: 'destructive'
        },
      ]
    )
  }

  return (
    <View style={styles.container}>
      <Header
        centerComponent={<HeaderLogo height={28} />}
        backgroundColor={colors.primary}
      />

      <View style={styles.content}>
        {/* Profile Header Card */}
        <Card containerStyle={styles.card}>
          <View style={[styles.center, { marginBottom: theme.spacing.xl }]}>
            <Avatar
              rounded
              size="large"
              title={fullName?.charAt(0) || session.user.email?.charAt(0) || 'U'}
              containerStyle={{
                backgroundColor: colors.accent,
                marginBottom: theme.spacing.md
              }}
              titleStyle={{
                color: colors.primary,
                fontSize: theme.typography.fontSize.h1,
                fontWeight: theme.typography.fontWeight.bold
              }}
            />
            <Text style={[styles.h2, { textAlign: 'center' }]}>
              {fullName || 'Set your name'}
            </Text>
            <Text style={[styles.secondaryText, { textAlign: 'center' }]}>
              {session?.user?.email}
            </Text>
          </View>
        </Card>

        {/* Profile Information Card */}
        <Card containerStyle={styles.card}>
          <Text style={[styles.h3, { marginBottom: theme.spacing.lg }]}>
            Profile Information
          </Text>
          
          <Input 
            label="Email" 
            value={session?.user?.email || ''} 
            disabled 
            inputStyle={{ color: colors.textMuted }}
            leftIcon={{ type: 'font-awesome', name: 'envelope', color: colors.textMuted }}
          />
          
          <Input 
            label="Full Name" 
            value={fullName || ''} 
            onChangeText={(text) => setFullName(text)}
            placeholder="Enter your full name"
            leftIcon={{ type: 'font-awesome', name: 'user', color: colors.primary }}
          />
          
          <Input 
            label="Website (Optional)" 
            value={website || ''} 
            onChangeText={(text) => setWebsite(text)}
            placeholder="https://yourwebsite.com"
            leftIcon={{ type: 'font-awesome', name: 'globe', color: colors.primary }}
          />

          <Button
            title={loading ? 'Updating...' : 'Update Profile'}
            onPress={updateProfile}
            disabled={loading}
            loading={loading}
            buttonStyle={[styles.buttonPrimary, { marginTop: theme.spacing.lg }]}
            titleStyle={styles.buttonText}
          />
        </Card>

        {/* Account Information Card */}
        <Card containerStyle={styles.card}>
          <Text style={[styles.h3, { marginBottom: theme.spacing.lg }]}>
            Account Information
          </Text>
          
          <View style={[styles.rowSpaceBetween, styles.marginVerticalSm]}>
            <Text style={styles.bodyText}>User ID:</Text>
            <Text style={[styles.captionText, { flex: 1, textAlign: 'right' }]} numberOfLines={1}>
              {session?.user?.id}
            </Text>
          </View>
          
          <View style={[styles.rowSpaceBetween, styles.marginVerticalSm]}>
            <Text style={styles.bodyText}>Created:</Text>
            <Text style={styles.secondaryText}>
              {new Date(session?.user?.created_at || '').toLocaleDateString()}
            </Text>
          </View>
          
          <View style={[styles.rowSpaceBetween, styles.marginVerticalSm]}>
            <Text style={styles.bodyText}>Last Sign In:</Text>
            <Text style={styles.secondaryText}>
              {new Date(session?.user?.last_sign_in_at || '').toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.divider} />

          <Button 
            title="Sign Out" 
            onPress={handleSignOut}
            buttonStyle={[styles.buttonSecondary, {
              borderColor: colors.error,
              marginTop: theme.spacing.lg
            }]}
            titleStyle={[styles.buttonTextSecondary, { color: colors.error }]}
          />
        </Card>
      </View>
    </View>
  )
}