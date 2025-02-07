// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { itineraryData } from '@/data/itineraries';

// Dynamic import of the map component to handle SSR
const ItineraryMap = dynamic(() => import('@/components/ItineraryMap'), {
  ssr: false,
  loading: () => <div className="w-full h-96 bg-gray-100 animate-pulse" />
});

export default function Home() {
  const [ships, setShips] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [months, setMonths] = useState<number[]>([]);
  const [itineraries, setItineraries] = useState<any[]>([]);
  
  const [selectedShip, setSelectedShip] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(0);
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [selectedItinerary, setSelectedItinerary] = useState<any>(null);

  useEffect(() => {
    // Extract unique ships, years, and months
    const uniqueShips = Array.from(new Set(itineraryData.RECORDS.map(r => r.ship_name))).sort();
    const uniqueYears = Array.from(new Set(itineraryData.RECORDS.map(r => 
      new Date(r.departure_date).getFullYear()
    ))).sort();
    const uniqueMonths = Array.from(new Set(itineraryData.RECORDS.map(r => 
      new Date(r.departure_date).getMonth() + 1
    ))).sort();

    setShips(uniqueShips);
    setYears(uniqueYears);
    setMonths(uniqueMonths);
  }, []);

  useEffect(() => {
    if (selectedShip && selectedYear && selectedMonth) {
      const filtered = itineraryData.RECORDS.filter(r => {
        const date = new Date(r.departure_date);
        return r.ship_name === selectedShip && 
               date.getFullYear() === selectedYear && 
               date.getMonth() + 1 === selectedMonth;
      });
      setItineraries(filtered);
    } else {
      setItineraries([]);
    }
  }, [selectedShip, selectedYear, selectedMonth]);

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Cruise Itinerary Explorer</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <select 
          className="border p-2 rounded"
          value={selectedShip}
          onChange={(e) => setSelectedShip(e.target.value)}
        >
          <option value="">Select Ship</option>
          {ships.map(ship => (
            <option key={ship} value={ship}>{ship}</option>
          ))}
        </select>

        <select 
          className="border p-2 rounded"
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
        >
          <option value="0">Select Year</option>
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>

        <select 
          className="border p-2 rounded"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
        >
          <option value="0">Select Month</option>
          {months.map(month => (
            <option key={month} value={month}>
              {new Date(2024, month-1).toLocaleString('default', { month: 'long' })}
            </option>
          ))}
        </select>

        <select 
          className="border p-2 rounded"
          value={selectedItinerary ? itineraries.indexOf(selectedItinerary) : ''}
          onChange={(e) => setSelectedItinerary(itineraries[Number(e.target.value)])}
        >
          <option value="">Select Itinerary</option>
          {itineraries.map((itinerary, index) => (
            <option key={index} value={index}>
              {itinerary.itinerary_name} - {itinerary.departure_date}
            </option>
          ))}
        </select>
      </div>

      {selectedItinerary && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Itinerary Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>Name:</strong> {selectedItinerary.itinerary_name}</p>
                <p><strong>Ship:</strong> {selectedItinerary.ship_name}</p>
                <p><strong>Departure:</strong> {selectedItinerary.departure_date}</p>
              </div>
              <div>
                <p><strong>Length:</strong> {selectedItinerary.length} nights</p>
                <p><strong>Destination:</strong> {selectedItinerary.destination_name}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Ports of Call:</h3>
              <ul className="list-decimal list-inside">
                {selectedItinerary.itinerary_ports.map((port: any, index: number) => (
                  <li key={index}>{port.port_name}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="h-96 bg-white rounded-lg shadow overflow-hidden">
            <ItineraryMap itinerary={selectedItinerary} />
          </div>
        </div>
      )}
    </main>
  );
}