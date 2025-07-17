'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface NotificationProps {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message?: string
  duration?: number
  onClose?: () => void
}

interface NotificationContextType {
  notifications: NotificationProps[]
  addNotification: (notification: Omit<NotificationProps, 'id'>) => void
  removeNotification: (id: string) => void
}

let notificationContext: NotificationContextType = {
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {}
}

// Global notification functions
export const showNotification = (notification: Omit<NotificationProps, 'id'>) => {
  const id = Date.now().toString()
  notificationContext.addNotification({ ...notification, id })
  return id
}

export const showSuccess = (title: string, message?: string) => {
  return showNotification({ type: 'success', title, message })
}

export const showError = (title: string, message?: string) => {
  return showNotification({ type: 'error', title, message })
}

export const showInfo = (title: string, message?: string) => {
  return showNotification({ type: 'info', title, message })
}

export const showWarning = (title: string, message?: string) => {
  return showNotification({ type: 'warning', title, message })
}

// Hook for components that need notification functions
export const useNotification = () => {
  return {
    showNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning
  }
}

const NotificationItem = ({ notification, onClose }: { 
  notification: NotificationProps 
  onClose: () => void 
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Trigger enter animation
    setTimeout(() => setIsVisible(true), 10)
    
    // Auto-close after duration
    if (notification.duration !== 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, notification.duration || 5000)
      
      return () => clearTimeout(timer)
    }
  }, [notification.duration])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onClose()
      notification.onClose?.()
    }, 300)
  }

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
    }
  }

  return (
    <div
      className={cn(
        "min-w-80 max-w-md w-full shadow-lg rounded-lg pointer-events-auto border transition-all duration-300 ease-in-out transform",
        getBackgroundColor(),
        isVisible && !isLeaving ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      )}
    >
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground leading-relaxed">
              {notification.title}
            </p>
            {notification.message && (
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed break-words">
                {notification.message}
              </p>
            )}
          </div>
          <div className="flex-shrink-0">
            <button
              className="inline-flex text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring rounded-md p-1 transition-colors"
              onClick={handleClose}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const NotificationContainer = () => {
  const [notifications, setNotifications] = useState<NotificationProps[]>([])

  useEffect(() => {
    notificationContext = {
      notifications,
      addNotification: (notification) => {
        const id = Date.now().toString()
        setNotifications(prev => [...prev, { ...notification, id }])
      },
      removeNotification: (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id))
      }
    }
  }, [notifications])

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col space-y-3 pointer-events-none max-w-md w-full sm:w-auto">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  )
}