'use client'

import cn from 'classnames'

import styles from './style.module.scss'

interface Props {
  /** Is this the principal call to action on the page? */
  primary?: boolean
  /** How large should the button be? */
  size?: 'small' | 'medium' | 'large'
  /** Button contents */
  label: string
  /** Optional click handler */
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
