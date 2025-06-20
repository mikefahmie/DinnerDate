// screens/ProfileScreen.tsx
import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native'
import { Button, Input, Avatar, ListItem, Icon } from '@rneui/themed'
import { useTheme } from '../hooks/useTheme'
import { supabase } from '../lib/supabase'
import { Session } from '@supabase/supabase-js'
import ScreenLayout from '../components/layout/ScreenLayout'
import LoadingSpinner from '../components/ui/LoadingSpinner'

interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  location_city?: string
  created_at: string
}

const ProfileScreen: React.FC = () => {
  const { theme } = useTheme()
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [fullName, setFullName] = useState('')
  const [locationCity, setLocationCity] = useState('')

  useEffect(() => {
    getSession()
  }, [])

  useEffect(() => {
    if (session) {
      getProfile()
    }
  }, [session])

  const getSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setSession(session)
    setLoading(false)
  }

  const getProfile = async () => {
    try {
      if (!session?.user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (error) {
        // Profile doesn't exist, create basic profile
        const newProfile: Partial<Profile> = {
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || '',
          location_city: 'Ann Arbor, MI',
        }

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single()

        if (createError) throw createError
        
        setProfile(createdProfile)
        setFullName(createdProfile.full_name || '')
        setLocationCity(createdProfile.location_city || '')
      } else {
        setProfile(data)
        setFullName(data.full_name || '')
        setLocationCity(data.location_city || '')
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      Alert.alert('Error', 'Failed to load profile')
    }
  }

  const updateProfile = async () => {
    try {
      setUpdating(true)

      if (!session?.user) return

      const updates = {
        id: session.user.id,
        full_name: fullName,
        location_city: locationCity,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('profiles')
        .upsert(updates)

      if (error) throw error

      setProfile(prev => prev ? { ...prev, ...updates } : null)
      Alert.alert('Success', 'Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      Alert.alert('Error', 'Failed to update profile')
    } finally {
      setUpdating(false)
    }
  }

  const signOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.auth.signOut()
            if (error) {
              Alert.alert('Error', 'Failed to sign out')
            }
          },
        },
      ]
    )
  }

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <Avatar
        size="large"
        rounded
        source={profile?.avatar_url ? { uri: profile.avatar_url } : undefined}
        icon={{ name: 'user', type: 'font-awesome', color: theme.colors.textMuted }}
        containerStyle={styles.avatar}
      />
      <Text style={styles.emailText}>{profile?.email}</Text>
      <Text style={styles.memberSinceText}>
        Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
      </Text>
    </View>
  )

  const renderProfileForm = () => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Profile Information</Text>
      
      <Input
        label="Full Name"
        value={fullName}
        onChangeText={setFullName}
        placeholder="Enter your full name"
        leftIcon={{ name: 'user', type: 'font-awesome' }}
        containerStyle={styles.inputContainer}
      />

      <Input
        label="Location"
        value={locationCity}
        onChangeText={setLocationCity}
        placeholder="Your city"
        leftIcon={{ name: 'map-marker', type: 'font-awesome' }}
        containerStyle={styles.inputContainer}
      />

      <Button
        title="Update Profile"
        onPress={updateProfile}
        loading={updating}
        buttonStyle={styles.updateButton}
      />
    </View>
  )

  const renderSettingsSection = () => (
    <View style={styles.settingsSection}>
      <Text style={styles.sectionTitle}>Settings</Text>
      
      <ListItem bottomDivider containerStyle={styles.settingsItem}>
        <Icon name="bell" type="font-awesome" color={theme.colors.textMuted} />
        <ListItem.Content>
          <ListItem.Title style={styles.settingsItemText}>
            Notifications
          </ListItem.Title>
          <ListItem.Subtitle style={styles.settingsItemSubtext}>
            Manage your notification preferences
          </ListItem.Subtitle>
        </ListItem.Content>
        <ListItem.Chevron color={theme.colors.textMuted} />
      </ListItem>

      <ListItem bottomDivider containerStyle={styles.settingsItem}>
        <Icon name="shield" type="font-awesome" color={theme.colors.textMuted} />
        <ListItem.Content>
          <ListItem.Title style={styles.settingsItemText}>
            Privacy
          </ListItem.Title>
          <ListItem.Subtitle style={styles.settingsItemSubtext}>
            Data usage and privacy settings
          </ListItem.Subtitle>
        </ListItem.Content>
        <ListItem.Chevron color={theme.colors.textMuted} />
      </ListItem>

      <ListItem bottomDivider containerStyle={styles.settingsItem}>
        <Icon name="question-circle" type="font-awesome" color={theme.colors.textMuted} />
        <ListItem.Content>
          <ListItem.Title style={styles.settingsItemText}>
            Help & Support
          </ListItem.Title>
          <ListItem.Subtitle style={styles.settingsItemSubtext}>
            Get help and contact support
          </ListItem.Subtitle>
        </ListItem.Content>
        <ListItem.Chevron color={theme.colors.textMuted} />
      </ListItem>
    </View>
  )

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    profileHeader: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xl,
      backgroundColor: theme.colors.surface,
      marginBottom: theme.spacing.lg,
    },
    avatar: {
      backgroundColor: theme.colors.surfaceElevated,
      marginBottom: theme.spacing.md,
    },
    emailText: {
      fontSize: theme.typography.fontSize.h2,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    memberSinceText: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.textMuted,
    },
    formSection: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      borderRadius: theme.borderRadius.lg,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.h2,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.lg,
    },
    inputContainer: {
      marginBottom: theme.spacing.md,
    },
    updateButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      marginTop: theme.spacing.md,
    },
    settingsSection: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      marginBottom: theme.spacing.lg,
    },
    settingsItem: {
      backgroundColor: 'transparent',
      paddingVertical: theme.spacing.md,
    },
    settingsItemText: {
      fontSize: theme.typography.fontSize.secondary,
      color: theme.colors.textPrimary,
      fontWeight: '500',
    },
    settingsItemSubtext: {
      fontSize: theme.typography.fontSize.caption,
      color: theme.colors.textMuted,
    },
    signOutButton: {
      backgroundColor: theme.colors.error,
      borderRadius: theme.borderRadius.md,
      marginTop: theme.spacing.lg,
    },
  })

  if (loading) {
    return (
      <ScreenLayout showHeader headerTitle="Profile">
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      </ScreenLayout>
    )
  }

  return (
    <ScreenLayout 
      showHeader 
      headerTitle="Profile"
      scrollable
      padding={false}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {renderProfileHeader()}
        
        <View style={{ paddingHorizontal: theme.spacing.screenPadding }}>
          {renderProfileForm()}
          {renderSettingsSection()}
          
          <Button
            title="Sign Out"
            onPress={signOut}
            buttonStyle={styles.signOutButton}
            icon={{
              name: 'sign-out',
              type: 'font-awesome',
              color: theme.colors.textOnPrimary,
            }}
          />
        </View>
      </ScrollView>
    </ScreenLayout>
  )
}

export default ProfileScreen