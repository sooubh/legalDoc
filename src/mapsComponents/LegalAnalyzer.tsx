import React, { useState } from 'react';
import Spinner from './Spinner';
import { SearchIcon } from './Icons';

interface AnalysisResult {
    analysis: string;
    specialty: string;
}

interface LegalAnalyzerProps {
    onAnalyze: (text: string) => Promise<AnalysisResult>;
    loading: boolean;
    onSearchSpecialty: (specialty: string) => void;
}

const LegalAnalyzer: React.FC<LegalAnalyzerProps> = ({ onAnalyze, loading, onSearchSpecialty }) => {
    const [text, setText] = useState('');
    const [result, setResult] = useState<AnalysisResult | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setResult(null);
        const analysisResult = await onAnalyze(text);
        setResult(analysisResult);
    };

    return (
        <div className="bg-card p-6 sm:p-8 rounded-xl shadow-lg border border-border">
            <h2 className="text-2xl sm:text-3xl font-bold text-card-foreground">Legal Document Analyzer</h2>
            <p className="mt-2 text-muted-foreground">
                Paste any legal text below and our AI will provide a simplified summary, identify key points, and suggest the relevant legal specialty.
            </p>

            <form onSubmit={handleSubmit} className="mt-6">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste your legal document, clause, or question here..."
                    className="w-full h-64 p-4 bg-background text-foreground border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring transition-shadow placeholder:text-muted-foreground"
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading || !text.trim()}
                    className="mt-4 w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
                >
                    {loading && !result ? <Spinner /> : 'Analyze Text'}
                </button>
            </form>

            {loading && !result && (
                <div className="text-center p-8">
                    <Spinner />
                    <p className="mt-4 text-muted-foreground">Analyzing your document...</p>
                </div>
            )}

            {result && result.analysis && (
                <div className="mt-8 border-t border-border pt-6">
                    <h3 className="text-xl font-semibold text-card-foreground mb-4">Analysis Result</h3>
                    <div 
                        className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h3:text-lg prose-p:text-muted-foreground prose-strong:text-card-foreground" 
                        dangerouslySetInnerHTML={{ __html: result.analysis.replace(/\n/g, '<br />') }} 
                    />

                    {result.specialty && !result.analysis.startsWith('Error:') && (
                        <div className="mt-8 p-4 bg-primary/10 rounded-lg border border-primary/20">
                            <h4 className="font-semibold text-primary">Suggested Legal Specialty:</h4>
                            <p className="text-primary text-lg font-medium my-2">{result.specialty}</p>
                            <button
                                onClick={() => onSearchSpecialty(result.specialty)}
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors"
                            >
                                <SearchIcon className="h-4 w-4 mr-2" />
                                Find a {result.specialty} Lawyer Near Me
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LegalAnalyzer;