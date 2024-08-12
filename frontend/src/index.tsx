import getRoutes from './auto-get-routes'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import './global.css'
import { TinyBaseProvider } from './tools/TinyBaseProvider'

const routes = getRoutes()

const router = createBrowserRouter(routes)

function App() {
  return (
    <TinyBaseProvider>
      <RouterProvider router={router} />
    </TinyBaseProvider>
  )
}
const rootElement = document.getElementById('react-root');

const root = ReactDOM.createRoot(rootElement);
root.render(<App />);