/**
 * Copy of the CMS Media screen and of uploads (the CMS is in Italian, see
 * `cms-messages.ts`). Functions take the values they interpolate.
 */
export const CMS_MEDIA_MESSAGES = {
  title: 'Media',
  intro:
    'Immagini e file del sito. Ogni immagine ha un testo alternativo per lingua e viene servita in AVIF/WebP alle larghezze giuste.',
  loading: 'Caricamento dei media…',
  loadFailed: 'Non riesco a leggere i media',
  notConfiguredTitle: 'Archivio R2 non configurato',
  notConfiguredDescription:
    'Il caricamento resta spento finché il bucket R2 e le sue chiavi non sono impostati (docs/redesign/OWNER-STEPS.md).',
  originalsOnly:
    'Le varianti AVIF/WebP si attivano con Image transformations sul dominio del sito; fino ad allora le immagini sono servite come caricate.',
  upload: {
    label: 'Carica un’immagine o un PDF',
    /** `types` and `maxSize` come from the server's limits. */
    description: (types: string, maxSize: string) =>
      `${types} fino a ${maxSize}. Le immagini perdono i metadati (EXIF, posizione) prima di partire.`,
    typeNotAllowed: (types: string) =>
      `Tipo di file non ammesso: usa ${types}.`,
    tooLarge: (maxSize: string) =>
      `File troppo grande: il limite è ${maxSize}.`,
    uploading: (fileName: string) => `Caricamento di ${fileName}…`,
    recorded: (fileName: string) => `${fileName} caricato.`,
    retry: 'Riprova',
    problems: {
      empty: 'Il file è vuoto.',
      'bad-name': 'Il nome del file non è valido.',
      'bad-size': 'Non riesco a leggere le dimensioni dell’immagine.',
      'not-uploaded': 'Il file non è arrivato all’archivio. Riprova.',
      mismatch: 'L’archivio ha ricevuto un file diverso. Riprova.',
      'not-configured': 'L’archivio R2 non è configurato.',
      'not-stored': 'L’archivio ha rifiutato il file. Riprova.',
      'already-recorded': 'Questo file è già caricato.',
      interrupted: 'Caricamento interrotto. Riprova.',
      'unreadable-image':
        'Il browser non riesce a leggere questa immagine: esportala di nuovo e riprova.',
    },
  },
  table: {
    label: 'Media caricati',
    empty: 'Nessun media. Carica il primo file.',
    columns: {
      preview: 'Anteprima',
      file: 'File',
      usage: 'Dove è usato',
      alt: 'Testo alternativo',
    },
    pdf: 'PDF',
    unused: 'non usato',
    editAlt: 'Testo alternativo',
    editAltFor: (fileName: string) => `Testo alternativo di ${fileName}`,
    altNotNeeded: 'non serve',
    altMissing: (locales: string) => `manca: ${locales}`,
    altComplete: 'completo',
    altToReview: (locales: string) => `da rivedere: ${locales}`,
    /** What a note writes to show the image (`::figure`). */
    figureDirective: (mediaId: string) =>
      `::figure[didascalia]{media="${mediaId}"}`,
    figureDirectiveLabel: 'Per una nota',
  },
  usage: {
    collections: { profile: 'Profilo', note: 'Nota' },
    fields: { cvMediaId: 'CV', body: 'testo' },
    states: { draft: 'bozza', live: 'pubblicato' },
  },
  alt: {
    title: (fileName: string) => `Testo alternativo · ${fileName}`,
    description:
      'Obbligatorio: senza, la pubblicazione di una pagina che usa l’immagine si blocca. Descrivi cosa mostra, senza numeri.',
    fieldLabel: (localeName: string) => `Alt · ${localeName}`,
    saved: 'Salvato',
    saveFailed: 'Non salvato. Riprova.',
    emptyRefused:
      'Il testo alternativo non può essere vuoto: descrivi cosa mostra l’immagine.',
  },
  locales: { it: 'Italiano', en: 'English', fr: 'Français', de: 'Deutsch' },
} as const
