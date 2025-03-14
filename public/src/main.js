// Implementare simplificată JavaScript pentru DOXA
// Folosește DOM API direct pentru o abordare mai robustă

// Stare pentru aplicație
const appState = {
  loading: false,
  status: 'online',
  featuredPilgrimages: [],
  monasteries: [],
  upcomingPilgrimages: []
};

// Funcție helper pentru crearea elementelor DOM
function createElement(tag, props, ...children) {
  // Verificăm dacă tag-ul este valid
  if (typeof tag !== 'string' || !tag) {
    console.error('Tag invalid:', tag);
    return document.createElement('div');
  }

  const element = document.createElement(tag);
  
  if (props) {
    Object.entries(props).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(element.style, value);
      } else if (key.startsWith('on') && typeof value === 'function') {
        const eventName = key.substring(2).toLowerCase();
        element.addEventListener(eventName, value);
      } else {
        element.setAttribute(key, value);
      }
    });
  }
  
  children.flat().forEach(child => {
    if (child === null || child === undefined) return;
    
    const node = 
      typeof child === 'string' || typeof child === 'number'
        ? document.createTextNode(child.toString())
        : child;
        
    element.appendChild(node);
  });
  
  return element;
}

// Componente de interfață
function createNavbar() {
  return createElement('nav', { className: 'navbar' },
    createElement('div', { className: 'container navbar-content' },
      createElement('a', { href: '/', className: 'navbar-brand' },
        'DOXA'
      ),
      createElement('div', { className: 'navbar-links' },
        createElement('a', { href: '/pilgrimages' }, 'Pelerinaje'),
        createElement('a', { href: '/monasteries' }, 'Mănăstiri'),
        createElement('a', { href: '/calendar' }, 'Calendar Ortodox'),
        createElement('a', { href: '/fasting-recipes' }, 'Rețete de Post'),
        createElement('a', { href: '/doxa-ai' }, 'DOXA AI')
      ),
      createElement('div', { className: 'navbar-auth' },
        createElement('a', { href: '/auth', className: 'btn btn-outline' }, 'Autentificare'),
        createElement('a', { href: '/auth?mode=register', className: 'btn btn-primary' }, 'Înregistrare')
      )
    )
  );
}

function createHeroSection() {
  return createElement('section', { className: 'hero' },
    createElement('div', { className: 'container hero-content' },
      createElement('h1', null, 'Descoperă locuri sfinte'),
      createElement('p', null, 'Pelerinaje la cele mai frumoase mănăstiri și locuri sfinte din lume'),
      createElement('div', { className: 'hero-buttons' },
        createElement('a', { href: '/pilgrimages', className: 'btn btn-primary' }, 'Descoperă pelerinaje'),
        createElement('a', { href: '/doxa-ai', className: 'btn btn-secondary' }, 'Asistent AI')
      )
    )
  );
}

function createFeaturesSection() {
  const features = [
    {
      title: 'Pelerinaje ghidate',
      description: 'Excursii spirituale la cele mai importante mănăstiri și locuri sfinte, însoțite de ghizi specializați.',
      icon: '🛣️'
    },
    {
      title: 'Calendar Ortodox',
      description: 'Calendar complet cu sărbătorile ortodoxe, zile de post și sfinți importanți din tradiția ortodoxă.',
      icon: '📅'
    },
    {
      title: 'Comunitate spirituală',
      description: 'Conectează-te cu alți credincioși, împărtășește experiențe și participă la evenimente spirituale.',
      icon: '🤝'
    },
    {
      title: 'Asistent AI',
      description: 'Utilizează asistentul nostru AI pentru a găsi informații precise despre tradiții, sărbători și pelerinaje.',
      icon: '🤖'
    }
  ];

  const featureCards = features.map(feature => 
    createElement('div', { className: 'feature-card' },
      createElement('div', { className: 'feature-icon' }, feature.icon),
      createElement('h3', null, feature.title),
      createElement('p', null, feature.description)
    )
  );

  return createElement('section', { className: 'features' },
    createElement('div', { className: 'container' },
      createElement('div', { className: 'section-title' },
        createElement('h2', null, 'Explorați credința cu DOXA'),
        createElement('p', null, 'Platforma care te ghidează în călătoria spirituală, oferindu-ți acces la pelerinaje și tradiții ortodoxe.')
      ),
      createElement('div', { className: 'features-grid' }, ...featureCards)
    )
  );
}

function createFeaturedPilgrimagesSection() {
  // Verificăm dacă avem pelerinaje disponibile
  if (!appState.featuredPilgrimages.length) {
    return null;
  }

  const pilgrimageCards = appState.featuredPilgrimages.map(pilgrimage => {
    const startDate = new Date(pilgrimage.startDate).toLocaleDateString('ro-RO');
    const endDate = new Date(pilgrimage.endDate).toLocaleDateString('ro-RO');
    
    return createElement('div', { className: 'pilgrimage-card' },
      createElement('div', { className: 'pilgrimage-image' },
        createElement('img', { src: pilgrimage.coverImage || '/images/default-pilgrimage.jpg', alt: pilgrimage.title })
      ),
      createElement('div', { className: 'pilgrimage-content' },
        createElement('h3', { className: 'pilgrimage-title' }, pilgrimage.title),
        createElement('div', { className: 'pilgrimage-meta' },
          createElement('span', null, `${startDate} - ${endDate}`),
          createElement('span', null, pilgrimage.location)
        ),
        createElement('p', { className: 'pilgrimage-description' }, pilgrimage.description.substring(0, 120) + '...'),
        createElement('div', { className: 'pilgrimage-footer' },
          createElement('span', { className: 'pilgrimage-price' }, `${pilgrimage.price} lei`),
          createElement('a', { href: `/pilgrimages/${pilgrimage.id}`, className: 'btn btn-primary' }, 'Detalii')
        )
      )
    );
  });

  return createElement('section', { className: 'pilgrimages' },
    createElement('div', { className: 'container' },
      createElement('div', { className: 'section-title' },
        createElement('h2', null, 'Pelerinaje promovate'),
        createElement('p', null, 'Călătorii spirituale organizate cu grijă pentru o experiență de neuitat')
      ),
      createElement('div', { className: 'pilgrimages-grid' }, ...pilgrimageCards)
    )
  );
}

function createMonasteriesSection() {
  // Verificăm dacă avem mănăstiri disponibile
  if (!appState.monasteries.length) {
    return null;
  }

  const monasteryCards = appState.monasteries.map(monastery => {
    return createElement('div', { className: 'monastery-card' },
      createElement('div', { className: 'monastery-image' },
        createElement('img', { src: monastery.coverImage || '/images/default-monastery.jpg', alt: monastery.name })
      ),
      createElement('div', { className: 'monastery-content' },
        createElement('h3', { className: 'monastery-title' }, monastery.name),
        createElement('div', { className: 'monastery-location' },
          createElement('span', null, `${monastery.city}, ${monastery.region}`)
        ),
        createElement('p', { className: 'monastery-description' }, monastery.shortDescription || monastery.description.substring(0, 100) + '...'),
        createElement('a', { href: `/monasteries/${monastery.id}`, className: 'btn btn-outline' }, 'Vizitează')
      )
    );
  });

  return createElement('section', { className: 'monasteries' },
    createElement('div', { className: 'container' },
      createElement('div', { className: 'section-title' },
        createElement('h2', null, 'Mănăstiri remarcabile'),
        createElement('p', null, 'Explorează frumusețea și istoria mănăstirilor ortodoxe')
      ),
      createElement('div', { className: 'monasteries-grid' }, ...monasteryCards)
    )
  );
}

function createCallToActionSection() {
  return createElement('section', { className: 'cta-section' },
    createElement('div', { className: 'container text-center', style: { padding: '4rem 0' } },
      createElement('h2', { className: 'text-primary', style: { marginBottom: '1rem' } }, 'Pregătit pentru o călătorie spirituală?'),
      createElement('p', { style: { marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' } }, 
        'Rezervă acum și beneficiază de ofertele noastre speciale pentru pelerinaje în locuri sfinte'
      ),
      createElement('a', { href: '/pilgrimages', className: 'btn btn-primary' }, 'Descoperă pelerinaje')
    )
  );
}

function createFooter() {
  return createElement('footer', { className: 'footer' },
    createElement('div', { className: 'container' },
      createElement('div', { className: 'footer-grid' },
        // Coloana brand
        createElement('div', { className: 'footer-brand' },
          createElement('a', { href: '/' }, 'DOXA'),
          createElement('p', null, 'Platformă dedicată călătoriilor spirituale și tradițiilor ortodoxe, oferind acces la pelerinaje, mănăstiri și resurse spirituale.'),
          createElement('div', { className: 'footer-social' },
            createElement('a', { href: '#', 'aria-label': 'Facebook' }, '📱'),
            createElement('a', { href: '#', 'aria-label': 'Instagram' }, '📷'),
            createElement('a', { href: '#', 'aria-label': 'YouTube' }, '📺')
          )
        ),
        
        // Coloana pelerinaje
        createElement('div', { className: 'footer-links' },
          createElement('h3', null, 'Pelerinaje'),
          createElement('ul', null,
            createElement('li', null, createElement('a', { href: '/pilgrimages' }, 'Toate pelerinajele')),
            createElement('li', null, createElement('a', { href: '/pilgrimages?featured=true' }, 'Pelerinaje promovate')),
            createElement('li', null, createElement('a', { href: '/pilgrimages?upcoming=true' }, 'Pelerinaje viitoare')),
            createElement('li', null, createElement('a', { href: '/organizer/register' }, 'Devino organizator'))
          )
        ),
        
        // Coloana mănăstiri
        createElement('div', { className: 'footer-links' },
          createElement('h3', null, 'Mănăstiri'),
          createElement('ul', null,
            createElement('li', null, createElement('a', { href: '/monasteries' }, 'Toate mănăstirile')),
            createElement('li', null, createElement('a', { href: '/monasteries?region=moldova' }, 'Mănăstiri din Moldova')),
            createElement('li', null, createElement('a', { href: '/monasteries?region=muntenia' }, 'Mănăstiri din Muntenia')),
            createElement('li', null, createElement('a', { href: '/monasteries?region=transilvania' }, 'Mănăstiri din Transilvania'))
          )
        ),
        
        // Coloana resurse
        createElement('div', { className: 'footer-links' },
          createElement('h3', null, 'Resurse'),
          createElement('ul', null,
            createElement('li', null, createElement('a', { href: '/calendar' }, 'Calendar ortodox')),
            createElement('li', null, createElement('a', { href: '/fasting-recipes' }, 'Rețete de post')),
            createElement('li', null, createElement('a', { href: '/doxa-ai' }, 'Asistent DOXA AI')),
            createElement('li', null, createElement('a', { href: '/about' }, 'Despre noi'))
          )
        )
      ),
      
      createElement('div', { className: 'footer-bottom' },
        createElement('p', null, '© 2025 DOXA. Toate drepturile rezervate.'),
        createElement('p', null,
          createElement('a', { href: '/terms' }, 'Termeni și condiții'),
          ' | ',
          createElement('a', { href: '/privacy' }, 'Politica de confidențialitate'),
          ' | ',
          createElement('a', { href: '/cookies' }, 'Politica de cookies')
        )
      )
    )
  );
}

// Funcție pentru a crea întreaga pagină
function createDoxaApp() {
  if (appState.loading) {
    return createElement('div', { className: 'loading-container' },
      createElement('div', { className: 'loading-box' },
        createElement('h1', null, 'DOXA'),
        createElement('p', null, 'Platformă de Pelerinaje Ortodoxe'),
        createElement('div', { className: 'spinner' }),
        createElement('p', null, 'Aplicația se încarcă...')
      )
    );
  }

  // Componentele paginii principale
  return createElement('div', { className: 'app-container' },
    createNavbar(),
    createHeroSection(),
    createFeaturesSection(),
    createFeaturedPilgrimagesSection(),
    createMonasteriesSection(),
    createCallToActionSection(),
    createFooter()
  );
}

// Încarcă date pentru pelerinaje promovate
function loadFeaturedPilgrimages() {
  fetch('/api/pilgrimages?featured=true')
    .then(response => response.json())
    .then(data => {
      appState.featuredPilgrimages = Array.isArray(data) ? data.slice(0, 3) : [];
      renderApp();
    })
    .catch(error => {
      console.error('Eroare la încărcarea pelerinajelor promovate:', error);
      appState.featuredPilgrimages = [];
    });
}

// Încarcă date pentru mănăstiri
function loadMonasteries() {
  fetch('/api/monasteries?limit=4')
    .then(response => response.json())
    .then(data => {
      appState.monasteries = Array.isArray(data) ? data.slice(0, 4) : [];
      renderApp();
    })
    .catch(error => {
      console.error('Eroare la încărcarea mănăstirilor:', error);
      appState.monasteries = [];
    });
}

// Verificare stare server și încărcare date
function checkServerStatus() {
  appState.loading = true;
  renderApp();
  
  fetch('/api/server-status')
    .then(response => response.json())
    .then(data => {
      appState.status = 'online';
      appState.loading = false;
      
      // După ce am verificat statusul, încărcăm datele
      loadFeaturedPilgrimages();
      loadMonasteries();
    })
    .catch(error => {
      console.error('Eroare la verificarea statusului serverului:', error);
      appState.status = 'offline';
      appState.loading = false;
      renderApp();
    });
}

// Funcție pentru randarea aplicației
function renderApp() {
  const container = document.getElementById("root");
  if (container) {
    // Ștergem conținutul anterior
    container.innerHTML = '';
    // Adăugăm noua interfață
    container.appendChild(createDoxaApp());
    console.log("Aplicația DOXA a fost inițializată cu succes");
  } else {
    console.error("Elementul root nu a fost găsit");
  }
}

// Inițializam aplicația când DOM-ul este încărcat
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Prima randare cu starea inițială (loading)
    appState.loading = true;
    renderApp();
    
    // Verificăm statutul serverului și încărcăm datele
    setTimeout(checkServerStatus, 1000);
  } catch (error) {
    console.error("Eroare la inițializarea aplicației DOXA:", error);
    
    // Afișăm un mesaj de eroare user-friendly
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div class="card" style="max-width: 800px; margin: 50px auto;">
          <h2 style="color: #e74c3c;">Eroare la inițializarea aplicației</h2>
          <p>A apărut o eroare la încărcarea aplicației. Detalii în consola browser-ului.</p>
          <p>Eroare: ${error.message}</p>
          <div style="margin-top: 20px;">
            <button onclick="location.reload()" class="btn">Reîncarcă pagina</button>
          </div>
        </div>
      `;
    }
  }
});