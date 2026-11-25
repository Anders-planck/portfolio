import { Banner } from '@astryxdesign/core/Banner'
import { Button } from '@astryxdesign/core/Button'
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog'
import {
  HStack,
  Layout,
  LayoutContent,
  LayoutFooter,
  VStack,
} from '@astryxdesign/core/Layout'
import type { ReactNode } from 'react'

export interface SourceFormDialogProps {
  title: string
  subtitle?: string
  cancelLabel: string
  submitLabel: string
  /** Problems to show above the fields, already worded for the owner. */
  errors: readonly string[]
  onClose: () => void
  onSubmit: () => Promise<void>
  children: ReactNode
}

/**
 * The dialog frame of the Fonti forms: title, errors, fields, cancel and
 * submit. Closing goes through `onClose` only (Escape, the close button and
 * Annulla), and the submit button blocks a second click while it runs.
 */
export function SourceFormDialog({
  title,
  subtitle,
  cancelLabel,
  submitLabel,
  errors,
  onClose,
  onSubmit,
  children,
}: SourceFormDialogProps) {
  return (
    <Dialog
      isOpen
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose()
        }
      }}
      purpose="form"
    >
      <Layout
        header={
          <DialogHeader
            title={title}
            subtitle={subtitle}
            onOpenChange={onClose}
          />
        }
        content={
          <LayoutContent>
            <VStack gap={4}>
              {errors.map((error) => (
                <Banner key={error} status="error" title={error} />
              ))}
              {children}
            </VStack>
          </LayoutContent>
        }
        footer={
          <LayoutFooter>
            <HStack gap={2} hAlign="end">
              <Button label={cancelLabel} onClick={onClose} />
              <Button
                label={submitLabel}
                variant="primary"
                clickAction={onSubmit}
              />
            </HStack>
          </LayoutFooter>
        }
      />
    </Dialog>
  )
}
