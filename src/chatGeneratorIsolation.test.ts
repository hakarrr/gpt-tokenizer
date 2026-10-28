import { expect, test } from 'vite-plus/test'
import type { ChatMessage } from './GptEncoding.js'
import gpt35 from './model/gpt-3.5-0301.js'
import gpt4o from './model/gpt-4o.js'

for (const [name, encoding] of [
  ['gpt-3.5-0301', gpt35],
  ['gpt-4o', gpt4o],
] as const) {
  test.each(['role', 'name', 'role separator', 'message separator'] as const)(
    `${name} chat generator isolates yielded %s chunks`,
    (kind) => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'first' },
        { role: 'user', content: 'second' },
      ]
      if (kind === 'name') {
        messages[0]!.name = 'customer'
        messages[1]!.name = 'customer'
      }
      const expected = encoding.encodeChat(messages)
      const chunks: number[][] = []
      let index = 0
      for (const chunk of encoding.encodeChatGenerator(messages)) {
        chunks.push([...chunk])
        if (
          index ===
          (kind === 'message separator' ? 5 : kind === 'role separator' ? 2 : 1)
        ) {
          chunk.fill(0)
          chunk.push(999)
        }
        index++
      }
      expect(chunks.flat()).toEqual(expected)
      expect(encoding.encodeChat(messages)).toEqual(expected)
    },
  )
}
