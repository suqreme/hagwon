'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { themeService } from '@/services/themeService'
import { Palette, Check, X } from 'lucide-react'

interface ThemeSwitcherProps {
  onClose?: () => void
}

export function ThemeSwitcher({ onClose }: ThemeSwitcherProps) {
  const [currentTheme, setCurrentTheme] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const themes = themeService.getThemes()

  useEffect(() => {
    setCurrentTheme(themeService.getCurrentTheme())
    setMounted(true)
  }, [])

  const handleThemeChange = (themeId: string) => {
    themeService.setTheme(themeId)
    setCurrentTheme(themeId)
  }

  const handleClose = () => {
    setIsOpen(false)
    if (onClose) onClose()
  }

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-[9999]">
      <div className="bg-background border rounded-lg theme-shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <Palette className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Choose Theme</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Theme Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {themes.map((theme) => (
              <Card 
                key={theme.id} 
                className={`cursor-pointer transition-all theme-shadow hover:theme-shadow-lg ${
                  currentTheme === theme.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleThemeChange(theme.id)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{theme.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{theme.description}</p>
                    </div>
                    {currentTheme === theme.id && (
                      <Badge className="bg-primary text-primary-foreground">
                        <Check className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Theme Preview */}
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <div className="w-8 h-8 rounded-full bg-primary"></div>
                      <div className="w-8 h-8 rounded-full bg-secondary"></div>
                      <div className="w-8 h-8 rounded-full bg-accent"></div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Preview colors and styling
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Theme changes apply instantly
            </div>
            <Button onClick={handleClose}>
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2"
      >
        <Palette className="w-4 h-4" />
        <span>Themes</span>
      </Button>
      {mounted && isOpen && createPortal(modalContent, document.body)}
    </>
  )
}