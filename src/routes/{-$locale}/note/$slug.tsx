import { createFileRoute } from '@tanstack/react-router'

import { loadNotePage } from '../../../pages/note/load-note-page'
import { NotePage } from '../../../pages/note/note-page'
import { toLocaleFromPathname } from '../../../shared/i18n/locale'
import { toPageHead } from '../../../widgets/site-shell/to-page-head'

export const Route = createFileRoute('/{-$locale}/note/$slug')({
  // Awaited on the server; an unknown or unpublished slug is the 404 page.
  loader: ({ context, params, location }) =>
    loadNotePage(
      context.queryClient,
      params.slug,
      toLocaleFromPathname(location.pathname),
    ),
  head: ({ match, loaderData }) =>
    toPageHead(match.pathname, () => ({
      title: loaderData?.title ?? '',
      description: loaderData?.description ?? '',
    })),
  component: NoteRoute,
})

function NoteRoute() {
  return <NotePage slug={Route.useParams().slug} />
}
