'use client'

import { Check } from "lucide-react"

const CITY_DATA: Record<string, string[]> = {
  'North America': [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
    'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
    'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis',
    'Seattle', 'Denver', 'Washington DC'
  ],
  'Europe': [
    'London', 'Paris', 'Berlin', 'Madrid', 'Rome', 'Milan', 'Barcelona',
    'Munich', 'Amsterdam', 'Brussels', 'Vienna', 'Zurich', 'Stockholm',
    'Copenhagen', 'Dublin', 'Oslo', 'Helsinki', 'Warsaw', 'Prague', 'Budapest'
  ],
  'Asia Pacific': [
    'Tokyo', 'Shanghai', 'Delhi', 'Mumbai', 'Beijing', 'Singapore', 'Seoul',
    'Jakarta', 'Manila', 'Bangkok', 'Kuala Lumpur', 'Shenzhen', 'Guangzhou',
    'Ho Chi Minh City', 'Osaka', 'Sydney', 'Melbourne', 'Taipei', 'Bangalore', 'Hyderabad', 'Hong Kong'
  ],
  'Latin America': [
    'São Paulo', 'Mexico City', 'Buenos Aires', 'Rio de Janeiro', 'Lima',
    'Bogotá', 'Santiago', 'Caracas', 'Guadalajara', 'Monterrey', 'Brasília',
    'Salvador', 'Fortaleza', 'Belo Horizonte', 'Recife', 'Porto Alegre',
    'Curitiba', 'Campinas', 'Manaus', 'Goiânia'
  ],
  'Middle East': [
    'Dubai', 'Riyadh', 'Cairo', 'Istanbul', 'Tel Aviv', 'Doha', 'Abu Dhabi',
    'Kuwait City', 'Jeddah', 'Manama', 'Muscat', 'Baghdad', 'Amman',
    'Beirut', 'Damascus', 'Tehran', 'Ankara', 'Alexandria', 'Mecca', 'Medina'
  ],
  'Africa': [
    'Lagos', 'Cairo', 'Johannesburg', 'Kinshasa', 'Luanda', 'Nairobi',
    'Abidjan', 'Casablanca', 'Cape Town', 'Durban', 'Pretoria', 'Accra',
    'Alexandria', 'Marrakech', 'Fez', 'Tangier', 'Rabat', 'Meknes', 'Oujda', 'Kenitra'
  ]
}

interface CitiesSelectionProps {
  selectedRegions: string[]
  selectedCities: string[]
  setSelectedCities: (cities: string[] | ((prev: string[]) => string[])) => void
}

export default function CitiesSelection({
  selectedRegions,
  selectedCities,
  setSelectedCities
}: CitiesSelectionProps) {

  // Helper function to get available cities based on selected regions
  const getAvailableCities = (): string[] => {
    const citiesSet = new Set<string>()
    selectedRegions.forEach(region => {
      const cities = CITY_DATA[region] || []
      cities.forEach(city => citiesSet.add(city))
    })
    return Array.from(citiesSet).sort()
  }

  // Toggle city selection
  const toggleCity = (city: string) => {
    setSelectedCities((prev: string[]) => 
      prev.includes(city) 
        ? prev.filter((c: string) => c !== city)
        : [...prev, city]
    )
  }

  const availableCities = getAvailableCities()

  return (
    <div>
      {availableCities.length > 0 && (
        <div>
          <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
            {availableCities.map(city => (
              <button
                key={city}
                onClick={() => toggleCity(city)}
                className={`w-full flex items-center justify-between p-2 sm:p-3 rounded-lg border transition-all duration-200 ${
                  selectedCities.includes(city)
                    ? 'bg-[#1a5ee9]/10 border-[#1a5ee9]/30 text-white'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                <span className="text-xs sm:text-sm">{city}</span>
                {selectedCities.includes(city) && (
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-[#1a5ee9]" />
                )}
              </button>
            ))}
          </div>
          {selectedCities.length === 0 && (
            <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-amber-300 text-xs">
                ⚠️ Please select at least one city to continue
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
