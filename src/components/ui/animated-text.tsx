'use client'

import { ReactNode } from 'react'
import { NoSSR } from './no-ssr'

interface AnimatedTextProps {
  children: ReactNode
  className?: string
  delay?: number
}

function AnimatedTextContent({ children, className }: { children: ReactNode, className?: string }) {
  return (
    <div className={className ? `${className} animate-fade-in` : 'animate-fade-in'}>
      {children}
    </div>
  )
}

export function AnimatedText({ children, className, delay = 0 }: AnimatedTextProps) {
  const fallback = <div className={className}>{children}</div>

  return (
    <NoSSR fallback={fallback}>
      <AnimatedTextContent className={className}>
        {children}
      </AnimatedTextContent>
    </NoSSR>
  )
}

interface AnimatedButtonProps {
  children: ReactNode
  className?: string
  delay?: number
  href?: string
  onClick?: () => void
}

function AnimatedButtonContent({ children, className, href, onClick }: { 
  children: ReactNode
  className?: string 
  href?: string
  onClick?: () => void
}) {
  const content = href ? (
    <a href={href} className="block w-full h-full">
      {children}
    </a>
  ) : (
    <button onClick={onClick} className="w-full h-full">
      {children}
    </button>
  )

  return (
    <div className={className ? `${className} animate-fade-in hover:scale-105 transition-transform duration-300` : 'animate-fade-in hover:scale-105 transition-transform duration-300'}>
      {content}
    </div>
  )
}

export function AnimatedButton({ children, className, delay = 0, href, onClick }: AnimatedButtonProps) {
  const content = href ? (
    <a href={href} className="block w-full h-full">
      {children}
    </a>
  ) : (
    <button onClick={onClick} className="w-full h-full">
      {children}
    </button>
  )

  const fallback = <div className={className}>{content}</div>

  return (
    <NoSSR fallback={fallback}>
      <AnimatedButtonContent className={className} href={href} onClick={onClick}>
        {children}
      </AnimatedButtonContent>
    </NoSSR>
  )
}