import React from 'react';
import { Scale, Shield, Heart, AlertTriangle } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Scale className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">LegalEase AI</h3>
                <p className="text-gray-400 text-sm">Demystifying Legal Documents</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Empowering individuals and businesses to understand legal documents through 
              AI-powered analysis and plain-language explanations.
            </p>
          </div>

          {/* Trusted Sources */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Trusted Sources
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Indian Contract Act, 1872</li>
              <li>• Copyright Act, 1957</li>
              <li>• Companies Act, 2013</li>
              <li>• Consumer Protection Act, 2019</li>
              <li>• Information Technology Act, 2000</li>
            </ul>
          </div>

          {/* Legal Notice */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Important Notice</h4>
            <div className="text-sm text-gray-400 space-y-2">
              <p className="flex items-start">
                <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 text-amber-500 flex-shrink-0" />
                This platform provides educational information only and does not constitute legal advice.
              </p>
              <p>
                Always consult with qualified legal professionals for specific legal matters 
                and before making important decisions.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-400 text-sm">
            © 2025 LegalEase AI. Educational tool for legal document understanding.
          </p>
          <div className="flex items-center text-gray-400 text-sm mt-4 md:mt-0">
            <span>Made with</span>
            <Heart className="h-4 w-4 mx-1 text-red-500" />
            <span>for legal clarity</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;