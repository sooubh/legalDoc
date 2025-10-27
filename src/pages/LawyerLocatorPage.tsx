"use client";
import React, { useState, useCallback, useEffect } from "react";
import { Lawyer, GeolocationCoordinates } from "../types/mapsTypes";
import {
  findLawyersNearMe,
  analyzeLegalText,
  getRelatedSpecialties,
} from "../services/geminiMapService";
import Header from "../mapsComponents/Header";
import LawyerSearch from "../mapsComponents/LawyerSearch";
import LawyerList from "../mapsComponents/LawyerList";
import LawyerDetailModal from "../mapsComponents/LawyerDetailModal";
import LegalAnalyzer from "../mapsComponents/LegalAnalyzer";
import Spinner from "../mapsComponents/Spinner";

type AppView = "search" | "analyze";

export default function LawyerLocatorPage() {
  const [view, setView] = useState<AppView>("search");
  const [userLocation, setUserLocation] =
    useState<GeolocationCoordinates | null>(null);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const getLocation = useCallback(() => {
    setIsLoading(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsLoading(false);
      },
      (err) => {
        setLocationError(
          `Error getting location: ${err.message}. Please enable location services or search manually.`
        );
        setError(
          `Error getting location: ${err.message}. Please enable location services or search manually.`
        );
        setIsLoading(false);
      },
      { timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  const handleSearch = async (specialty: string) => {
    if (!specialty) return;
    if (!userLocation) {
      setError(
        "Could not determine your location. Please ensure location services are enabled."
      );
      getLocation();
      return;
    }
    setIsLoading(true);
    setError(null);
    setLawyers([]);
    setSuggestions([]);
    try {
      const results = await findLawyersNearMe(specialty, userLocation);
      setLawyers(results);
      if (results.length === 0) {
        const newSuggestions = await getRelatedSpecialties(specialty);
        setSuggestions(newSuggestions);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unknown error occurred during search."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async (
    text: string
  ): Promise<{ analysis: string; specialty: string }> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeLegalText(text);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unknown error occurred during analysis.";
      setError(errorMessage);
      return {
        analysis: `Error: ${errorMessage}`,
        specialty: "",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchFromAnalyzer = (specialty: string) => {
    setSearchQuery(specialty);
    setView("search");
    handleSearch(specialty);
  };

  const handleSuggestionClick = (specialty: string) => {
    setSearchQuery(specialty);
    handleSearch(specialty);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 font-sans">
      <Header currentView={view} setView={setView} />

      <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
        {view === "search" && (
          <>
            <LawyerSearch
              query={searchQuery}
              onQueryChange={setSearchQuery}
              onSearch={() => handleSearch(searchQuery)}
              loading={isLoading}
              locationError={locationError}
            />

            {isLoading && lawyers.length === 0 && !error && (
              <div className="text-center p-12">
                <Spinner />
                <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
                  {userLocation
                    ? `Finding ${searchQuery} lawyers...`
                    : "Accessing your location..."}
                </p>
              </div>
            )}

            {error && (
              <p className="text-center text-red-600 bg-red-100 p-4 rounded-lg mt-6">
                {error}
              </p>
            )}

            {!isLoading &&
              lawyers.length === 0 &&
              !locationError &&
              !searchQuery && (
                <div className="text-center p-12 bg-white dark:bg-slate-800 rounded-xl shadow-sm mt-6">
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                    Welcome to Lawyer Locator AI
                  </h2>
                  <p className="mt-2 text-slate-600 dark:text-slate-300">
                    Enter a legal specialty (e.g., "family law," "personal
                    injury") to find lawyers near you.
                  </p>
                </div>
              )}

            {!isLoading && lawyers.length === 0 && searchQuery && !error && (
              <div className="text-center p-12 bg-white dark:bg-slate-800 rounded-xl shadow-sm mt-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                  No Results Found
                </h2>
                <p className="mt-2 text-slate-600 dark:text-slate-300">
                  We couldn't find any lawyers for "{searchQuery}".
                </p>
                {suggestions.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-slate-700 dark:text-slate-300 font-semibold">
                      Try searching for:
                    </h3>
                    <div className="flex flex-wrap justify-center gap-2 mt-3">
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-full hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <LawyerList lawyers={lawyers} onSelectLawyer={setSelectedLawyer} />
          </>
        )}

        {view === "analyze" && (
          <LegalAnalyzer
            onAnalyze={handleAnalyze}
            loading={isLoading}
            onSearchSpecialty={handleSearchFromAnalyzer}
          />
        )}
      </main>

      {selectedLawyer && (
        <LawyerDetailModal
          lawyer={selectedLawyer}
          onClose={() => setSelectedLawyer(null)}
        />
      )}
    </div>
  );
}
