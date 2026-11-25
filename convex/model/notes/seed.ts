import type { MutationCtx } from '../../_generated/server'
import { findPublishedPointer } from '../content/pointers'
import { publishSelection } from '../content/releases'
import { type NoteDraftEdit, saveNoteDraftEdit } from './drafts'

/**
 * The seed note: the one note the mockup (`Nota`) shows as published, in
 * its own words, minus what no rule lets through (PLAN → Seed content,
 * ADR 0004): the ordinal numbers of the section headings and the section
 * "Perché leggere il diff" (its "a 360 gradi" is a free number only the
 * owner can reword) are left out, and so are the footer's file path and its
 * link to an unpublished note (resolution 12). "Il metodo" is a case.
 */
const SEED_NOTE: NoteDraftEdit = {
  key: 'seed-review-agenti',
  fields: { slug: 'review-agenti', topic: 'ai', linkedProjectKeys: [] },
  localeEdit: {
    locale: 'it',
    content: {
      title: 'Cosa cerco quando rivedo il codice di un agente',
      summary:
        'Cinque errori tipici degli agenti, come li intercetto e perché nessuna review è perfetta.',
      body: [
        'Uso gli agenti ogni giorno. Quello che fanno funziona quasi sempre a schermo. Il problema è quello che non si vede a schermo.',
        '## Errori di architettura',
        "Quando non viene controllato, l'agente introduce errori di architettura: una modifica piccola che attraversa livelli che non dovrebbe toccare. Per questo i confini tra moduli li impongo nel lint. Non mi fido della buona volontà, né della mia né dell'agente.",
        '## Codice morto e modifiche parallele',
        "Per fare una sola modifica, a volte l'agente ne introduce altre in parallelo che non hanno motivo di esistere. Il risultato è codice morto: file, export e dipendenze che nessuno usa. Uno strumento come knip nel check di pre-commit li fa emergere subito.",
        '## Regole perse a contesto pieno',
        "Quando il contesto è pieno, l'agente non riesce più a seguire le regole di sviluppo e scrive codice che non rispetta il clean code previsto dal coding standard. La regola che ne ho tratto: le regole devono stare nel repo e nel lint, non nella memoria dell'agente.",
        '## Decisioni prese da solo',
        "Se usi l'agente in modalità automatica, o con i permessi aggirati, ha il diritto di prendere decisioni senza chiederti. Per questo rileggo la logica, non solo il risultato.",
        '## Merge tra worktree che si sovrascrivono',
        "Con più agenti o più sessioni in parallelo, ognuno lavora nel suo worktree. Al momento di unire tutto in una PR o in più PR, è l'agente a fare merge e rebase. Se le feature non sono indipendenti, capita spesso che sovrascriva una logica con un'altra, perché non sa quale delle due deve prevalere. Così nascono buchi di logica.",
        ':::case{title="Il metodo: review in loop con agenti a contesto vuoto"}\nChi ha scritto il codice non lo rivede. Uso un altro agente, che non sa niente di quello che è stato fatto e parte con un contesto vuoto. Segue solo il problema e la soluzione di base, e per questo legge il codice con più attenzione e trova le parti che non vanno.\n:::',
        '## Nessuna review è perfetta',
        "Su una feature di Bussola avevo fatto tutto: review sulla UI, review con il loop di agenti, nessun bug di logica trovato. L'ho mergiata. Solo lavorando alla feature successiva mi sono accorto che una scelta di logica che avevo deciso io non era quella giusta.",
        "L'ho corretta con un hotfix. In altri casi metto la correzione direttamente dentro la feature che sto facendo. In entrambi i casi aggiungo il test che l'avrebbe fermata.",
        "> **In una frase:** l'agente scrive veloce, la review decide cosa resta, e ogni errore che passa diventa un test.",
      ].join('\n\n'),
    },
  },
}

/**
 * Saves and publishes the seed note unless it is already live, so retries
 * are safe. A seed that does not publish is a bug: it throws.
 */
export async function publishSeedNoteOnce(ctx: MutationCtx, now: number) {
  const ref = { collection: 'note' as const, key: SEED_NOTE.key }
  if ((await findPublishedPointer(ctx, ref)) !== null) {
    return
  }
  const { revision } = await saveNoteDraftEdit(ctx, SEED_NOTE, now)
  const outcome = await publishSelection(
    ctx,
    {
      selection: [{ ...ref, revision }],
      note: 'Nota iniziale',
      requestId: 'seed:note:review-agenti',
    },
    now,
  )
  if (outcome.status !== 'published') {
    const messages =
      outcome.status === 'blocked'
        ? outcome.findings.map((finding) => finding.message).join('; ')
        : outcome.status
    throw new Error(`The seed note did not publish: ${messages}`)
  }
}
