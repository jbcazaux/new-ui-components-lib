import addonA11y from '@storybook/addon-a11y'
import addonDocs from '@storybook/addon-docs'
import { definePreview } from '@storybook/react-vite'

export default definePreview({
  addons: [addonA11y(), addonDocs()],
  tags: ['autodocs'],
  parameters: {
    a11y: {
      options: { xpath: true },
    },
  },
})
