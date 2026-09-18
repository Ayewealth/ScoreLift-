import React, { createElement } from 'react'
import { render } from '@react-email/render'

export async function renderEmail(
  component: (...args: never[]) => unknown,
  props: Record<string, unknown>,
): Promise<string> {
  return render(createElement(component as React.ComponentType, props))
}