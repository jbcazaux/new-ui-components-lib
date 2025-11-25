import { render, screen } from '@testing-library/react'
import { describe, test, expect } from 'vitest'

import { Text } from '.'

describe('Text Component', () => {
  test('should display text', () => {
    render(<Text text="hello world" />)

    const txt = screen.getByText('hello world')

    expect(txt).toBeTruthy()
  })
})
