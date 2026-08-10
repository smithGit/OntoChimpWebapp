// src/utils/get_topic_md_to_html.ts

import { marked } from "marked"

export async function get_topic_md_to_html(
  topicId: string
): Promise<string> {
  const filename = topicId + ".md"
  alert("IN GET HTML: Filename = " + filename)
  const response = await fetch(`/data/${filename}`)

  if (!response.ok) {
    throw new Error(
      `Unable to load topic file: ${filename}`
    )
  }

  const markdownText = await response.text()
  alert("Markdown Text = " + markdownText)
  const htmlText = await marked.parse(markdownText)
  alert("HTML Text = " + htmlText)
  return htmlText
}
