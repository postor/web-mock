import LeftNav from '../components/layout/let-nav/LeftNav';
import { Outlet } from 'react-router-dom';

export default () => {
    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-gray-800 text-white py-4 shadow-md">
                <div className="container mx-auto text-xl font-semibold">
                    web-mock
                </div>
            </header>
            <div className="flex-1 flex container mx-auto">
                <nav className="w-64 bg-gray-100 p-4 border-r">
                    <LeftNav />
                </nav>
                <main className="flex-1 p-6 bg-gray-50">
                    <Outlet />
                </main>
            </div>
            <footer className="bg-gray-800 text-white py-4 mt-auto">
                <div className="container mx-auto text-sm text-center">
                    <a href="https://github.com/postor/web-mock" className="underline">
                        https://github.com/postor/web-mock
                    </a>
                </div>
            </footer>
        </div>
    );
};
