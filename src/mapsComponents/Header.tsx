
import React from 'react';

interface HeaderProps {
    currentView: 'search' | 'analyze';
    setView: (view: 'search' | 'analyze') => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
    const activeTabClass = "border-b-2 border-indigo-500 text-indigo-600";
    const inactiveTabClass = "text-slate-500 hover:text-slate-700";

    return (
        <header className="bg-white shadow-md sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 01-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Lawyer Locator <span className="text-indigo-600">AI</span></h1>
                    </div>
                    <nav className="flex space-x-4 sm:space-x-8">
                        <button 
                            onClick={() => setView('search')}
                            className={`py-2 px-1 text-sm sm:text-base font-medium transition-colors duration-200 ${currentView === 'search' ? activeTabClass : inactiveTabClass}`}>
                            Find a Lawyer
                        </button>
                        <button 
                            onClick={() => setView('analyze')}
                            className={`py-2 px-1 text-sm sm:text-base font-medium transition-colors duration-200 ${currentView === 'analyze' ? activeTabClass : inactiveTabClass}`}>
                            Analyze Document
                        </button>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
