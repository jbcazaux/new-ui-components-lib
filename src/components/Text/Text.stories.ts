import preview from '../../../.storybook/preview'

import { Text } from '.'

const meta = preview.meta({
  title: 'Text',
  component: Text,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
})

export const Primary = meta.story({
  args: {
    text: 'hello world !',
  },
})
