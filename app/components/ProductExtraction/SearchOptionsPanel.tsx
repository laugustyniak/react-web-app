import { ChevronDown, ChevronUp, Globe, Info, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { useAuth } from "~/contexts/AuthContext";
import { updateDocument } from "~/lib/firestore";

export interface SearchOptions {
  location: string; // City/country names for location parameter
  language: string; // Language names for display
  hl: string; // 2-letter language code for Google
  gl: string; // 2-letter country code for Google
  context: string;
  marketplace: string;
}

interface SearchOptionsPanelProps {
  searchOptions: SearchOptions;
  onOptionsChange: (options: SearchOptions) => void;
  className?: string;
}

const SearchOptionsPanel: React.FC<SearchOptionsPanelProps> = ({
  searchOptions,
  onOptionsChange,
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { user } = useAuth();

  // Save search options to Firestore whenever they change
  useEffect(() => {
    if (!user) return;

    // Debounce the save operation
    const timeoutId = setTimeout(() => {
      updateDocument('users', user.uid, {
        config: {
          searchOptions: searchOptions
        }
      }).catch(error => {
        console.error('Failed to save search options:', error);
      });
    }, 1000); // Save after 1 second of no changes

    return () => clearTimeout(timeoutId);
  }, [searchOptions, user]);

  const handleOptionChange = (key: keyof SearchOptions, value: string) => {
    onOptionsChange({
      ...searchOptions,
      [key]: value
    });
  };

  const resetToDefaults = () => {
    onOptionsChange({
      location: "United States",
      language: "English",
      hl: "en",
      gl: "us",
      context: "",
      marketplace: ""
    });
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Info className="h-4 w-4" />
            Search Options
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 space-y-4">
          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-xs font-medium flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Location
            </Label>
            <select
              id="location"
              value={searchOptions.location}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleOptionChange("location", e.target.value)}
              className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="Japan">Japan</option>
              <option value="Australia">Australia</option>
              <option value="Brazil">Brazil</option>
              <option value="India">India</option>
              <option value="Poland">Poland</option>
              <option value="">Global</option>
            </select>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="language" className="text-xs font-medium flex items-center gap-1">
              <Globe className="h-3 w-3" />
              Language
            </Label>
            <select
              id="language"
              value={searchOptions.language}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleOptionChange("language", e.target.value)}
              className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Portuguese">Portuguese</option>
              <option value="Japanese">Japanese</option>
              <option value="Chinese">Chinese</option>
              <option value="Hindi">Hindi</option>
              <option value="Polish">Polish</option>
            </select>
          </div>

          {/* Language (hl) */}
          <div className="space-y-2">
            <Label htmlFor="hl" className="text-xs font-medium flex items-center gap-1">
              <Globe className="h-3 w-3" />
              Language (hl)
            </Label>
            <select
              id="hl"
              value={searchOptions.hl}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleOptionChange("hl", e.target.value)}
              className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="en">en</option>
              <option value="es">es</option>
              <option value="fr">fr</option>
              <option value="de">de</option>
              <option value="pt">pt</option>
              <option value="ja">ja</option>
              <option value="zh">zh</option>
              <option value="hi">hi</option>
              <option value="pl">pl</option>
            </select>
          </div>

          {/* Country (gl) */}
          <div className="space-y-2">
            <Label htmlFor="gl" className="text-xs font-medium flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Country (gl)
            </Label>
            <select
              id="gl"
              value={searchOptions.gl}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleOptionChange("gl", e.target.value)}
              className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="us">us</option>
              <option value="ca">ca</option>
              <option value="uk">uk</option>
              <option value="de">de</option>
              <option value="fr">fr</option>
              <option value="jp">jp</option>
              <option value="au">au</option>
              <option value="br">br</option>
              <option value="in">in</option>
              <option value="pl">pl</option>
            </select>
          </div>

          {/* Marketplace */}
          <div className="space-y-2">
            <Label htmlFor="marketplace" className="text-xs font-medium">
              Marketplace
            </Label>
            <select
              id="marketplace"
              value={searchOptions.marketplace}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleOptionChange("marketplace", e.target.value)}
              className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value=""></option>
              <option value="amazon.com">Amazon.com</option>
              <option value="amazon.ca">Amazon.ca</option>
              <option value="amazon.co.uk">Amazon.co.uk</option>
              <option value="amazon.de">Amazon.de</option>
              <option value="amazon.fr">Amazon.fr</option>
              <option value="amazon.co.jp">Amazon.co.jp</option>
              <option value="ebay.com">eBay.com</option>
              <option value="walmart.com">Walmart.com</option>
              <option value="target.com">Target.com</option>
              <option value="bestbuy.com">Best Buy</option>
            </select>
          </div>

          {/* Additional Context */}
          <div className="space-y-2">
            <Label htmlFor="context" className="text-xs font-medium">
              Additional Context
            </Label>
            <Textarea
              id="context"
              placeholder="Add any additional search context or preferences..."
              value={searchOptions.context}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleOptionChange("context", e.target.value)}
              className="min-h-[60px] text-xs"
              rows={3}
            />
          </div>

          {/* Reset Button */}
          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefaults}
              className="h-7 text-xs"
            >
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default SearchOptionsPanel;
