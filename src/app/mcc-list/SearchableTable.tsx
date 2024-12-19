'use client'

import { useState } from 'react';

function SearchableTable({ data }: { data: Array<Record<string, any>> }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredData = data.filter(row =>
    row.Store.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <input
        type="text"
        placeholder="Search stores..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full max-w-md px-4 py-2 mb-4 border rounded-md"
      />
      
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              {['Store', 'MCC', 'Type'].map((header) => (
                <th key={header} className="border border-gray-300 p-2 text-left">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {['Store', 'MCC', 'Type'].map((key) => (
                  <td key={key} className="border border-gray-300 p-2">
                    {row[key] || 'N/A'} {/* Fallback value for empty fields */}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default SearchableTable;
