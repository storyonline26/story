import { Product, UserProfile } from './types';

export const INITIAL_USER_PROFILE: UserProfile = {
  firstName: "Ananya",
  lastName: "Sharma",
  email: "ananya.sharma@story.in",
  phone: "+91 98765 43210",
  language: "ENGLISH",
  newsletter: true
};

export const INSTANT_ADDRESSES = [
  {
    fullName: "Ananya Sharma",
    street: "12 Kala Ghoda Lane",
    city: "Mumbai, Maharashtra 400001",
    country: "India"
  }
];

export const PRODUCTS: Product[] = [
  // Grid 1: Our Products Row
  {
    id: "wide-legged-pants",
    name: "Wide Leg Pants",
    price: 3490,
    category: "BOTTOM",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1509319117193-57bab727e09d?auto=format&fit=crop&w=800&q=80",
    listImages: [
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Flowing wide-leg trousers constructed from fine fluid cotton twill. Premium drape and relaxed structural lines, complete with high waist fit.",
    details: [
      "High waist, fluid wide leg silhouette",
      "Two side pockets, two reverse welt pockets",
      "Concealed elegant hook-and-bar closure",
      "Clean blind-stitched hem styling"
    ],
    composition: "90% organic cotton, 10% linen. Responsibly made in Jaipur, India.",
    care: "Dry clean only or delicate cold wash. Hang dry on a rounded hanger.",
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Off-White", hex: "#ECEBE4" },
      { name: "Pristine Black", hex: "#111111" }
    ]
  },
  {
    id: "relaxed-linen-shirt",
    name: "Relaxed Linen Shirt",
    price: 4490,
    category: "SHIRTS",
    image: "https://lh3.googleusercontent.com/aida/ADBb0uhp1lIVLofZ-7q0fuYMS6y1XarcOncWOQQP2IlXAyv0CtWaOjKcrj-Z-B74Td-W4GE4DVL9JiuOSnNzonOYTAPXDd_A_lIKTl-FzUHssl6TUarX98i__1FAAYYS0ivhiF5d4Pnb_BUXgbfoB3tMIslnUyHK90wo0N1u9DO54GSw4Y-05cx7M8TJxRSVl4f_ngK7ZoXnYRGEl8nDi_954jwzOY-cp7rHDfRKIhPD07_KoSMsk9dOnpWOP04",
    secondaryImage: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80",
    listImages: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBlm8BPVSJAy6hZKpRMZyhpWMZBtZFin4Yt6nz23uP04jp2DCQp_QW4LWy-NBqSObIHsFuoKkAXochzGbsY4alSZQEDQ1LZsvVdSIOewhOvl2IMGgiICFihn22JTmuJc3PaZPY2LAzNKMP1Xd1V7KI7WLoutHQZLD8TwsZD-iX7bXwrhwodCWJ4rpENf3p5HGzWp4L6PiTcNMVkzPm3PeDOkUXq9aOkcafoEt74nYXoufzEnRryAg9ml0JAWVYnqBArqxGst-qPmRE"
    ],
    description: "Breathable pure linen shirt with raw horn-inspired buttons. Pre-washed for a softer tactile structure and beautiful organic rumple.",
    details: [
      "Loose unisex relaxed shape",
      "Oversized pointed collar design",
      "Curved high-low hem structure",
      "Exquisite twin-needle clean topstitching"
    ],
    composition: "100% premium organic linen, finished in Bengaluru, India.",
    care: "Machine wash cold inside out. Trowel stream or iron on medium when damp.",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Flax Linen", hex: "#ECEBE4" },
      { name: "Chalk Black", hex: "#1D1C1E" }
    ]
  },
  {
    id: "crew-neck-sweater",
    name: "Crew Neck Sweater",
    price: 5990,
    category: "KNITWEAR",
    image: "https://lh3.googleusercontent.com/aida/ADBb0uj8FLb9bsGlG-6QGa20qiQ81oAa0vcQuHGhzq_f4CIIwrMzW9OkwagBvsJmo4mpW_iicufR8hvZ1KpdMVrO-T-hhPyWy17jJ3LNS9VnMCgVjKqvaY_RuXXOCqg46YXyJmwH7RvA6r68Y37qp10t2ua_M7PK6hQiHt6lC3rmCvExbS80JE3Ro2UStfoe_h2HyGaSe7YylrVkinm7Przl1T0AJ84AgHMAuVQUcGhTM4Zy1dXucqx4Y5MFg2Y",
    secondaryImage: "https://images.unsplash.com/photo-1434389677669-e08b4cead0e2?auto=format&fit=crop&w=800&q=80",
    listImages: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD1L-e7kZ7AUAKeYNBfO6v3LkFvdR_dq9o4gRzgzfyVN97f6tPO8zFlzjWooywtA4FmWLWWBJ30XGGD0QV9SbA4zx1NKKtdqhFOr6PE96LOltj2cCUPqFViJLAXd-NIwdzvgJLgAibzn-8RfXF7eU1S74nE_TSg-dJZVBQE0epZlaOKQ1xghSdG6ISfthcmPK7oKcz3BrWFgK07Bx-j1f6d1JcdKbrTVgYPLuhI3sifGw_GtirmzNF_oDqdkFLKuc32cF9SQa6Tzr0"
    ],
    description: "Medium knit flat rib sweater constructed in supreme alpaca and extra-fine wool. Timeless design that is soft, cozy, and holds high-fashion shape.",
    details: [
      "Classic mock crewneck height",
      "Drop shoulders for natural visual drape",
      "Thick rib cuff and bottom details",
      "Seamless side paneling"
    ],
    composition: "50% Alpaca Wool, 30% Merino, 20% Recycled Cotton.",
    care: "Hand wash cold inside out, dry flat in shadow. Store folded.",
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Oatmeal Melange", hex: "#E3DFD5" },
      { name: "Anthracite", hex: "#222222" }
    ]
  },
  {
    id: "classic-mini-dress",
    name: "Classic Mini Dress",
    price: 6990,
    category: "DRESSES",
    image: "https://lh3.googleusercontent.com/aida/ADBb0uhyN0ftTAWh3Tfh0E5N4fdflr5eATKQ6Jfc7jugTq3U765-hyIgutRYp_02cCEmXLJveugetSTJM01H7dBUw7yplboo_KxK2b9G0QXcMTVXHxB9iWO5dBOX-gfDZZwuL2sTIKKcxzClyAxPnaAg5F7Nk4BEBHeTgMW9ZgPoXdhqFf7vvpv86Ds4CTmSFlQhM8i5QpOghUiu_f9PC3wvvC9XbRG7CchaPTUVmperlJtYFISoe1-g-cgeGnk",
    secondaryImage: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80",
    listImages: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCRRyVhS6MgJN8MpmxSTRA87pVQ5gf_Pzf5Gyfdh9xjdKv9nHU_o7f5A3fEx7eytbLPGS1dNaHLa4h36lmkyofl07qyJtwkoXzNAalR80f6PSJPUdyivjVMFTg4ZVVL6MTBy9sI5BdFXVSCeXkAbtsl0PPM6tplQW80D9opqFWawrYI8kAa2MAPS44R0ptAedl-8H4K5Ccx9X-panhluf2aewqjsFvxdNigyxlJ3nnw5jHNfe-T1N7HsGQhDGc-UqnwTGOuSp6XJXc"
    ],
    description: "Sleek shift mini dress featuring clean structured seams. Designed with a structured elegant high crew neckline and an invisible rear zipper.",
    details: [
      "Elegant classic shift silhouette",
      "Hidden side pockets",
      "Invisible back premium metallic zip",
      "Hemmed nicely for structural retention"
    ],
    composition: "80% Organic Cotton, 20% Recycled Flax.",
    care: "Gentle machine wash inside out. Warm iron under protective cloth overlay.",
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Cream White", hex: "#FAF8F5" },
      { name: "Charcoal Obsidian", hex: "#232325" }
    ]
  },
  {
    id: "canvas-tote-bag",
    name: "Canvas Tote Bag",
    price: 2490,
    category: "ACCESSORY",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    listImages: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Durable untreated organic cotton canvas tote. Extra-thick dual straps and an interior dynamic passport sleeve for seamless daily carry.",
    details: [
      "Spacious main compartment",
      "Heavyweight raw organic canvas cloth",
      "Double reinforced cross-box handle stitching",
      "Interior key hook with printed brand logo"
    ],
    composition: "100% Unbleached Certified Organic Cotton.",
    care: "Spot clean only with cold water and mild detergent. Warm iron to crisp.",
    sizes: ["O/S"],
    colors: [
      { name: "Natural Ecru", hex: "#EEEDE8" },
      { name: "Raw Charcoal", hex: "#3A3A3C" }
    ]
  },

  // Grid 2: Paginated Products Grid (10 main products)
  {
    id: "dolman-sleeve-blouse",
    name: "Silk Blouse",
    price: 5490,
    category: "SHIRTS",
    image: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&w=800&q=80",
    description: "Draped dolman sleeve blouse featuring organic drop shoulders and narrow buttoned cuffs. Sleek silhouette with high luxury volume.",
    details: [
      "Broad dolman sleeves",
      "Soft gathered neck detail",
      "Single back button enclosure",
      "Wide curved cuffs"
    ],
    composition: "100% Lyocell (Tencel) for fluid drape.",
    care: "Wash inside raw protective pouch. Air dry on flat surfaces.",
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Slate Grey", hex: "#7E7F83" },
      { name: "Pristine Off-White", hex: "#FAFAFA" }
    ]
  },
  {
    id: "belt-tie-waist-dress",
    name: "Belt Tie Waist Dress",
    price: 3990,
    category: "DRESSES",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
    description: "An elegant wrap dress featuring a structured linen belt to gather and define your silhouette. Designed for breezy afternoon comfort.",
    details: [
      "Wrap styling front panel",
      "Detachable self-fabric belt with metal buckles",
      "Wide gathered half-sleeves",
      "Side splits for graceful movement"
    ],
    composition: "100% fine linen, tailored in India.",
    care: "Cold hands wash or dry clean. Steam only.",
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Linen Ecru", hex: "#EBE3D5" },
      { name: "Ink Black", hex: "#121212" }
    ]
  },
  {
    id: "hooded-zip-up",
    name: "Hooded Zip-Up Sweater",
    price: 4990,
    category: "KNITWEAR",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
    description: "Taxing organic heavy cotton french terry knit with a robust brushed metal runner zip, dropped shoulder drape and comfortable front pockets.",
    details: [
      "Oversized double layer hood",
      "Heavy double-slider copper zip front runner",
      "Slightly cropped waist with elastic band",
      "High weight terry knit"
    ],
    composition: "100% Organic Cotton Terry, 420gsm.",
    care: "Wash with cool water only. Avoid high-heat drying.",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Washed Slate", hex: "#4E4E52" },
      { name: "Ecru", hex: "#EEEDE8" }
    ]
  },
  {
    id: "elongated-blazer",
    name: "Structured Blazer",
    price: 8990,
    category: "OUTERWEAR",
    image: "https://lh3.googleusercontent.com/aida/AP1WRLveJxgRKIHtwz-3sZdDZvaJsSy38nuzmnm1nci4mczoaSZf5MKt1locLHdleI70qmFh-L9WXz4eZGUHWFHTBvvBAIvn7ntErcg7wSW-IXKDHBiHRyem_ajfNRO8zvtuUEyv0DHrUP8jp7vPNOAbBgv6VAQ24oy61g2eF1HBJRSV2Vztnvzwg310u0_0R_WqW22Lz7l67ahFmQQPKa5CZ91TDyasxjhIRuA3lIoeXk-dWLEEY9TTdzqoojo",
    description: "A gorgeous single-breasted elongated blazer in lightweight luxury virgin wood blend. Crisp notch lapels and structured straight shoulders.",
    details: [
      "Elongated structured silhouette",
      "Flap-pockets at waist",
      "Fully premium interior satin lining",
      "Contrast buttons detailing"
    ],
    composition: "70% wool, 30% cupro lining. Finished in a Mumbai atelier.",
    care: "Dry clean only. Gentle steaming.",
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Taupe Camel", hex: "#A89B8D" },
      { name: "Obsidian", hex: "#121212" }
    ]
  },
  {
    id: "structured-tote-bag",
    name: "Structured Tote Bag",
    price: 3490,
    category: "ACCESSORY",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    description: "Sleek heavy-structured tote bag designed with architectural side-gussets, magnetic secure snap closure, and double reinforced straps.",
    details: [
      "Architectural profile stands upright",
      "Internal dynamic zipped coin pouches",
      "Sleek reinforced bottom paneling",
      "Full premium raw edge seal finish"
    ],
    composition: "100% Recycled Vegan Fiber Composite.",
    care: "Wipe clean with a damp microfiber cloth.",
    sizes: ["O/S"],
    colors: [
      { name: "Matte Black", hex: "#18181A" },
      { name: "Desert Sand", hex: "#C2B4A4" }
    ]
  },
  {
    id: "linen-relaxed-blazer",
    name: "Linen Relaxed Blazer",
    price: 6990,
    category: "OUTERWEAR",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80",
    description: "Deconstructed relaxed notch-lapel blazer in premium certified organic linen. Fluid weight, unlined for ultimate spring ventilation.",
    details: [
      "Deconstructed shoulder silhouette",
      "Three elegant patch pockets on the front panel",
      "Two-button organic horn closure",
      "Dual rear side vents"
    ],
    composition: "100% French Certified Organic Linen.",
    care: "Gentle wash cold or dry clean. Press when damp.",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Charcoal Black", hex: "#121212" },
      { name: "Oatmeal Beige", hex: "#DFD9CF" }
    ]
  },
  {
    id: "rib-knit-tank-top",
    name: "Rib-Knit Tank Top",
    price: 1990,
    category: "TOP",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
    description: "Premium fine-gauge rib knit organic cotton tank top featuring a clean scoop neckline and seamless tubular knit construction.",
    details: [
      "Body-hugging rib-knit elastic elasticity",
      "Prisitne bound edge neck finish",
      "Tubular knit body - zero chafing side seams",
      "Longline hemline for clean layering styling"
    ],
    composition: "95% Organic Cotton, 5% Lycra.",
    care: "Machine wash delicate. Tumble dry low or air dry.",
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Chalk White", hex: "#FFFFFF" },
      { name: "Dark Carbon", hex: "#1A1A1C" }
    ]
  },
  {
    id: "high-waist-trousers",
    name: "Wide-Leg Trousers",
    price: 5990,
    category: "BOTTOM",
    image: "https://lh3.googleusercontent.com/aida/ADBb0uhTsr9xtpBOES_-rTBl_6k6eTmax3HMZHogJWqflCbbHKsGXCPAARCJ86Xq6xlRRZdo1n9_IYENuszPvC1K85LQR-Wwb89T92oIGsR3LfZY-X_fx_icBJfH5AfLAv4WE00MqVzHOPla4ckMQ1dClat49p6jB_KRBBbtr2A4Yxm9P1ypbaQTqDJKZKIxvFPE7PGi-dVQ_6EII5_0HJwCrY68epGu8GyrW_Zzpo3UcIv172SAyI9pv5EpfAM",
    description: "Beautiful high-rise wool blend trousers with razor-sharp front creases, side pockets, and detailed double back welt seams.",
    details: [
      "High waist structured waistband",
      "Sharp permanent leg creases",
      "Hook and bar zipper closure",
      "Unfinished hem option for custom lengths"
    ],
    composition: "60% Wool, 38% Polyester, 2% Elastane.",
    care: "Dry clean only. Hang on standard trouser clamps.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Ash Grey", hex: "#5D5E62" },
      { name: "Nocturnal Black", hex: "#0F0F10" }
    ]
  },
  {
    id: "oversized-wool-coat",
    name: "Oversized Wool Coat",
    price: 12990,
    category: "OUTERWEAR",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC7GsO4SZpGyttxO7Ilf7Gv1HBIYDIxwnUpkjovYDaM3r5cs8IBWeIIeg3goVCtcNHA-FMUL52zkbB6uPyaqLzlAqfYGXlENw8MbSaEvVTjzkCnTazi9z7_-4UKeOAPNHlgI_lpNawrnPvs5wuzg614j78QlEWBL3cb6lBxh5zeydhbS5aq2rTmZJJcUfMnJW1b0IcENzpspGlbyzvx7D8NjQwTlMwP-OfE8JDT455Kuv7AkWtV9jF90LPM_FAALAOsW29NnHE2Ans",
    description: "Generously cut double-wool luxury coat with extreme drop shoulders and an elegant double-breasted profile designed to wrap beautifully.",
    details: [
      "Voluminous architectural shape",
      "Deep practical wool welt side-pockets",
      "Concealed dynamic horn front closure",
      "Premium Cupro silky interior sleeve lining"
    ],
    composition: "90% Virgin Wool, 10% Cashmere.",
    care: "Professional wool cleaning only. Use cedar blocks to store.",
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Flax Ecru", hex: "#EAE6DF" },
      { name: "Dark Onyx", hex: "#1C1C1D" }
    ]
  },
  {
    id: "crossover-mini-dress",
    name: "Crossover Mini Dress",
    price: 4990,
    category: "DRESSES",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
    description: "High-contrast asymmetrical crossover wrap dress in dense poplin. Detailed with high sharp side folds and structured raw collar drape.",
    details: [
      "Crossover asymmetric wrap styling",
      "Durable elastic dense weave flat cotton",
      "Side waist double tie-strap fastening",
      "Invisible bias tape hem"
    ],
    composition: "100% Giza Long-Staple Cotton Poplin.",
    care: "Wash cold. Medium steam iron.",
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Chalk White", hex: "#FAF8F5" },
      { name: "Carbon Noir", hex: "#121213" }
    ]
  },

  // Row 3: Recommendations (5 items requested in visual layout)
  {
    id: "linen-wide-pants",
    name: "Linen Wide Pants",
    price: 3490,
    category: "BOTTOM",
    image: "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=800&q=80",
    description: "Flowing breathable pure collection linen pants with flat front drawstrings and spacious cargo insert details.",
    details: [
      "Drawstring elastic waistband",
      "Wide flowing leg drape",
      "Breathable cool linen weave",
      "Double stitched raw structural edges"
    ],
    composition: "100% washed linen, crafted in India.",
    care: "Cold delicate machine wash. Air dry only.",
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Linen Beige", hex: "#DFD9CF" }
    ]
  },
  {
    id: "faux-leather-jacket",
    name: "Faux Leather Jacket",
    price: 7990,
    category: "OUTERWEAR",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBwez49vlj7_YZtV0AqNHjUuC9EH9NpRnVx7sXuL8EHaA0eq82IX0LjNjImLPKCDwiI3pUdWFfYuBLnEryYgKRzRq7hsdMRIbTT22xIad0JVGqSxgQ9gxpdebhzYEgmL6BiUMZ-TtGD5oMVJuBY3knKUJkYq3ie3HwugefrNnyYI95e5bF-BN2XIFqYv9CGgEcKF3s3plKGAet4pO4U6yo-2MTWNTVsaVK7ybv00O2YtqzfGwQlXQCMEasn1ZnijtoeJ5XW9H5WkHQ",
    description: "Tailored vegan leather jacket in premium satin finish, complete with heavy chrome press collar studs and custom side asymmetric zips.",
    details: [
      "Regular fit moto jacket silhouette",
      "Premium eco-polyurethane leather touch",
      "YKK heavy gauge silver metal zip runners",
      "Satin inner lining padding"
    ],
    composition: "100% Eco-PU Leather, 100% Viscose Lining.",
    care: "Wipe with damp clean cloth. Avoid machine agitation.",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Jet Obsidian", hex: "#0E0E10" }
    ]
  },
  {
    id: "gray-tube-top",
    name: "Gray Tube Top",
    price: 1990,
    category: "TOP",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
    description: "Fine knit heavy stretch tubular shape tube top designed to hug securely and styled with clean silicone tape inside upper hem to stop slip.",
    details: [
      "Integrated hidden support bands",
      "Double lined inside for zero-opacity wear",
      "Stretched heavy elastic knit touch",
      "Non-slip silicone safety band"
    ],
    composition: "92% Organic Cotton, 8% Elastane.",
    care: "Wash inside delicates pouch. Lay flat to preserve shape.",
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Heather Grey", hex: "#9E9E9E" },
      { name: "Ecru White", hex: "#FAFAFA" }
    ]
  },
  {
    id: "drawstring-linen-pants",
    name: "Drawstring Linen Pants",
    price: 3490,
    category: "BOTTOM",
    image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80",
    description: "Casual organic linen drawstring trousers. Features an elegant tapered straight leg construct, elastic waist, and coin pouch pocket.",
    details: [
      "Tapered clean flat-front drawstring leg",
      "Highly breathable linen weave construction",
      "Two deep front pockets, one detail coin slip",
      "Durable double back stitch finish"
    ],
    composition: "100% organic linen, crafted in India.",
    care: "Machine wash cold inside out. Steam treatment recommended.",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Off-White Linen", hex: "#EAE6DF" },
      { name: "Onyx Black", hex: "#1C1C1D" }
    ]
  },
  {
    id: "convertible-crossbody-bag",
    name: "Convertible Cross-body Bag",
    price: 2990,
    category: "ACCESSORY",
    image: "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=800&q=80",
    description: "Versatile modular strap crossbody bag constructed in weather-repellent heavy technical nylon and styled with premium matte finish metal snaps.",
    details: [
      "Modular adjustable strap converts to clutch",
      "Two expandable pockets with water-resistant zips",
      "Technical high-denier cordura blend",
      "Embossed metal Story typography stamp"
    ],
    composition: "80% Cordura Nylon, 20% Eco-Leather details.",
    care: "Spot clean with soft brush and warm soap water.",
    sizes: ["O/S"],
    colors: [
      { name: "Stealth Black", hex: "#111112" }
    ]
  }
];

export const TRENDING_TAGS = [
  "MONOCHROME", "MINIMALIST UTILITY", "WOOL BLAZERS", "SUSTAINABLE CHIC", "RAW SEAMS", "ARCHITECTURAL DRAPE"
];

export const CATEGORIES = [
  "ALL", "OUTERWEAR", "NEW ARRIVAL", "BOTTOM", "DRESSES", "ACCESSORY", "SHOES", "TOP", "SALE", "FEATURED"
];
