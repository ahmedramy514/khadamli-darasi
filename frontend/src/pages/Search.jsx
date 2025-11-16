import React, { useState } from 'react';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">🔍 البحث</h1>

      <div className="relative mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border-2 border-blue-500 rounded-full focus:outline-none"
          placeholder="ابحث عن مواد، أسئلة، أو طلاب..."
        />
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-500 text-center">ابدأ الكتابة للبحث</p>
        </div>
      </div>
    </div>
  );
};

export default Search;
