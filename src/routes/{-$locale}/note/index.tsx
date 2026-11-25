import { createFileRoute } from '@tanstack/react-router'

import { publishedNotesQueryOptions } from '../../../entities/note/note-query-options'
import { NotesPage } from '../../../pages/notes/notes-page'
import { toPageHead } from '../../../widgets/site-shell/to-page-head'

export const Route = createFileRoute('/{-$locale}/note/')({
  // Awaiting in the loader renders the published notes on the server.
  loader: async ({ context }) => {
    await context.queryClient.query(publishedNotesQueryOptions())
  },
  head: ({ match }) =>
    toPageHead(match.pathname, ({ site, notes }) => ({
      title: `${notes.title} · ${site.name}`,
      description: notes.intro,
    })),
  component: NotesPage,
})
