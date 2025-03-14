// Funcție pentru inițializarea aplicației
function initializeApp() {
  // Găsim elementul root
  const container = document.getElementById("root");
  
  // Verificăm dacă există
  if (!container) {
    console.error("Elementul root nu a fost găsit!");
    return;
  }
  
  try {
    // Curățăm conținutul container-ului
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    
    // Adăugăm elementele pentru aplicația noastră React simplificată
    const appElement = createAppElement();
    container.appendChild(appElement);
    
    console.log("Aplicația React a fost inițializată cu succes");
  } catch (error) {
    console.error("Eroare la inițializarea aplicației:", error);
  }
}

// Funcție pentru crearea elementelor DOM ale aplicației
function createAppElement() {
  // Container principal
  const appContainer = document.createElement('div');
  appContainer.className = 'app-container';
  
  // Header
  const header = document.createElement('header');
  header.className = 'app-header';
  
  const title = document.createElement('h1');
  title.textContent = 'DOXA - Versiunea React';
  
  const subtitle = document.createElement('p');
  subtitle.textContent = 'Aplicația a fost încărcată cu succes!';
  
  header.appendChild(title);
  header.appendChild(subtitle);
  
  // Main content
  const main = document.createElement('main');
  main.className = 'app-main';
  
  // Card
  const card = document.createElement('div');
  card.className = 'card';
  
  const cardTitle = document.createElement('h2');
  cardTitle.textContent = 'Diagnosticare completă';
  
  const cardText = document.createElement('p');
  cardText.textContent = 'Această pagină reprezintă o versiune simplificată a aplicației DOXA, folosită pentru a verifica funcționalitatea de bază.';
  
  card.appendChild(cardTitle);
  card.appendChild(cardText);
  
  // Links container
  const linksContainer = document.createElement('div');
  linksContainer.className = 'links-container';
  
  const link1 = document.createElement('a');
  link1.href = '/client/index.html';
  link1.className = 'btn';
  link1.textContent = 'Înapoi la aplicația completă';
  
  const link2 = document.createElement('a');
  link2.href = '/api/server-status';
  link2.className = 'btn';
  link2.textContent = 'Verificare API';
  
  linksContainer.appendChild(link1);
  linksContainer.appendChild(link2);
  
  // Asamblăm totul
  main.appendChild(card);
  main.appendChild(linksContainer);
  
  appContainer.appendChild(header);
  appContainer.appendChild(main);
  
  return appContainer;
}

// Pornim aplicația când documentul este încărcat
document.addEventListener('DOMContentLoaded', initializeApp);

// Pornim aplicația și în cazul în care documentul este deja încărcat
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initializeApp();
}