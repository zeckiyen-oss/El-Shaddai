const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Cles API dans les variables d'environnement Render (jamais dans le code)
const MASTER_KEY = process.env.JSONBIN_MASTER_KEY;
const ACCESS_KEY = process.env.JSONBIN_ACCESS_KEY;

// IDs des bins JSONBin
const BINS = {
  formations: '6aa643cbac6210605ac6f847',
  medias: '6aa643fffd5d16053008962',
  settings: '6aa64460ffd5d16053008a57'
};

// Donnees par defaut si les bins sont vides
const DEFAULTS = {
  formations: {
    formations: [
      {
        title: 'Informatique & Réseau',
        desc: 'Maîtrisez l\'outil informatique et les réseaux pour les métiers du numérique.',
        level: 'Débutant → Avancé',
        styleKey: 'informatique',
        points: ['Opérateur de Saisie','Maintenance informatique','Administration réseau','Outils bureautiques avancés']
      },
      {
        title: 'Graphisme & PAO',
        desc: 'Créez des visuels percutants pour la musique, les arts et la communication.',
        level: 'Débutant → Expert',
        styleKey: 'design',
        points: ['Design graphique & composition','Photoshop & Illustrator','Publishing & mise en page','Identité visuelle & branding']
      },
      {
        title: 'Développement Web',
        desc: 'Concevez et développez des sites web professionnels et modernes.',
        level: 'Débutant → Intermédiaire',
        styleKey: 'web',
        points: ['HTML / CSS / JavaScript','Création de sites vitrines','WordPress & CMS','Mise en ligne & hébergement']
      },
      {
        title: 'Cadrage & Montage Audiovisuel',
        desc: 'De la prise de vue au montage final, maîtrisez la chaîne audiovisuelle complète.',
        level: 'Débutant → Avancé',
        styleKey: 'video',
        points: ['Techniques de cadrage vidéo','Éclairage professionnel','Montage & post-production','Clip musical & reportage']
      },
      {
        title: 'Shooting & Prise de Son',
        desc: 'Maîtrisez l\'enregistrement, le traitement et la prise de son en studio.',
        level: 'Débutant → Expert',
        styleKey: 'audio',
        points: ['Prise de son professionnelle','Traitement audio & mixage','Enregistrement en studio','Mastering & diffusion']
      }
    ]
  },
  medias: {
    medias: [
      {title:'Formation Cadrage Vidéo — Module 1', type:'video', category:'formations', link:'https://youtube.com', desc:'Introduction aux techniques de cadrage professionnel'},
      {title:'Production Studio — Extrait', type:'audio', category:'productions', link:'https://soundcloud.com', desc:'Aperçu d\'une session d\'enregistrement au studio'},
      {title:'Formation Graphisme — Démonstration', type:'video', category:'formations', link:'https://youtube.com', desc:'Création d\'une identité visuelle de A à Z'},
      {title:'Concert & Performance — Laurus"co', type:'audio', category:'audios', link:'https://soundcloud.com', desc:'Archive sonore en hommage au fondateur'}
    ]
  },
  settings: {
    settings: {
      address: 'Akpro-Missérété, non loin de la Prison Civile — Bénin',
      email: 'studioelshaddaiprod@gmail.com',
      tiktok: 'https://tiktok.com/@arthurcomabou'
    }
  }
};

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname)));

/* ─── LECTURE (utilise la cle lecture seule ACCESS KEY) ─── */
app.get('/api/:type', async (req, res) => {
  const { type } = req.params;
  if (!BINS[type]) return res.status(404).json({ error: 'Type inconnu' });

  try {
    const response = await fetch(
      `https://api.jsonbin.io/v3/b/${BINS[type]}/latest`,
      { headers: { 'X-Access-Key': ACCESS_KEY } }
    );

    if (!response.ok) {
      // Si le bin est vide ou erreur, retourner les donnees par defaut
      return res.json(DEFAULTS[type]);
    }

    const data = await response.json();
    const record = data.record;

    // Si le bin est vide (tableau vide), retourner les donnees par defaut
    if (type === 'formations' && record.formations && record.formations.length === 0) {
      return res.json(DEFAULTS[type]);
    }
    if (type === 'medias' && record.medias && record.medias.length === 0) {
      return res.json(DEFAULTS[type]);
    }

    res.json(record);
  } catch (err) {
    console.error('Erreur lecture JSONBin:', err.message);
    // En cas d'erreur reseau, retourner les donnees par defaut
    res.json(DEFAULTS[type]);
  }
});

/* ─── ECRITURE (utilise la cle maitre MASTER KEY) ─── */
app.put('/api/:type', async (req, res) => {
  const { type } = req.params;
  if (!BINS[type]) return res.status(404).json({ error: 'Type inconnu' });

  if (!MASTER_KEY) {
    return res.status(500).json({ error: 'Clé serveur non configurée' });
  }

  try {
    const response = await fetch(
      `https://api.jsonbin.io/v3/b/${BINS[type]}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': MASTER_KEY
        },
        body: JSON.stringify(req.body)
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Erreur JSONBin PUT:', errText);
      return res.status(response.status).json({ error: 'Erreur sauvegarde', detail: errText });
    }

    const data = await response.json();
    res.json(data.record);
  } catch (err) {
    console.error('Erreur ecriture JSONBin:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/* ─── Route fallback pour le site ─── */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Serveur El-Shaddai Prod démarré sur le port ${PORT}`);
  console.log(`MASTER_KEY chargée : ${MASTER_KEY ? 'oui (' + MASTER_KEY.length + ' caractères)' : 'NON — vérifier les variables d\'environnement'}`);
  console.log(`ACCESS_KEY chargée : ${ACCESS_KEY ? 'oui (' + ACCESS_KEY.length + ' caractères)' : 'NON — vérifier les variables d\'environnement'}`);
});
