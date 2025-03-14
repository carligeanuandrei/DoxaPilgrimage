// Implementare simplificată fără a folosi direct Preact
// Folosim DOM API standard pentru a construi interfața
// Această abordare este mai robustă pentru debugging inițial

// Funcție helper pentru crearea elementelor DOM - similar cu createElement sau h din React/Preact
function h(tag, props, ...children) {
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

// Simplificare a funcției render din biblioteca React/Preact
function render(element, container) {
  container.innerHTML = '';
  container.appendChild(element);
}

// Stare simplă pentru aplicație
const loading = false;
const status = 'online';
// Importul de CSS trebuie făcut diferit, nu ca modul ES
// Vom adăuga CSS-ul direct în HTML

// Componentă simplă Doxa pentru pagina principală
function DoxaApp() {
  // În versiunea simplificată, folosim starea declarată direct
  // În loc de hooks pentru a simplifica implementarea inițială

  // Dacă încărcarea e în curs, afișăm un indicator
  if (loading) {
    return h('div', { className: 'loading-container' },
      h('div', { className: 'loading-box' },
        h('h1', null, 'DOXA'),
        h('p', null, 'Platformă de Pelerinaje Ortodoxe'),
        h('div', { className: 'spinner' }),
        h('p', null, 'Aplicația se încarcă...')
      )
    );
  }

  return h('div', { className: 'card' },
    h('h1', { style: { color: '#3b5998' } }, 'DOXA - Platformă de Pelerinaje Ortodoxe'),
    h('p', null, 'Aplicația DOXA a fost încărcată cu succes în varianta simplificată!'),
    h('p', null, `Status server: `, 
      h('span', { style: { 
        color: status === 'online' ? '#27ae60' : '#e74c3c',
        fontWeight: 'bold'
      }}, status === 'online' ? 'Online' : 'Offline')
    ),
    
    h('div', { style: { marginTop: '20px' } },
      h('h2', null, 'Funcționalități DOXA:'),
      h('ul', null,
        h('li', null, 'Informații despre mănăstiri ortodoxe'),
        h('li', null, 'Calendar ortodox și sărbători'),
        h('li', null, 'Organizare și rezervare pelerinaje'),
        h('li', null, 'Asistent AI pentru planificarea călătoriilor religioase')
      )
    ),
    
    h('div', { style: { marginTop: '30px' } },
      h('h3', null, 'Navigare:'),
      h('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap' } },
        h('a', { 
          href: '/client/check-frontend.html',
          className: 'btn'
        }, 'Diagnostic Frontend'),
        
        h('a', { 
          href: '/api/server-status/html',
          className: 'btn btn-secondary'
        }, 'Status Server')
      )
    )
  );
}

// Inițializarea aplicației
try {
  const container = document.getElementById("root");
  if (container) {
    render(h(DoxaApp, null), container);
    console.log("Aplicația Preact a fost inițializată cu succes");
  } else {
    console.error("Elementul root nu a fost găsit");
  }
} catch (error) {
  console.error("Eroare la inițializarea aplicației Preact:", error);
  
  // Afișăm un mesaj de eroare user-friendly
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div class="card" style="max-width: 800px; margin: 50px auto;">
        <h2 style="color: #e74c3c;">Eroare la inițializarea aplicației</h2>
        <p>A apărut o eroare la încărcarea aplicației. Detalii în consola browser-ului.</p>
        <div style="margin-top: 20px;">
          <button onclick="location.reload()" class="btn">Reîncarcă pagina</button>
        </div>
      </div>
    `;
  }
}
