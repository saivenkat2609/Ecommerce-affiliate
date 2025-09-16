import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Star, X } from "lucide-react";
import { useState, useEffect } from "react";

interface Filters {
  priceRange: [number, number];
  categories: string[];
  brands: string[];
  minRating: number;
  features: string[];
}

interface FilterSidebarProps {
  onClose?: () => void;
  filters?: Filters;
  onFiltersChange?: (filters: Filters) => void;
}

const FilterSidebar = ({ onClose, filters, onFiltersChange }: FilterSidebarProps) => {
  // Provide default values if filters are not passed
  const defaultFilters: Filters = {
    priceRange: [0, 50000],
    categories: [],
    brands: [],
    minRating: 0,
    features: []
  };

  const appliedFilters = filters || defaultFilters;
  const handleFiltersChange = onFiltersChange || (() => {});

  // Local state for pending filters (before Apply is clicked)
  const [pendingFilters, setPendingFilters] = useState<Filters>(appliedFilters);

  // Update pending filters when applied filters change from parent
  useEffect(() => {
    setPendingFilters(appliedFilters);
  }, [appliedFilters]);

  // Check if there are pending changes
  const hasChanges = JSON.stringify(pendingFilters) !== JSON.stringify(appliedFilters);

  // Apply filters - send to parent component
  const handleApplyFilters = () => {
    console.log('FilterSidebar: Applying filters:', pendingFilters);
    handleFiltersChange(pendingFilters);
  };

  // Reset filters to applied state
  const handleResetFilters = () => {
    setPendingFilters(appliedFilters);
  };
  const categories = [
    { name: "Electronics", count: 1247 },
    { name: "Fashion", count: 892 },
    { name: "Home & Garden", count: 645 },
    { name: "Sports", count: 433 },
    { name: "Books", count: 298 }
  ];

  const brands = [
    { name: "Apple", count: 156 },
    { name: "Samsung", count: 134 },
    { name: "Nike", count: 98 },
    { name: "Adidas", count: 87 },
    { name: "Sony", count: 76 }
  ];

  const features = [
    "Free Shipping",
    "Same Day Delivery",
    "Prime Eligible",
    "On Sale",
    "New Arrivals"
  ];

  // Helper functions to update pending filters
  const updatePriceRange = (newRange: [number, number]) => {
    console.log('FilterSidebar: Price range changed to:', newRange);
    const newFilters = {
      ...pendingFilters,
      priceRange: newRange
    };
    console.log('FilterSidebar: Updating pending filters:', newFilters);
    setPendingFilters(newFilters);
  };

  const toggleCategory = (categoryName: string) => {
    const newCategories = pendingFilters.categories.includes(categoryName)
      ? pendingFilters.categories.filter(c => c !== categoryName)
      : [...pendingFilters.categories, categoryName];

    setPendingFilters({
      ...pendingFilters,
      categories: newCategories
    });
  };

  const toggleBrand = (brandName: string) => {
    console.log('FilterSidebar: Brand toggled:', brandName);
    const newBrands = pendingFilters.brands.includes(brandName)
      ? pendingFilters.brands.filter(b => b !== brandName)
      : [...pendingFilters.brands, brandName];

    const newFilters = {
      ...pendingFilters,
      brands: newBrands
    };
    console.log('FilterSidebar: Updating pending filters:', newFilters);
    setPendingFilters(newFilters);
  };

  const setMinRating = (rating: number) => {
    setPendingFilters({
      ...pendingFilters,
      minRating: pendingFilters.minRating === rating ? 0 : rating
    });
  };

  const toggleFeature = (featureName: string) => {
    const newFeatures = pendingFilters.features.includes(featureName)
      ? pendingFilters.features.filter(f => f !== featureName)
      : [...pendingFilters.features, featureName];

    setPendingFilters({
      ...pendingFilters,
      features: newFeatures
    });
  };

  const clearAllFilters = () => {
    const clearedFilters: Filters = {
      priceRange: [0, 50000],
      categories: [],
      brands: [],
      minRating: 0,
      features: []
    };
    setPendingFilters(clearedFilters);
    handleFiltersChange(clearedFilters);
  };

  // Get active filters for display (applied filters)
  const getActiveFilters = () => {
    const active = [];

    if (appliedFilters.priceRange[0] > 0 || appliedFilters.priceRange[1] < 50000) {
      active.push(`₹${appliedFilters.priceRange[0].toLocaleString('en-IN')}-₹${appliedFilters.priceRange[1].toLocaleString('en-IN')}`);
    }

    appliedFilters.categories.forEach(cat => active.push(cat));
    appliedFilters.brands.forEach(brand => active.push(brand));

    if (appliedFilters.minRating > 0) {
      active.push(`${appliedFilters.minRating}+ Stars`);
    }

    appliedFilters.features.forEach(feature => active.push(feature));

    return active;
  };

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="md:hidden">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Apply/Reset Buttons */}
        <div className="flex gap-2 mt-3">
          <Button
            onClick={handleApplyFilters}
            disabled={!hasChanges}
            className="flex-1"
            size="sm"
          >
            Apply Filters
            {hasChanges && (
              <Badge variant="secondary" className="ml-2 bg-primary text-primary-foreground">
                •
              </Badge>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleResetFilters}
            disabled={!hasChanges}
            size="sm"
          >
            Reset
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Active Filters */}
        <div>
          <h4 className="font-medium mb-2">
            Applied Filters
            {hasChanges && (
              <Badge variant="outline" className="ml-2 text-xs bg-orange-50 border-orange-200 text-orange-700">
                Changes Pending
              </Badge>
            )}
          </h4>
          <div className="flex flex-wrap gap-2">
            {getActiveFilters().map((filter, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground bg-blue-50 border-blue-200 text-blue-700"
                onClick={() => {
                  // Handle removing individual applied filters by setting in pending and applying
                  let newPendingFilters = { ...pendingFilters };
                  if (filter.includes('₹')) {
                    newPendingFilters.priceRange = [0, 50000];
                  } else if (filter.includes('+ Stars')) {
                    newPendingFilters.minRating = 0;
                  } else if (categories.some(cat => cat.name === filter)) {
                    newPendingFilters.categories = newPendingFilters.categories.filter(c => c !== filter);
                  } else if (brands.some(brand => brand.name === filter)) {
                    newPendingFilters.brands = newPendingFilters.brands.filter(b => b !== filter);
                  } else if (features.includes(filter)) {
                    newPendingFilters.features = newPendingFilters.features.filter(f => f !== filter);
                  }
                  setPendingFilters(newPendingFilters);
                  handleFiltersChange(newPendingFilters);
                }}
              >
                {filter} <X className="ml-1 h-3 w-3" />
              </Badge>
            ))}
            {getActiveFilters().length === 0 && (
              <span className="text-sm text-muted-foreground">No applied filters</span>
            )}
          </div>
        </div>

        <Separator />

        {/* Price Range */}
        <div>
          <h4 className="font-medium mb-3">Price Range</h4>
          <div className="px-2">
            <Slider
              value={pendingFilters.priceRange}
              onValueChange={(value) => updatePriceRange(value as [number, number])}
              max={50000}
              min={0}
              step={500}
              className="mb-3"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>₹0</span>
              <span>₹50,000+</span>
            </div>
            <div className="flex justify-between text-sm font-medium mt-1">
              <span>₹{pendingFilters.priceRange[0].toLocaleString('en-IN')}</span>
              <span>₹{pendingFilters.priceRange[1].toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Categories */}
        <div>
          <h4 className="font-medium mb-3">Categories</h4>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={category.name}
                    checked={pendingFilters.categories.includes(category.name)}
                    onCheckedChange={() => toggleCategory(category.name)}
                  />
                  <label htmlFor={category.name} className="text-sm cursor-pointer">
                    {category.name}
                  </label>
                </div>
                <span className="text-xs text-muted-foreground">({category.count})</span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Brands */}
        <div>
          <h4 className="font-medium mb-3">Brands</h4>
          <div className="space-y-2">
            {brands.map((brand) => (
              <div key={brand.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={brand.name}
                    checked={pendingFilters.brands.includes(brand.name)}
                    onCheckedChange={() => toggleBrand(brand.name)}
                  />
                  <label htmlFor={brand.name} className="text-sm cursor-pointer">
                    {brand.name}
                  </label>
                </div>
                <span className="text-xs text-muted-foreground">({brand.count})</span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Rating */}
        <div>
          <h4 className="font-medium mb-3">Customer Rating</h4>
          <div className="space-y-2">
            {[4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center space-x-2">
                <Checkbox
                  id={`rating-${rating}`}
                  checked={pendingFilters.minRating === rating}
                  onCheckedChange={() => setMinRating(rating)}
                />
                <label htmlFor={`rating-${rating}`} className="flex items-center gap-1 text-sm cursor-pointer">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  & Up
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Features */}
        <div>
          <h4 className="font-medium mb-3">Features</h4>
          <div className="space-y-2">
            {features.map((feature) => (
              <div key={feature} className="flex items-center space-x-2">
                <Checkbox
                  id={feature}
                  checked={pendingFilters.features.includes(feature)}
                  onCheckedChange={() => toggleFeature(feature)}
                />
                <label htmlFor={feature} className="text-sm cursor-pointer">
                  {feature}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Clear All */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={clearAllFilters}>
            Clear All
          </Button>
          {hasChanges && (
            <div className="text-xs text-orange-600 self-center">
              Click Apply to search
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterSidebar;