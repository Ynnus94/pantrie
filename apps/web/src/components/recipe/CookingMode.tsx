import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Dialog, DialogContent } from '../ui/dialog'
import { GlassCard } from '../ui/GlassCard'
import { 
  X, ChevronLeft, ChevronRight, Timer, Check, 
  Pause, Play, RotateCcw, Volume2, VolumeX 
} from 'lucide-react'
import { toast } from 'sonner'

interface CookingModeProps {
  recipe: {
    title: string
    instructions: string[]
    ingredients?: string[]
  }
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export function CookingMode({ recipe, isOpen, onClose, onComplete }: CookingModeProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null)
  const [timerRunning, setTimerRunning] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  
  const steps = recipe.instructions || []
  const totalSteps = steps.length

  // Keep screen awake while cooking
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null
    
    const requestWakeLock = async () => {
      if (isOpen && 'wakeLock' in navigator) {
        try {
          wakeLock = await navigator.wakeLock.request('screen')
          console.log('🔆 Screen wake lock activated')
        } catch (err) {
          console.log('Wake lock not available:', err)
        }
      }
    }
    
    requestWakeLock()
    
    return () => {
      if (wakeLock) {
        wakeLock.release()
        console.log('🔆 Screen wake lock released')
      }
    }
  }, [isOpen])

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (timerRunning && timerSeconds !== null && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev === null || prev <= 1) {
            setTimerRunning(false)
            if (soundEnabled) {
              playTimerSound()
            }
            toast.success('Timer complete! ⏰', { duration: 5000 })
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerRunning, timerSeconds, soundEnabled])

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0)
      setCompletedSteps(new Set())
      setTimerSeconds(null)
      setTimerRunning(false)
    }
  }, [isOpen])

  const playTimerSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      gainNode.gain.value = 0.3
      
      oscillator.start()
      
      // Beep pattern: 3 short beeps
      setTimeout(() => oscillator.stop(), 200)
    } catch (e) {
      console.log('Could not play sound:', e)
    }
  }

  const detectTime = (stepText: string): { seconds: number; display: string } | null => {
    // Match patterns like "5 minutes", "30 seconds", "2-3 minutes", "1 hour"
    const patterns = [
      { regex: /(\d+)\s*-\s*(\d+)\s*(?:minute|min)/i, type: 'range-min' },
      { regex: /(\d+)\s*(?:minute|min)/i, type: 'min' },
      { regex: /(\d+)\s*(?:second|sec)/i, type: 'sec' },
      { regex: /(\d+)\s*(?:hour|hr)/i, type: 'hour' },
    ]
    
    for (const { regex, type } of patterns) {
      const match = stepText.match(regex)
      if (match) {
        let seconds = 0
        let display = ''
        
        if (type === 'range-min') {
          // Use the lower value for range
          seconds = parseInt(match[1]) * 60
          display = `${match[1]}-${match[2]} min`
        } else if (type === 'min') {
          seconds = parseInt(match[1]) * 60
          display = `${match[1]} min`
        } else if (type === 'sec') {
          seconds = parseInt(match[1])
          display = `${match[1]} sec`
        } else if (type === 'hour') {
          seconds = parseInt(match[1]) * 3600
          display = `${match[1]} hr`
        }
        
        return { seconds, display }
      }
    }
    
    return null
  }

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const startTimer = (seconds: number) => {
    setTimerSeconds(seconds)
    setTimerRunning(true)
    toast.info(`Timer started for ${formatTime(seconds)}`)
  }

  const toggleTimer = () => {
    setTimerRunning(!timerRunning)
  }

  const resetTimer = () => {
    const detected = detectTime(steps[currentStep])
    if (detected) {
      setTimerSeconds(detected.seconds)
      setTimerRunning(false)
    }
  }

  const goToStep = (step: number) => {
    if (step >= 0 && step < totalSteps) {
      // Mark current step as completed when moving forward
      if (step > currentStep) {
        setCompletedSteps(prev => new Set([...prev, currentStep]))
      }
      setCurrentStep(step)
      // Reset timer when changing steps
      setTimerSeconds(null)
      setTimerRunning(false)
    }
  }

  const handleComplete = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]))
    onComplete()
    onClose()
    toast.success('Recipe marked as cooked! 🎉')
  }

  const detectedTime = steps[currentStep] ? detectTime(steps[currentStep]) : null

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[95vw] h-[95vh] max-h-[95vh] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 p-4 md:p-6 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-glass)]">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg md:text-xl font-bold text-primary truncate">{recipe.title}</h2>
            <p className="text-sm text-muted">
              Step {currentStep + 1} of {totalSteps}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="glass-button p-2 rounded-lg"
              title={soundEnabled ? 'Mute timer sound' : 'Enable timer sound'}
            >
              {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </button>
            <button onClick={onClose} className="glass-button p-2 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Main Step Display - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-3xl mx-auto space-y-6 md:space-y-8">
            {/* Step Number Badge */}
            <div className="flex justify-center">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center text-2xl md:text-3xl font-bold shadow-lg">
                {currentStep + 1}
              </div>
            </div>
            
            {/* Current Step Text - LARGE */}
            <p className="text-xl md:text-2xl lg:text-3xl leading-relaxed text-center font-medium text-primary px-4">
              {steps[currentStep]}
            </p>
            
            {/* Timer Section */}
            {(detectedTime || timerSeconds !== null) && (
              <GlassCard hover={false} className="max-w-md mx-auto">
                <div className="text-center space-y-4">
                  {timerSeconds !== null ? (
                    <>
                      {/* Active Timer */}
                      <div className={`text-5xl md:text-6xl font-mono font-bold ${
                        timerSeconds <= 10 && timerSeconds > 0 
                          ? 'text-red-500 animate-pulse' 
                          : timerSeconds === 0 
                            ? 'text-green-500' 
                            : 'text-primary'
                      }`}>
                        {formatTime(timerSeconds)}
                      </div>
                      
                      {/* Timer Complete State */}
                      {timerSeconds === 0 ? (
                        <div className="flex justify-center gap-3">
                          <Button
                            onClick={resetTimer}
                            variant="glass"
                            size="lg"
                            className="gap-2"
                          >
                            <RotateCcw className="h-5 w-5" />
                            Restart Timer
                          </Button>
                        </div>
                      ) : (
                        /* Timer Running/Paused State */
                        <div className="flex justify-center gap-3">
                          <Button
                            onClick={toggleTimer}
                            variant="glass"
                            size="lg"
                            className="gap-2"
                          >
                            {timerRunning ? (
                              <>
                                <Pause className="h-5 w-5" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="h-5 w-5" />
                                Resume
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={resetTimer}
                            variant="glass"
                            size="lg"
                            title="Reset timer"
                          >
                            <RotateCcw className="h-5 w-5" />
                          </Button>
                        </div>
                      )}
                    </>
                  ) : detectedTime ? (
                    <>
                      {/* Start Timer Button */}
                      <Button 
                        onClick={() => startTimer(detectedTime.seconds)}
                        size="lg"
                        className="gap-2"
                      >
                        <Timer className="h-5 w-5" />
                        Start {detectedTime.display} Timer
                      </Button>
                    </>
                  ) : null}
                </div>
              </GlassCard>
            )}
          </div>
        </div>
        
        {/* Progress Bar - Clickable */}
        <div className="flex-shrink-0 px-4 md:px-8 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-glass)]">
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToStep(index)}
                className={`h-3 flex-1 rounded-full transition-all hover:opacity-80 ${
                  completedSteps.has(index)
                    ? 'bg-green-500'
                    : index === currentStep
                      ? 'bg-[var(--accent-primary)]'
                      : 'bg-[var(--border-subtle)] hover:bg-[var(--accent-primary)]/50'
                }`}
                title={`Go to step ${index + 1}`}
              />
            ))}
          </div>
          <p className="text-xs text-muted text-center mt-2">
            Click any segment to jump to that step
          </p>
        </div>
        
        {/* Navigation - Fixed Bottom */}
        <div className="flex-shrink-0 p-4 md:p-6 border-t border-[var(--border-subtle)] bg-[var(--bg-glass)] flex gap-3">
          <Button
            onClick={() => goToStep(currentStep - 1)}
            disabled={currentStep === 0}
            variant="glass"
            size="lg"
            className="flex-1"
          >
            <ChevronLeft className="h-5 w-5 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Back</span>
          </Button>
          
          {currentStep < totalSteps - 1 ? (
            <Button
              onClick={() => goToStep(currentStep + 1)}
              size="lg"
              className="flex-1"
            >
              <span className="hidden sm:inline">Next Step</span>
              <span className="sm:hidden">Next</span>
              <ChevronRight className="h-5 w-5 ml-1 md:ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              size="lg"
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Check className="h-5 w-5 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Mark as Cooked</span>
              <span className="sm:hidden">Done!</span>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

