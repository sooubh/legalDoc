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
import LawyerCardSkeleton from "../mapsComponents/LawyerCardSkeleton";

type AppView = "search" | "analyze";

export default function LawyerLocatorPage() {
  const [view, setView] = useState<AppView>("search");
  const [userLocation, setUserLocation] =
    useState<GeolocationCoordinates | null>(null);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [displayedLawyers, setDisplayedLawyers] = useState<Lawyer[]>([]);
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSearching, setIsSearching] = useState<boolean>(false);
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
    setIsSearching(true);
    setError(null);
    setLawyers([]);
    setDisplayedLawyers([]);
    setSuggestions([]);
    try {
      const results = await findLawyersNearMe(specialty, userLocation);
      setLawyers(results);
      
      // Display results progressively (one by one)
      if (results.length > 0) {
        for (let i = 0; i < results.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 150)); // Small delay between each
          setDisplayedLawyers(prev => [...prev, results[i]]);
        }
      } else {
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
      setIsSearching(false);
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
    <div className="min-h-screen bg-background font-sans text-foreground">
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

            {isSearching && displayedLawyers.length === 0 && !error && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <p className="text-lg text-muted-foreground font-medium">
                    {userLocation
                      ? `Finding ${searchQuery} lawyers...`
                      : "Accessing your location..."}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <LawyerCardSkeleton key={i} />
                  ))}
                </div>
              </div>
            )}

            {isSearching && displayedLawyers.length > 0 && (
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">
                  Found {displayedLawyers.length} of {lawyers.length} lawyers...
                </p>
              </div>
            )}

            {error && (
              <p className="text-center text-destructive bg-destructive/10 p-4 rounded-lg mt-6 border border-destructive/20">
                {error}
              </p>
            )}

            {!isSearching &&
              lawyers.length === 0 &&
              displayedLawyers.length === 0 &&
              !locationError &&
              !searchQuery && (
                <div className="text-center p-12 bg-card rounded-xl shadow-sm mt-6 border border-border">
                  <h2 className="text-2xl font-bold text-card-foreground">
                    Welcome to Lawyer Locator AI
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    Enter a legal specialty (e.g., "family law," "personal
                    injury") to find lawyers near you.
                  </p>
                </div>
              )}

            {!isSearching && lawyers.length === 0 && displayedLawyers.length === 0 && searchQuery && !error && (
              <div className="text-center p-12 bg-card rounded-xl shadow-sm mt-6 border border-border">
                <h2 className="text-2xl font-bold text-card-foreground">
                  No Results Found
                </h2>
                <p className="mt-2 text-muted-foreground">
                  We couldn't find any lawyers for "{searchQuery}".
                </p>
                {suggestions.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-card-foreground font-semibold">
                      Try searching for:
                    </h3>
                    <div className="flex flex-wrap justify-center gap-2 mt-3">
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-colors text-sm font-medium"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <LawyerList 
              lawyers={displayedLawyers} 
              onSelectLawyer={setSelectedLawyer}
              isLoading={isSearching && displayedLawyers.length < lawyers.length}
              remainingCount={Math.max(0, lawyers.length - displayedLawyers.length)}
            />
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
