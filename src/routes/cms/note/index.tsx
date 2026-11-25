import { createFileRoute } from '@tanstack/react-router'

import { CmsNotesPage } from '../../../pages/cms-notes/cms-notes-page'

export const Route = createFileRoute('/cms/note/')({
  component: CmsNotesPage,
})
