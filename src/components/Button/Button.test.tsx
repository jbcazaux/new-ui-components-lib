import { fireEvent, render, screen } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'

import { Button } from '.'

describe('Button Component', () => {
  test('should display Button', () => {
    render(<Button label="My Button" />)

    const btn = screen.getByRole('button', { name: 'My Button' })

    expect(btn).toBeTruthy()
  })

  test('should handle click', () => {
    const handleClick = vi.fn()
    render(<Button label="My Button" onClick={handleClick} />)

    const btn = screen.getByRole('button')
    fireEvent.click(btn)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
