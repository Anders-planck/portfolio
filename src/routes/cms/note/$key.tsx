import { createFileRoute } from '@tanstack/react-router'

import { CmsNotePage } from '../../../pages/cms-note/cms-note-page'

export const Route = createFileRoute('/cms/note/$key')({
  component: NoteEditorRoute,
})

function NoteEditorRoute() {
  return <CmsNotePage noteKey={Route.useParams().key} />
}
