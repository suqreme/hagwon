'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react'
import { T } from '@/components/ui/auto-translate'

export interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'success' | 'info'
  loading?: boolean
}

let confirmationDialogContext: {
  showDialog: (options: Omit<ConfirmationDialogProps, 'isOpen' | 'onClose'>) => Promise<boolean>
} = {
  showDialog: () => Promise.resolve(false)
}

// Global confirmation function
export const showConfirmationDialog = (
  options: Omit<ConfirmationDialogProps, 'isOpen' | 'onClose' | 'onConfirm'>
): Promise<boolean> => {
  return confirmationDialogContext.showDialog(options)
}

export const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info',
  loading = false
}: ConfirmationDialogProps) => {
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertTriangle className="w-6 h-6 text-red-500" />
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'info':
      default:
        return <Info className="w-6 h-6 text-blue-500" />
    }
  }

  const getConfirmButtonVariant = () => {
    switch (type) {
      case 'danger':
        return 'destructive'
      case 'success':
        return 'default'
      case 'info':
      default:
        return 'default'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in-0"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <Card className="relative w-full max-w-md mx-4 animate-in fade-in-0 zoom-in-95 shadow-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getIcon()}
              <CardTitle className="text-lg">{title}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardDescription className="text-sm leading-relaxed">
            {message}
          </CardDescription>
          
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              <T>{cancelText}</T>
            </Button>
            <Button
              variant={getConfirmButtonVariant()}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  <T>Processing...</T>
                </>
              ) : (
                <T>{confirmText}</T>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const ConfirmationDialogProvider = ({ children }: { children: React.ReactNode }) => {
  const [dialog, setDialog] = useState<ConfirmationDialogProps | null>(null)

  const showDialog = (options: Omit<ConfirmationDialogProps, 'isOpen' | 'onClose' | 'onConfirm'>): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialog({
        ...options,
        isOpen: true,
        onClose: () => {
          setDialog(null)
          resolve(false)
        },
        onConfirm: () => {
          setDialog(null)
          resolve(true)
        }
      })
    })
  }

  confirmationDialogContext = { showDialog }

  return (
    <>
      {children}
      {dialog && <ConfirmationDialog {...dialog} />}
    </>
  )
}