import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { SourceProvider } from './state/SourceContext.jsx';
import { TasteProvider } from './state/TasteContext.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SourceProvider>
        <TasteProvider>
          <App />
        </TasteProvider>
      </SourceProvider>
    </BrowserRouter>
  </StrictMode>
);
