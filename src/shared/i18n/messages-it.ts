import type { Messages } from './messages'

export const MESSAGES_IT: Messages = {
  site: {
    name: 'Anders Planck',
    wordmark: 'anders/planck',
    description: 'Frontend e full-stack in TypeScript.',
  },
  navigation: {
    label: 'Navigazione principale',
    footerLabel: 'Navigazione del sito',
    work: 'Lavori',
    notes: 'Note',
    careerPath: 'Percorso',
    cv: 'CV · PDF',
  },
  language: {
    name: 'Italiano',
    code: 'IT',
    menuLabel: 'Lingua',
    menuButtonLabel: (code) => `Lingua: ${code}`,
    menuHint: 'Cambiando lingua resti sulla stessa pagina.',
  },
  translationFallback: {
    title: (shownLanguage) =>
      `Questa pagina non è ancora tradotta: la leggi in ${shownLanguage}.`,
    description: 'Menu e navigazione restano nella lingua che hai scelto.',
  },
  home: {
    emptyTitle: 'Il profilo non è ancora pubblicato.',
  },
  pageError: {
    title: 'Qualcosa non ha funzionato.',
    body: 'La pagina non si è caricata. Riprova tra poco.',
    retry: 'Riprova',
  },
  immersive: {
    chapterIndexLabel: 'Capitoli',
    chapterNavigationLabel: 'Capitolo',
    previousChapter: 'Capitolo precedente',
    nextChapter: 'Capitolo successivo',
    stageHint: 'Trascina il blocco per girarlo · scorri per cambiare capitolo',
    blockLabel: 'Blocco',
    blockKeyboardHint: 'Frecce sinistra e destra per girare il blocco.',
    blockCursorLabel: 'Trascina',
    chapterEyebrow: (chapterNumber, eyebrow) => `${chapterNumber} / ${eyebrow}`,
    chapterIndexStep: (chapterNumber, eyebrow) => `${chapterNumber} ${eyebrow}`,
    chapterPosition: (chapterNumber, lastChapterNumber, eyebrow) =>
      `${chapterNumber} / ${lastChapterNumber} · ${eyebrow}`,
    frontFace: (faceNumber, faceLabel) => `${faceNumber} · ${faceLabel}`,
  },
  immersiveDemo: {
    title: 'Demo del motore immersivo',
    description:
      'Pagina di prova del motore delle pagine immersive, con testi segnaposto.',
    notice:
      'Pagina dimostrativa: i testi sono segnaposto e non descrivono lavori reali.',
    chapters: {
      opening: {
        eyebrow: 'Apertura',
        title: 'Demo del motore immersivo',
        body: 'Una pagina di prova per capitoli, indice e blocco. Nessun contenuto reale.',
      },
      scroll: {
        eyebrow: 'Scorrimento',
        title: 'Lo scorrimento gira il blocco',
        body: 'Ogni capitolo dà al blocco una posa; tra due capitoli il blocco passa dall’una all’altra.',
      },
      pointer: {
        eyebrow: 'Puntatore',
        title: 'Il blocco segue il puntatore',
        body: 'Trascinalo per girarlo: al rilascio si ferma su una faccia. Da tastiera, frecce sinistra e destra.',
      },
      anchors: {
        eyebrow: 'Ancore',
        title: 'Ogni capitolo ha un indirizzo',
        body: 'L’indice e i comandi sotto il blocco portano a un capitolo; Indietro torna dove eri.',
      },
      layouts: {
        eyebrow: 'Impaginazione',
        title: 'Lineare quando serve',
        body: 'Su uno schermo stretto, al tocco o con movimento ridotto la pagina scorre in colonna e il blocco resta fermo.',
      },
    },
    faceLabels: [
      'Prima faccia',
      'Seconda faccia',
      'Terza faccia',
      'Quarta faccia',
    ],
    faceDetail: 'demo',
  },
  notFound: {
    documentTitle: (siteName) => `Pagina non trovata · ${siteName}`,
    eyebrow: 'Pagina non trovata',
    title: 'Questa pagina non esiste, o non più.',
    body: 'Il blocco si è smontato. Torniamo dove le cose sono al loro posto.',
    homeLink: 'Torna alla home',
    workLink: 'Vai ai lavori',
  },
}
