// Fișier compatibilitate pentru Vite/ReactDOM
// Acest fișier adaugă suport pentru JSX în browserele care nu suportă direct
// Este folosit pentru a transpila JSX la JavaScript vanilla

(function() {
  if (!window.React) {
    window.React = {
      createElement: function(type, props, ...children) {
        if (typeof type === 'function') {
          try {
            return type(props || {}, ...children);
          } catch (e) {
            console.error('Error rendering component:', e);
            return document.createElement('div');
          }
        }
        
        const element = document.createElement(type);
        
        if (props) {
          Object.entries(props || {}).forEach(([name, value]) => {
            if (name === 'className') {
              element.className = value;
            } else if (name === 'style' && typeof value === 'object') {
              Object.assign(element.style, value);
            } else if (name.startsWith('on') && typeof value === 'function') {
              const eventName = name.toLowerCase().substring(2);
              element.addEventListener(eventName, value);
            } else if (name !== 'children') {
              element.setAttribute(name, value);
            }
          });
        }
        
        const flattenChildren = (childs) => {
          return childs.reduce((acc, child) => {
            if (Array.isArray(child)) {
              return [...acc, ...flattenChildren(child)];
            }
            return [...acc, child];
          }, []);
        };
        
        const allChildren = flattenChildren(children);
        
        allChildren.forEach(child => {
          if (child == null || child === false) {
            // Nu face nimic pentru valori nule sau false
          } else if (typeof child === 'string' || typeof child === 'number') {
            element.appendChild(document.createTextNode(child));
          } else if (child instanceof Node) {
            element.appendChild(child);
          } else if (child && typeof child === 'object') {
            try {
              element.appendChild(child);
            } catch (e) {
              console.error('Failed to append child:', child, e);
              if (typeof child.toString === 'function') {
                element.appendChild(document.createTextNode(child.toString()));
              }
            }
          } else {
            console.warn('Unhandled child type:', typeof child, child);
          }
        });
        
        return element;
      },
      
      Fragment: function(props) {
        const fragment = document.createDocumentFragment();
        (props.children || []).forEach(child => {
          if (child instanceof Node) {
            fragment.appendChild(child);
          } else if (typeof child === 'string' || typeof child === 'number') {
            fragment.appendChild(document.createTextNode(child));
          }
        });
        return fragment;
      }
    };
  }
  
  if (!window.ReactDOM) {
    window.ReactDOM = {
      createRoot: function(container) {
        return {
          render: function(element) {
            container.innerHTML = '';
            if (element instanceof Node) {
              container.appendChild(element);
            } else {
              console.error('Invalid React element to render:', element);
            }
          }
        };
      }
    };
  }
  
  console.log('Vite/React compatibility layer loaded');
})();