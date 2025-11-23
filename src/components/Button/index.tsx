'use client'

import cn from 'classnames'

import styles from './style.module.scss'

export interface Props {
  primary?: boolean
  size?: 'small' | 'medium' | 'large'
  label: string
  onClick?: () => void
}

const Button = ({
  primary = false,
  size = 'medium',
  label,
  ...props
}: Props) => (
  <button
    type="button"
    className={cn(styles.button, styles[size], {
      [styles.primary]: primary,
      [styles.secondary]: !primary,
    })}
    {...props}
  >
    {label}
  </button>
)

export { Button }
