/**
 * The copy of the CMS (DATA-05). The CMS is for the owner only and is not
 * localized, so it has one Italian catalog; the site's locales do not apply.
 */
export const CMS_MESSAGES = {
  documentTitle: 'CMS · Anders Planck',
  brand: 'CMS',
  navigation: {
    content: 'Contenuti',
    site: 'Sito',
    quality: 'Qualità',
    overview: 'Panoramica',
    profile: 'Profilo',
    notes: 'Note',
    sources: 'Fonti dei numeri',
    viewSite: 'Vedi il sito',
  },
  access: {
    title: 'Accedi per modificare il sito',
    description: 'Solo il proprietario del sito può entrare nel CMS.',
    signInWithGithub: 'Accedi con GitHub',
    notOwnerTitle: 'Questo account non può entrare nel CMS',
    notOwnerDescription:
      'Accedi con l’account GitHub del proprietario del sito.',
    cancelledTitle: 'Accesso annullato',
    expiredTitle: 'L’accesso è scaduto: riprova.',
    failedTitle: 'Accesso non riuscito: riprova.',
    signOut: 'Esci',
  },
  shell: {
    loading: 'Caricamento del CMS…',
    errorTitle: 'Il CMS non risponde',
    errorDescription: 'Ricarica la pagina tra qualche istante.',
  },
  overview: {
    title: 'Panoramica',
    description:
      'Lo stato del sito in un colpo d’occhio: cosa è pronto, cosa manca, cosa aspetta di essere pubblicato.',
    emptyTitle: 'Ancora niente da mostrare',
    emptyDescription:
      'Bozze, controlli e ultimo rilascio compariranno qui con le prossime schermate.',
  },
  profile: {
    title: 'Profilo',
    description:
      'Chi sei, come ti si contatta e dove trovarti. Le stesse informazioni alimentano Home, Percorso e CV.',
    localeLabel: 'Lingua dei testi',
    locales: { it: 'IT', en: 'EN', fr: 'FR', de: 'DE' },
    loading: 'Caricamento della bozza…',
    errorTitle: 'Non riesco a leggere la bozza',
    heroSection: 'Hero della home',
    contactSection: 'Contatti e link',
    skillsSection: 'Competenze e lingue',
    fields: {
      statusLabel: 'Etichetta di stato',
      availabilityLabel: 'Nome accessibile del pallino «disponibile»',
      isAvailable: 'Mostra il pallino «disponibile»',
      titleLine1: 'Titolo · riga 1',
      titleLine2: 'Titolo · riga 2',
      subtitle: 'Sottotitolo',
      name: 'Nome',
      email: 'Email',
      contactLabel: 'Testo del pulsante di contatto',
      frontend: 'Frontend',
      backend: 'Backend',
      infra: 'Infra',
      languages: 'Lingue',
    },
    links: {
      title: 'Link social',
      label: 'Etichetta',
      href: 'Indirizzo',
      add: 'Aggiungi link',
      remove: (label: string) => `Rimuovi ${label}`,
      moveUp: (label: string) => `Sposta su ${label}`,
      moveDown: (label: string) => `Sposta giù ${label}`,
      empty: 'Nessun link.',
      /** Name of a link row whose label is still empty. */
      untitled: 'link senza etichetta',
    },
  },
  save: {
    unsaved: 'Modifiche da salvare…',
    saving: 'Salvataggio…',
    saved: (time: string) => `Salvato · ${time}`,
    failed: 'Salvataggio non riuscito',
    retry: 'Riprova',
    neverSaved: 'Nessuna bozza salvata',
  },
  publish: {
    action: 'Pubblica',
    published: 'Pubblicato: il sito mostra la bozza.',
    scheduled: 'Pubblicazione programmata.',
    stale:
      'La bozza è cambiata nel frattempo: ricontrolla e pubblica di nuovo.',
    blocked: 'Pubblicazione bloccata dai controlli',
    failed: 'Pubblicazione non riuscita',
    networkError: 'Pubblicazione non confermata: riprova.',
  },
  notes: {
    title: 'Note',
    description:
      'Articoli in Markdown. Una nota pubblicata compare in Note, nella lingua di chi legge o in quella di riserva.',
    create: 'Nuova nota',
    createFailed: 'Non riesco a creare la nota: riprova.',
    limitReached: 'Hai raggiunto il numero massimo di note.',
    loading: 'Caricamento delle note…',
    errorTitle: 'Non riesco a leggere le note',
    emptyTitle: 'Ancora nessuna nota',
    emptyFilterTitle: 'Nessuna nota in questo stato',
    statusFilterLabel: 'Filtra per stato',
    statusFilters: {
      all: 'Tutte',
      published: 'Pubblicate',
      draft: 'Bozze',
      scheduled: 'Programmate',
    },
    filterOption: (label: string, count: string) => `${label} · ${count}`,
    columns: {
      title: 'Titolo',
      topic: 'Tema',
      status: 'Stato',
      locales: 'Lingue',
      reading: 'Lettura',
    },
    untitled: 'Nota senza titolo',
    localeSeparator: ' · ',
    noReading: '—',
    readingTime: (minutes: string) => `${minutes} min`,
    statuses: {
      draft: 'Bozza',
      scheduled: (date: string) => `Programmata · ${date}`,
      published: (date: string) => `Pubblicata · ${date}`,
      publishedWithScheduledEdit: (date: string, editDate: string) =>
        `Pubblicata · ${date} · modifica programmata · ${editDate}`,
    },
    topics: { ai: 'AI', mobile: 'Mobile', architecture: 'Architettura' },
    editor: {
      back: 'Tutte le note',
      notFoundTitle: 'Questa nota non esiste',
      loading: 'Caricamento della bozza…',
      errorTitle: 'Non riesco a leggere la bozza',
      localeLabel: 'Lingua dei testi',
      contentSection: 'Testo',
      fields: {
        title: 'Titolo',
        summary: 'Sintesi',
        summaryHelp:
          'Una frase sotto il titolo in Note; è anche la descrizione per i motori di ricerca.',
        body: 'Testo in Markdown',
        bodyHelp:
          'Titoli ## e ###, elenchi, citazioni, codice. Direttive: :::case{title="…"} … :::, ::metric[etichetta]{key="…"}, ::figure[didascalia]{media="…"}. Ogni numero è un riferimento {{m:chiave}}.',
        slug: 'Slug',
        slugHelp: 'L’indirizzo della nota: /note/slug, uguale in ogni lingua.',
        topic: 'Tema',
        linkedProjects: 'Collegata a',
        linkedProjectsHelp: 'Mostrata anche nelle pagine di questi progetti.',
        noProjects: 'Nessun progetto ancora',
      },
      previewSection: 'Anteprima della bozza salvata',
      publicationSection: 'Pubblicazione',
      structureSection: 'Struttura',
      structureEmpty: 'Nessun titolo ancora.',
      readingSummary: (minutes: string, words: string) =>
        `${minutes} min · ${words} parole`,
      checksSection: 'Controlli',
      checksPassed: 'Nessun problema: la nota si può pubblicare.',
      translatedIn: (locales: string) => `Tradotta in: ${locales}`,
    },
    findings: {
      'note-slug':
        'Lo slug deve essere fatto di parole minuscole unite da trattini.',
      'note-slug-taken': 'Un’altra nota usa già questo slug.',
      'note-title': 'Manca il titolo (serve almeno quello italiano).',
      'note-unknown-directive':
        'Una direttiva non esiste: usa case, metric o figure.',
      'note-malformed-directive':
        'Una riga che inizia con :: non è una direttiva valida: scrivi ::nome[etichetta]{chiave="valore"}, senza spazi né testo dopo.',
      'note-unclosed-fence': 'Un blocco di codice aperto con ``` non è chiuso.',
      'note-limit':
        'Ci sono troppe note: eliminane qualcuna prima di pubblicare.',
      'note-missing-attribute':
        'A una direttiva manca un attributo: title per case, key per metric, media per figure.',
      'note-unclosed-directive': 'Un blocco :::case non è chiuso da :::.',
      'note-nested-block':
        'Dentro un case vanno solo paragrafi, elenchi, citazioni e codice.',
      'note-figure-unavailable':
        'Le immagini compariranno quando ci saranno i media: per ora la figura non si vede.',
      'free-numeral':
        'C’è un numero scritto a mano: usa un riferimento {{m:chiave}}.',
      'unknown-metric': 'Il riferimento nomina una metrica che non esiste.',
      'malformed-metric-reference':
        'Un riferimento a metrica è scritto male: {{m:chiave}}.',
    },
    severities: { block: 'Blocca la pubblicazione', warn: 'Avviso' },
    sharedField: 'tutte le lingue',
    findingFields: {
      title: 'Titolo',
      summary: 'Sintesi',
      body: 'Testo',
      slug: 'Slug',
    },
    otherFinding: (rule: string) => `Regola non rispettata: ${rule}`,
    findingWhere: (field: string, locale: string) => `${field} · ${locale}`,
  },
  release: {
    publishNow: 'Pubblica ora',
    scheduleAt: 'Programma la pubblicazione',
    scheduleAction: 'Programma',
    schedulePast: 'Scegli una data futura.',
  },
} as const
