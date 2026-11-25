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
    /** Shown under a group whose screens come with later work. */
    comingSoon: 'Le schermate arrivano più avanti.',
    overview: 'Panoramica',
    profile: 'Profilo',
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
} as const
