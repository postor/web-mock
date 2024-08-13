import getRoutes from './auto-get-routes'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import './global.css'
import { TinyBaseProvider } from './tools/TinyBaseProvider'
import { RecoilRoot } from 'recoil'

const routes = getRoutes()

const router = createBrowserRouter(routes)

function App() {
  return (
    <RecoilRoot>
      <TinyBaseProvider>
        <RouterProvider router={router} />
      </TinyBaseProvider>
    </RecoilRoot>
  )
}
const rootElement = document.getElementById('react-root');

const root = ReactDOM.createRoot(rootElement);
root.render(<App />);