import type { Locale } from '../../shared/i18n/locale'

interface DemoChapterCopy {
  eyebrow: string
  title: string
  body: string
}

/** The demo page's placeholder copy, kept in its route chunk (ADR 0013). */
export interface DemoCopy {
  notice: string
  /** One per demo chapter, opening first. */
  chapters: {
    opening: DemoChapterCopy
    scroll: DemoChapterCopy
    pointer: DemoChapterCopy
    anchors: DemoChapterCopy
    layouts: DemoChapterCopy
  }
  faceLabels: readonly [string, string, string, string]
  faceDetail: string
}

export const DEMO_COPY: Record<Locale, DemoCopy> = {
  it: {
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
  en: {
    notice:
      'Demo page: the copy is placeholder text and describes no real work.',
    chapters: {
      opening: {
        eyebrow: 'Opening',
        title: 'Immersive engine demo',
        body: 'A test page for chapters, index and block. No real content.',
      },
      scroll: {
        eyebrow: 'Scroll',
        title: 'Scrolling turns the block',
        body: 'Each chapter gives the block a pose; between two chapters the block moves from one to the other.',
      },
      pointer: {
        eyebrow: 'Pointer',
        title: 'The block follows the pointer',
        body: 'Drag it to turn it: on release it stops on a face. From the keyboard, left and right arrows.',
      },
      anchors: {
        eyebrow: 'Anchors',
        title: 'Every chapter has an address',
        body: 'The index and the controls under the block lead to a chapter; Back returns to where you were.',
      },
      layouts: {
        eyebrow: 'Layout',
        title: 'Linear when it helps',
        body: 'On a narrow screen, on touch or with reduced motion the page runs as a column and the block stays still.',
      },
    },
    faceLabels: ['First face', 'Second face', 'Third face', 'Fourth face'],
    faceDetail: 'demo',
  },
  fr: {
    notice:
      'Page de démonstration : les textes sont provisoires et ne décrivent aucun travail réel.',
    chapters: {
      opening: {
        eyebrow: 'Ouverture',
        title: 'Démo du moteur immersif',
        body: 'Une page d’essai pour les chapitres, l’index et le bloc. Aucun contenu réel.',
      },
      scroll: {
        eyebrow: 'Défilement',
        title: 'Le défilement tourne le bloc',
        body: 'Chaque chapitre donne une pose au bloc ; entre deux chapitres, le bloc passe de l’une à l’autre.',
      },
      pointer: {
        eyebrow: 'Pointeur',
        title: 'Le bloc suit le pointeur',
        body: 'Faites-le glisser pour le tourner : au relâchement, il s’arrête sur une face. Au clavier, flèches gauche et droite.',
      },
      anchors: {
        eyebrow: 'Ancres',
        title: 'Chaque chapitre a une adresse',
        body: 'L’index et les commandes sous le bloc mènent à un chapitre ; Retour revient là où vous étiez.',
      },
      layouts: {
        eyebrow: 'Mise en page',
        title: 'Linéaire quand il le faut',
        body: 'Sur un écran étroit, au toucher ou avec le mouvement réduit, la page défile en colonne et le bloc reste immobile.',
      },
    },
    faceLabels: [
      'Première face',
      'Deuxième face',
      'Troisième face',
      'Quatrième face',
    ],
    faceDetail: 'démo',
  },
  de: {
    notice:
      'Demoseite: Die Texte sind Platzhalter und beschreiben keine echte Arbeit.',
    chapters: {
      opening: {
        eyebrow: 'Auftakt',
        title: 'Demo der immersiven Engine',
        body: 'Eine Testseite für Kapitel, Index und Block. Kein echter Inhalt.',
      },
      scroll: {
        eyebrow: 'Scrollen',
        title: 'Scrollen dreht den Block',
        body: 'Jedes Kapitel gibt dem Block eine Pose; zwischen zwei Kapiteln geht der Block von der einen zur anderen.',
      },
      pointer: {
        eyebrow: 'Zeiger',
        title: 'Der Block folgt dem Zeiger',
        body: 'Ziehen dreht ihn: Beim Loslassen hält er auf einer Seite. Mit der Tastatur: Pfeile links und rechts.',
      },
      anchors: {
        eyebrow: 'Anker',
        title: 'Jedes Kapitel hat eine Adresse',
        body: 'Index und Steuerung unter dem Block führen zu einem Kapitel; Zurück bringt dich dorthin, wo du warst.',
      },
      layouts: {
        eyebrow: 'Layout',
        title: 'Linear, wenn es hilft',
        body: 'Auf schmalen Bildschirmen, bei Touch oder reduzierter Bewegung läuft die Seite als Spalte und der Block bleibt still.',
      },
    },
    faceLabels: ['Erste Seite', 'Zweite Seite', 'Dritte Seite', 'Vierte Seite'],
    faceDetail: 'Demo',
  },
}
