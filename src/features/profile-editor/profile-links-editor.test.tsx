// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { ProfileLinksEditor } from './profile-links-editor'

afterEach(cleanup)

const GITHUB = { label: 'GitHub', href: 'https://github.com/Anders-planck' }
const LINKEDIN = { label: 'LinkedIn', href: 'https://linkedin.com/in/anders' }

function renderLinks(links = [GITHUB, LINKEDIN]) {
  const onChange = vi.fn()
  render(<ProfileLinksEditor links={links} onChange={onChange} />)
  return onChange
}

describe('ProfileLinksEditor', () => {
  test('editing a row hands back the list with that row changed', () => {
    const onChange = renderLinks()

    const [firstLabel] = screen.getAllByLabelText('Etichetta')
    if (firstLabel === undefined) {
      throw new Error('no label input')
    }
    fireEvent.change(firstLabel, { target: { value: 'Codice' } })

    expect(onChange).toHaveBeenCalledWith([
      { ...GITHUB, label: 'Codice' },
      LINKEDIN,
    ])
  })

  test('rows move by button, so reordering works from the keyboard', () => {
    const onChange = renderLinks()

    fireEvent.click(screen.getByRole('button', { name: 'Sposta giù GitHub' }))
    expect(onChange).toHaveBeenLastCalledWith([LINKEDIN, GITHUB])

    fireEvent.click(screen.getByRole('button', { name: 'Sposta su LinkedIn' }))
    expect(onChange).toHaveBeenLastCalledWith([LINKEDIN, GITHUB])
  })

  test('the first row cannot move up nor the last move down', () => {
    renderLinks()

    const isDisabled = (name: string) =>
      screen.getByRole('button', { name }).getAttribute('aria-disabled')
    expect(isDisabled('Sposta su GitHub')).toBe('true')
    expect(isDisabled('Sposta giù LinkedIn')).toBe('true')
  })

  test('links are added empty and removed by name', () => {
    const onChange = renderLinks()

    fireEvent.click(screen.getByRole('button', { name: 'Aggiungi link' }))
    expect(onChange).toHaveBeenLastCalledWith([
      GITHUB,
      LINKEDIN,
      { label: '', href: '' },
    ])

    fireEvent.click(screen.getByRole('button', { name: 'Rimuovi GitHub' }))
    expect(onChange).toHaveBeenLastCalledWith([LINKEDIN])
  })

  test('no links says so', () => {
    renderLinks([])

    expect(screen.getByText('Nessun link.')).toBeDefined()
  })
})
