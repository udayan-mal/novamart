const CATEGORIES = [
  {
    name: "Electronics", slug: "electronics", icon: "Laptop",
    subcategories: [
      { name: "Smartphones", slug: "smartphones" },
      { name: "Laptops", slug: "laptops" },
      { name: "Tablets", slug: "tablets" },
      { name: "Headphones", slug: "headphones" },
      { name: "Cameras", slug: "cameras" },
      { name: "Smart Watches", slug: "smart-watches" },
      { name: "Gaming", slug: "gaming" },
    ],
  },
  {
    name: "Fashion", slug: "fashion", icon: "Shirt",
    subcategories: [
      { name: "Men's Clothing", slug: "mens-clothing" },
      { name: "Women's Clothing", slug: "womens-clothing" },
      { name: "Shoes", slug: "shoes" },
      { name: "Accessories", slug: "accessories" },
      { name: "Jewelry", slug: "jewelry" },
      { name: "Bags", slug: "bags" },
    ],
  },
  {
    name: "Home & Living", slug: "home-living", icon: "Home",
    subcategories: [
      { name: "Furniture", slug: "furniture" },
      { name: "Decor", slug: "decor" },
      { name: "Kitchen", slug: "kitchen" },
      { name: "Bedding", slug: "bedding" },
      { name: "Lighting", slug: "lighting" },
    ],
  },
  {
    name: "Beauty & Health", slug: "beauty-health", icon: "Heart",
    subcategories: [
      { name: "Skincare", slug: "skincare" },
      { name: "Makeup", slug: "makeup" },
      { name: "Haircare", slug: "haircare" },
      { name: "Fragrances", slug: "fragrances" },
      { name: "Wellness", slug: "wellness" },
    ],
  },
  {
    name: "Sports & Outdoors", slug: "sports-outdoors", icon: "Dumbbell",
    subcategories: [
      { name: "Exercise Equipment", slug: "exercise-equipment" },
      { name: "Outdoor Gear", slug: "outdoor-gear" },
      { name: "Sportswear", slug: "sportswear" },
      { name: "Cycling", slug: "cycling" },
    ],
  },
  {
    name: "Books & Media", slug: "books-media", icon: "BookOpen",
    subcategories: [
      { name: "Fiction", slug: "fiction" },
      { name: "Non-Fiction", slug: "non-fiction" },
      { name: "Education", slug: "education" },
      { name: "Comics & Manga", slug: "comics-manga" },
    ],
  },
  {
    name: "Toys & Games", slug: "toys-games", icon: "Gamepad2",
    subcategories: [
      { name: "Action Figures", slug: "action-figures" },
      { name: "Board Games", slug: "board-games" },
      { name: "Puzzles", slug: "puzzles" },
      { name: "Educational Toys", slug: "educational-toys" },
    ],
  },
  {
    name: "Automotive", slug: "automotive", icon: "Car",
    subcategories: [
      { name: "Car Parts", slug: "car-parts" },
      { name: "Car Electronics", slug: "car-electronics" },
      { name: "Car Accessories", slug: "car-accessories" },
      { name: "Tools", slug: "tools" },
    ],
  },
];

module.exports = { CATEGORIES };
