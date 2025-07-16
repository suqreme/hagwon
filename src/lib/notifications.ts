import { showSuccess, showError, showInfo, showWarning } from '@/components/ui/notification'
import { showConfirmationDialog } from '@/components/ui/confirmation-dialog'

// Common notification patterns
export const notifications = {
  // Success notifications
  success: {
    profileUpdated: () => showSuccess('Profile updated successfully!', 'Your profile information has been saved.'),
    lessonCompleted: (score: number) => showSuccess('Lesson completed!', `Great job! You scored ${score}%.`),
    quizPassed: (score: number) => showSuccess('Quiz passed!', `Excellent! You scored ${score}%.`),
    achievementUnlocked: (count: number, xp: number) => showSuccess(
      `Achievement${count > 1 ? 's' : ''} unlocked! 🎉`, 
      `You earned ${xp} XP and unlocked ${count} new achievement${count > 1 ? 's' : ''}!`
    ),
    requestSubmitted: () => showSuccess('Request submitted!', 'We\'ll review your request and get back to you soon.'),
    hardshipApproved: () => showSuccess('Application approved!', 'You now have full access to all features.'),
    dataExported: () => showSuccess('Data exported!', 'Your data has been successfully exported.'),
    settingsSaved: () => showSuccess('Settings saved!', 'Your preferences have been updated.'),
    subscriptionActivated: (plan: string) => showSuccess('Subscription activated!', `Welcome to ${plan}! Enjoy unlimited access.`),
  },

  // Error notifications
  error: {
    profileUpdateFailed: () => showError('Failed to save profile', 'Please try again. If the problem persists, contact support.'),
    lessonLoadFailed: () => showError('Failed to load lesson', 'Please check your internet connection and try again.'),
    quizFailed: (score: number) => showError('Quiz not passed', `You scored ${score}%. You need 70% to pass. Try again!`),
    submissionFailed: () => showError('Submission failed', 'Please check your internet connection and try again.'),
    unauthorized: () => showError('Access denied', 'You don\'t have permission to perform this action.'),
    networkError: () => showError('Connection error', 'Please check your internet connection and try again.'),
    validationError: (field: string) => showError('Validation error', `Please check the ${field} field and try again.`),
    dailyLimitReached: () => showError('Daily limit reached', 'You\'ve reached your daily lesson limit. Upgrade for unlimited access.'),
    dataLoadFailed: () => showError('Failed to load data', 'Please refresh the page and try again.'),
  },

  // Warning notifications
  warning: {
    unsavedChanges: () => showWarning('Unsaved changes', 'You have unsaved changes. Please save before leaving.'),
    lowScore: (score: number) => showWarning('Low score warning', `You scored ${score}%. Consider reviewing the material.`),
    accountLimited: () => showWarning('Account limited', 'Some features are restricted. Consider upgrading your account.'),
    dataNotSynced: () => showWarning('Data not synced', 'Your progress may not be saved. Please check your connection.'),
    betaFeature: () => showWarning('Beta feature', 'This feature is in beta. Please report any issues you encounter.'),
  },

  // Info notifications
  info: {
    welcomeMessage: () => showInfo('Welcome to EduRoot!', 'Start your learning journey with our AI-powered lessons.'),
    featureComingSoon: () => showInfo('Coming soon!', 'This feature is under development and will be available soon.'),
    offlineMode: () => showInfo('Offline mode', 'You\'re currently offline. Some features may be limited.'),
    dataBackup: () => showInfo('Data backed up', 'Your progress is automatically saved to the cloud.'),
    maintenanceMode: () => showInfo('Maintenance scheduled', 'The system will be under maintenance tonight from 2-4 AM.'),
  }
}

// Common confirmation dialogs
export const confirmations = {
  // Danger confirmations
  deleteAccount: () => showConfirmationDialog({
    title: 'Delete Account',
    message: 'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
    confirmText: 'Delete Account',
    cancelText: 'Cancel',
    type: 'danger'
  }),

  deleteProgress: () => showConfirmationDialog({
    title: 'Reset Progress',
    message: 'Are you sure you want to reset all your learning progress? This action cannot be undone.',
    confirmText: 'Reset Progress',
    cancelText: 'Cancel',
    type: 'danger'
  }),

  logout: () => showConfirmationDialog({
    title: 'Sign Out',
    message: 'Are you sure you want to sign out? Any unsaved progress will be lost.',
    confirmText: 'Sign Out',
    cancelText: 'Cancel',
    type: 'info'
  }),

  // Admin confirmations
  approveRequest: (type: string) => showConfirmationDialog({
    title: `Approve ${type}`,
    message: `Are you sure you want to approve this ${type.toLowerCase()}? This will grant the user access to the requested features.`,
    confirmText: 'Approve',
    cancelText: 'Cancel',
    type: 'success'
  }),

  denyRequest: (type: string) => showConfirmationDialog({
    title: `Deny ${type}`,
    message: `Are you sure you want to deny this ${type.toLowerCase()}? The user will be notified of the decision.`,
    confirmText: 'Deny',
    cancelText: 'Cancel',
    type: 'danger'
  }),

  // General confirmations
  saveChanges: () => showConfirmationDialog({
    title: 'Save Changes',
    message: 'Do you want to save your changes before leaving?',
    confirmText: 'Save',
    cancelText: 'Discard',
    type: 'info'
  }),

  upgradeAccount: () => showConfirmationDialog({
    title: 'Upgrade Account',
    message: 'Would you like to upgrade your account to unlock all features?',
    confirmText: 'Upgrade',
    cancelText: 'Maybe Later',
    type: 'success'
  }),

  submitApplication: () => showConfirmationDialog({
    title: 'Submit Application',
    message: 'Are you sure you want to submit your application? You can\'t edit it after submission.',
    confirmText: 'Submit',
    cancelText: 'Review Again',
    type: 'info'
  })
}

// Helper function for async operations with notifications
export const withNotifications = {
  async execute<T>(
    operation: () => Promise<T>,
    options: {
      loadingMessage?: string
      successMessage?: string
      errorMessage?: string
      successCallback?: (result: T) => void
      errorCallback?: (error: Error) => void
    }
  ): Promise<T | null> {
    try {
      const result = await operation()
      
      if (options.successMessage) {
        showSuccess('Success', options.successMessage)
      }
      
      options.successCallback?.(result)
      return result
    } catch (error) {
      console.error('Operation failed:', error)
      
      if (options.errorMessage) {
        showError('Error', options.errorMessage)
      }
      
      options.errorCallback?.(error as Error)
      return null
    }
  },

  async confirm<T>(
    confirmationFn: () => Promise<boolean>,
    operation: () => Promise<T>,
    options: {
      successMessage?: string
      errorMessage?: string
    }
  ): Promise<T | null> {
    const confirmed = await confirmationFn()
    
    if (!confirmed) {
      return null
    }
    
    return this.execute(operation, options)
  }
}

export default notifications