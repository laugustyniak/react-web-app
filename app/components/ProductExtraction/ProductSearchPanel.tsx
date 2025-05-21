import React from 'react';
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

interface ProductSearchPanelProps {
  searchQuery: string;
  onSearchQueryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: () => void;
  searchResults: any[] | null;
  isSearching: boolean;
  searchError?: string | null;
}


const ProductSearchPanel: React.FC<ProductSearchPanelProps> = ({
  searchQuery,
  onSearchQueryChange,
  onSearch,
  searchResults,
  isSearching,
  searchError,
}) => (
  <div className="mb-6">
    <h2 className="text-xl font-semibold mb-2">Search for Products</h2>
    <div className="flex gap-2 mb-2">
      <Input
        className="w-full"
        placeholder="Search by product name or description..."
        value={searchQuery}
        onChange={onSearchQueryChange}
      />
      <Button
        variant="default"
        onClick={onSearch}
        disabled={isSearching || !searchQuery.trim()}
      >
        {isSearching ? 'Searching...' : 'Search'}
      </Button>
    </div>
    <div>
      {searchError && (
        <p className="text-sm text-red-500 mb-2">{searchError}</p>
      )}
      {Array.isArray(searchResults) && searchResults.length > 0 ? (
        <ul className="list-disc pl-5">
          {searchResults.map((result, idx) => (
            <li key={idx} className="mb-1">
              {result.product_name} - {result.description_in_english}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No results found.</p>
      )}
    </div>
  </div>
);

export default ProductSearchPanel;
