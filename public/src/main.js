// Implementare simplificată JavaScript pentru DOXA
// Folosește DOM API direct pentru o abordare mai robustă

// Stare simplă pentru aplicație
const appState = {
  loading: false,
  status: 'online'
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

// Funcție pentru a crea UI-ul aplicației
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

  return createElement('div', { className: 'card' },
    createElement('h1', { style: { color: '#3b5998' } }, 'DOXA - Platformă de Pelerinaje Ortodoxe'),
    createElement('p', null, 'Aplicația DOXA a fost încărcată cu succes în varianta simplificată!'),
    createElement('p', null, 'Status server: ', 
      createElement('span', { style: { 
        color: appState.status === 'online' ? '#27ae60' : '#e74c3c',
        fontWeight: 'bold'
      }}, appState.status === 'online' ? 'Online' : 'Offline')
    ),
    
    createElement('div', { style: { marginTop: '20px' } },
      createElement('h2', null, 'Funcționalități DOXA:'),
      createElement('ul', null,
        createElement('li', null, 'Informații despre mănăstiri ortodoxe'),
        createElement('li', null, 'Calendar ortodox și sărbători'),
        createElement('li', null, 'Organizare și rezervare pelerinaje'),
        createElement('li', null, 'Asistent AI pentru planificarea călătoriilor religioase')
      )
    ),
    
    createElement('div', { style: { marginTop: '30px' } },
      createElement('h3', null, 'Navigare:'),
      createElement('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap' } },
        createElement('a', { 
          href: '/diagnoza.html',
          className: 'btn'
        }, 'Diagnostic Frontend'),
        
        createElement('a', { 
          href: '/api/server-status/html',
          className: 'btn btn-secondary'
        }, 'Status Server')
      )
    )
  );
}

// Verificare stare server la încărcare
function checkServerStatus() {
  appState.loading = true;
  
  fetch('/api/server-status')
    .then(response => response.json())
    .then(data => {
      appState.status = 'online';
      appState.loading = false;
      renderApp();
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
    // Prima randare cu starea inițială
    renderApp();
    
    // Verificăm statutul serverului
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