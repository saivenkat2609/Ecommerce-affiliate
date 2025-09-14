import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Star, X } from "lucide-react";
import { useState } from "react";

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

  const currentFilters = filters || defaultFilters;
  const handleFiltersChange = onFiltersChange || (() => {});
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

  // Helper functions to update filters
  const updatePriceRange = (newRange: [number, number]) => {
    console.log('FilterSidebar: Price range changed to:', newRange);
    const newFilters = {
      ...currentFilters,
      priceRange: newRange
    };
    console.log('FilterSidebar: New filters being sent:', newFilters);
    handleFiltersChange(newFilters);
  };

  const toggleCategory = (categoryName: string) => {
    const newCategories = currentFilters.categories.includes(categoryName)
      ? currentFilters.categories.filter(c => c !== categoryName)
      : [...currentFilters.categories, categoryName];

    handleFiltersChange({
      ...currentFilters,
      categories: newCategories
    });
  };

  const toggleBrand = (brandName: string) => {
    console.log('FilterSidebar: Brand toggled:', brandName);
    const newBrands = currentFilters.brands.includes(brandName)
      ? currentFilters.brands.filter(b => b !== brandName)
      : [...currentFilters.brands, brandName];

    const newFilters = {
      ...currentFilters,
      brands: newBrands
    };
    console.log('FilterSidebar: New filters being sent:', newFilters);
    handleFiltersChange(newFilters);
  };

  const setMinRating = (rating: number) => {
    handleFiltersChange({
      ...currentFilters,
      minRating: currentFilters.minRating === rating ? 0 : rating
    });
  };

  const toggleFeature = (featureName: string) => {
    const newFeatures = currentFilters.features.includes(featureName)
      ? currentFilters.features.filter(f => f !== featureName)
      : [...currentFilters.features, featureName];

    handleFiltersChange({
      ...currentFilters,
      features: newFeatures
    });
  };

  const clearAllFilters = () => {
    handleFiltersChange({
      priceRange: [0, 50000],
      categories: [],
      brands: [],
      minRating: 0,
      features: []
    });
  };

  // Get active filters for display
  const getActiveFilters = () => {
    const active = [];

    if (currentFilters.priceRange[0] > 0 || currentFilters.priceRange[1] < 50000) {
      active.push(`₹${currentFilters.priceRange[0].toLocaleString('en-IN')}-₹${currentFilters.priceRange[1].toLocaleString('en-IN')}`);
    }

    currentFilters.categories.forEach(cat => active.push(cat));
    currentFilters.brands.forEach(brand => active.push(brand));

    if (currentFilters.minRating > 0) {
      active.push(`${currentFilters.minRating}+ Stars`);
    }

    currentFilters.features.forEach(feature => active.push(feature));

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
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Active Filters */}
        <div>
          <h4 className="font-medium mb-2">Active Filters</h4>
          <div className="flex flex-wrap gap-2">
            {getActiveFilters().map((filter, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => {
                  // Handle removing individual filters
                  if (filter.includes('₹')) {
                    updatePriceRange([0, 50000]);
                  } else if (filter.includes('+ Stars')) {
                    setMinRating(0);
                  } else if (categories.some(cat => cat.name === filter)) {
                    toggleCategory(filter);
                  } else if (brands.some(brand => brand.name === filter)) {
                    toggleBrand(filter);
                  } else if (features.includes(filter)) {
                    toggleFeature(filter);
                  }
                }}
              >
                {filter} <X className="ml-1 h-3 w-3" />
              </Badge>
            ))}
            {getActiveFilters().length === 0 && (
              <span className="text-sm text-muted-foreground">No active filters</span>
            )}
          </div>
        </div>

        <Separator />

        {/* Price Range */}
        <div>
          <h4 className="font-medium mb-3">Price Range</h4>
          <div className="px-2">
            <Slider
              value={currentFilters.priceRange}
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
              <span>₹{currentFilters.priceRange[0].toLocaleString('en-IN')}</span>
              <span>₹{currentFilters.priceRange[1].toLocaleString('en-IN')}</span>
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
                    checked={currentFilters.categories.includes(category.name)}
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
                    checked={currentFilters.brands.includes(brand.name)}
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
                  checked={currentFilters.minRating === rating}
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
                  checked={currentFilters.features.includes(feature)}
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
        <Button variant="outline" className="w-full" onClick={clearAllFilters}>
          Clear All Filters
        </Button>
      </CardContent>
    </Card>
  );
};

export default FilterSidebar;