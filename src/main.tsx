
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Use our Supabase client from the customClient file throughout the app
import './integrations/supabase/customClient'

createRoot(document.getElementById("root")!).render(<App />);
