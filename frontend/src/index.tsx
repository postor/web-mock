import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
// Requirement: import routes
import routes from 'route-views'

const router = createBrowserRouter(routes)

function App() {
  return (
    <RouterProvider
      router={router}
    />
  )
}
const rootElement = document.getElementById('react-root');

const root = ReactDOM.createRoot(rootElement);
root.render(<App />);