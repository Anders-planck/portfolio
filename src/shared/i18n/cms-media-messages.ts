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
    description:
      'JPEG, PNG, WebP o PDF fino a 10 MB. Le immagini perdono i metadati (EXIF, posizione) prima di partire.',
    uploading: (fileName: string) => `Caricamento di ${fileName}…`,
    recorded: (fileName: string) => `${fileName} caricato.`,
    retry: 'Riprova',
    problems: {
      'type-not-allowed':
        'Tipo di file non ammesso: usa JPEG, PNG, WebP o PDF.',
      'too-large': 'File troppo grande: il limite è 10 MB.',
      empty: 'Il file è vuoto.',
      'bad-name': 'Il nome del file non è valido.',
      'bad-size': 'Non riesco a leggere le dimensioni dell’immagine.',
      'not-uploaded': 'Il file non è arrivato all’archivio. Riprova.',
      mismatch: 'L’archivio ha ricevuto un file diverso. Riprova.',
      'not-configured': 'L’archivio R2 non è configurato.',
      'not-stored': 'L’archivio ha rifiutato il file. Riprova.',
      interrupted: 'Caricamento interrotto. Riprova.',
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
  },
  usage: {
    collections: { profile: 'Profilo' },
    fields: { cvMediaId: 'CV' },
    states: { draft: 'bozza', live: 'pubblicato' },
  },
  alt: {
    title: (fileName: string) => `Testo alternativo · ${fileName}`,
    description:
      'Obbligatorio: senza, la pubblicazione di una pagina che usa l’immagine si blocca. Descrivi cosa mostra, senza numeri.',
    fieldLabel: (localeName: string) => `Alt · ${localeName}`,
    saved: 'Salvato',
    saveFailed: 'Non salvato. Riprova.',
  },
  locales: { it: 'Italiano', en: 'English', fr: 'Français', de: 'Deutsch' },
} as const
