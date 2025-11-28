import React, { useState, useEffect } from 'react';
import { fetchContinents } from '../services/apiClient';

export default function ContinentTest() {
  const [continents, setContinents] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContinents = async () => {
      try {
        console.log("🧪 ContinentTest: Loading continents...");
        setLoading(true);
        setError(null);
        
        const continentsList = await fetchContinents();
        console.log("🧪 ContinentTest: Continents loaded:", continentsList);
        
        setContinents(continentsList);
      } catch (err) {
        console.error("🧪 ContinentTest: Failed to fetch continents:", err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadContinents();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Continent Loading Test</h2>
      
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Status:</h3>
        <p className="text-sm">
          Loading: {loading ? "✅ Yes" : "❌ No"} | 
          Error: {error ? `❌ ${error}` : "✅ None"} | 
          Count: {continents.length}
        </p>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Continents Array:</h3>
        <pre className="bg-gray-100 p-2 rounded text-xs">
          {JSON.stringify(continents, null, 2)}
        </pre>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Dropdown Test:</h3>
        <select 
          className="w-full border border-gray-300 rounded px-3 py-2"
          disabled={loading || continents.length === 0}
        >
          <option value="">
            {loading 
              ? "🔄 Loading continents..." 
              : continents.length === 0 
                ? "❌ No continents available" 
                : `🌍 Select Continent (${continents.length} available)`
            }
          </option>
          {continents.map((continent) => (
            <option key={continent} value={continent}>
              {continent}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}