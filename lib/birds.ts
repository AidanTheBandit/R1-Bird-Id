export interface BirdSpecies {
  commonName: string;
  scientificName: string;
  speciesCode: string;
  family: string;
  habitat: string;
  description: string;
  soundDescription: string;
  imageUrl: string;
  wikiUrl: string;
  range: string;
  size: string;
  color: string;
}

export const DEMO_BIRDS: BirdSpecies[] = [
  {
    commonName: "American Robin",
    scientificName: "Turdus migratorius",
    speciesCode: "amerob",
    family: "Turdidae (Thrushes)",
    habitat: "Open woodlands, gardens, parks",
    description: "A familiar sight on lawns across North America, pulling up earthworms after rain. Their rich caroling is among the first sounds of dawn.",
    soundDescription: "Melodious, whistled phrases: 'cheery-up, cheery-me, cheery-up'",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Turdus-migratorius-002.jpg/320px-Turdus-migratorius-002.jpg",
    wikiUrl: "https://en.wikipedia.org/wiki/American_robin",
    range: "North America",
    size: "25 cm",
    color: "Orange-red breast, dark gray back"
  },
  {
    commonName: "Northern Cardinal",
    scientificName: "Cardinalis cardinalis",
    speciesCode: "norcar",
    family: "Cardinalidae (Cardinals)",
    habitat: "Woodlands, gardens, shrublands",
    description: "One of the most recognizable birds in North America. The brilliant red male is a familiar sight at backyard feeders.",
    soundDescription: "Loud, clear whistles: 'cheer-cheer-cheer' or 'birdy-birdy-birdy'",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Cardinal_male.jpg/320px-Cardinal_male.jpg",
    wikiUrl: "https://en.wikipedia.org/wiki/Northern_cardinal",
    range: "Eastern North America",
    size: "22 cm",
    color: "Brilliant red (male), brownish-red (female)"
  },
  {
    commonName: "Black-capped Chickadee",
    scientificName: "Poecile atricapillus",
    speciesCode: "bkcchi",
    family: "Paridae (Tits, Chickadees)",
    habitat: "Deciduous and mixed forests",
    description: "A small, round bird with a big personality. Known for their curious nature and complex communication system.",
    soundDescription: "High, whistled 'fee-bee' or 'fee-bee-ee'; also 'chick-a-dee-dee-dee'",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Poecile_atricapilla_ad_ss.jpg/320px-Poecile_atricapilla_ad_ss.jpg",
    wikiUrl: "https://en.wikipedia.org/wiki/Black-capped_chickadee",
    range: "Northern North America",
    size: "14 cm",
    color: "Black cap and bib, white cheeks, gray back"
  },
  {
    commonName: "American Goldfinch",
    scientificName: "Spinus tristis",
    speciesCode: "amegfi",
    family: "Fringillidae (Finches)",
    habitat: "Open fields, meadows, roadsides",
    description: "The state bird of New Jersey, Iowa, and Washington. Males undergo a dramatic color change, becoming bright yellow in spring.",
    soundDescription: "Musical, canary-like 'per-chick-o-ree' in flight",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Carduelis-tristis-002.jpg/320px-Carduelis-tristis-002.jpg",
    wikiUrl: "https://en.wikipedia.org/wiki/American_goldfinch",
    range: "North America",
    size: "13 cm",
    color: "Bright yellow (male summer), olive-yellow (female)"
  },
  {
    commonName: "Song Sparrow",
    scientificName: "Melospiza melodia",
    speciesCode: "sonspa",
    family: "Passerellidae (New World Sparrows)",
    habitat: "Brushy areas, marshes, gardens",
    description: "One of the most geographically variable birds in North America with over 30 recognized subspecies. A persistent and beautiful singer.",
    soundDescription: "Variable melodic song beginning with 'sweet-sweet-sweet' then a buzzy trill",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Melospiza_melodia_-USA-8.jpg/320px-Melospiza_melodia_-USA-8.jpg",
    wikiUrl: "https://en.wikipedia.org/wiki/Song_sparrow",
    range: "North America",
    size: "16 cm",
    color: "Brown streaked, gray face, streaked breast"
  },
  {
    commonName: "Barn Swallow",
    scientificName: "Hirundo rustica",
    speciesCode: "barswa",
    family: "Hirundinidae (Swallows)",
    habitat: "Open areas near water, farmland",
    description: "The most widespread swallow in the world, found on every continent except Antarctica. Graceful aerialists that catch insects in flight.",
    soundDescription: "Continuous twittering, warbling song with clicking sounds",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Hirundo_rustica_-Rye%2C_East_Sussex%2C_England-8.jpg/320px-Hirundo_rustica_-Rye%2C_East_Sussex%2C_England-8.jpg",
    wikiUrl: "https://en.wikipedia.org/wiki/Barn_swallow",
    range: "Worldwide",
    size: "19 cm",
    color: "Steel blue above, orange-buff below, forked tail"
  },
  {
    commonName: "Red-tailed Hawk",
    scientificName: "Buteo jamaicensis",
    speciesCode: "rethaw",
    family: "Accipitridae (Hawks)",
    habitat: "Open country, woodlands, roadsides",
    description: "The most common and widespread hawk in North America. The scream you hear in movies whenever an eagle appears is actually this bird's call.",
    soundDescription: "Harsh, descending 'keeeeeer' scream",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Buteo_jamaicensis_-near_Goleta%2C_Santa_Barbara_County%2C_California%2C_USA-8.jpg/320px-Buteo_jamaicensis_-near_Goleta%2C_Santa_Barbara_County%2C_California%2C_USA-8.jpg",
    wikiUrl: "https://en.wikipedia.org/wiki/Red-tailed_hawk",
    range: "North America",
    size: "56 cm",
    color: "Brown above, pale below, brick-red tail"
  },
  {
    commonName: "Great Horned Owl",
    scientificName: "Bubo virginianus",
    speciesCode: "grhowl",
    family: "Strigidae (Owls)",
    habitat: "Forests, deserts, suburbs",
    description: "The most widespread owl in the Americas. A powerful predator that can take prey larger than itself, including other raptors.",
    soundDescription: "Deep, resonant hooting: 'hoo-hoo-hoooooo hoo-hoo'",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Great_horned_owl_toe_band.jpg/320px-Great_horned_owl_toe_band.jpg",
    wikiUrl: "https://en.wikipedia.org/wiki/Great_horned_owl",
    range: "Americas",
    size: "55 cm",
    color: "Mottled gray-brown, white throat, ear tufts"
  },
  {
    commonName: "Ruby-throated Hummingbird",
    scientificName: "Archilochus colubris",
    speciesCode: "rthhum",
    family: "Trochilidae (Hummingbirds)",
    habitat: "Woodlands, gardens with flowers",
    description: "The only hummingbird that breeds in eastern North America. They can beat their wings 53 times per second and fly backwards.",
    soundDescription: "Rapid, buzzy chipping 'chip-chip'; wing buzz during flight",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Ruby-throated-Hummingbird.jpg/320px-Ruby-throated-Hummingbird.jpg",
    wikiUrl: "https://en.wikipedia.org/wiki/Ruby-throated_hummingbird",
    range: "Eastern North America",
    size: "9 cm",
    color: "Iridescent green, ruby-red throat (male)"
  },
  {
    commonName: "Canada Goose",
    scientificName: "Branta canadensis",
    speciesCode: "cangoo",
    family: "Anatidae (Ducks, Geese)",
    habitat: "Lakes, ponds, golf courses, parks",
    description: "One of the most familiar birds in North America. Their V-formation flying is iconic, though they have adapted well to urban environments.",
    soundDescription: "Loud, honking 'ah-honk' or 'ka-ronk'",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Canada_goose_on_the_lake.jpg/320px-Canada_goose_on_the_lake.jpg",
    wikiUrl: "https://en.wikipedia.org/wiki/Canada_goose",
    range: "North America",
    size: "90 cm",
    color: "Black head and neck, white cheeks, brown body"
  },
  {
    commonName: "Mallard",
    scientificName: "Anas platyrhynchos",
    speciesCode: "mallar3",
    family: "Anatidae (Ducks, Geese)",
    habitat: "Wetlands, lakes, ponds, rivers",
    description: "The most recognizable and widespread duck in the Northern Hemisphere. Ancestor of most domestic duck breeds.",
    soundDescription: "Females: loud, descending quacks. Males: soft raspy queck",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Anas_platyrhynchos_male_female_quadrat.jpg/320px-Anas_platyrhynchos_male_female_quadrat.jpg",
    wikiUrl: "https://en.wikipedia.org/wiki/Mallard",
    range: "Northern Hemisphere",
    size: "58 cm",
    color: "Green head (male), mottled brown (female)"
  },
  {
    commonName: "Downy Woodpecker",
    scientificName: "Dryobates pubescens",
    speciesCode: "dowwoo",
    family: "Picidae (Woodpeckers)",
    habitat: "Deciduous forests, parks, orchards",
    description: "The smallest woodpecker in North America. A common visitor to backyard feeders, especially in winter.",
    soundDescription: "High, flat 'pik'; descending whinny; drumming on trees",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Downy-woodpecker.jpg/320px-Downy-woodpecker.jpg",
    wikiUrl: "https://en.wikipedia.org/wiki/Downy_woodpecker",
    range: "North America",
    size: "17 cm",
    color: "Black and white, small red patch (male)"
  },
  {
    commonName: "Blue Jay",
    scientificName: "Cyanocitta cristata",
    speciesCode: "blujay",
    family: "Corvidae (Crows, Jays)",
    habitat: "Forests, parks, suburban areas",
    description: "Bold and aggressive, Blue Jays are known for their intelligence and complex social systems. They mimic hawk calls to scare other birds.",
    soundDescription: "Loud, harsh 'jay-jay-jay'; also mimics Red-shouldered Hawk",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Blue_jay_in_PP_%2844284%29_cropped.jpg/320px-Blue_jay_in_PP_%2844284%29_cropped.jpg",
    wikiUrl: "https://en.wikipedia.org/wiki/Blue_jay",
    range: "Eastern North America",
    size: "30 cm",
    color: "Bright blue above, white below, black necklace"
  },
  {
    commonName: "American Crow",
    scientificName: "Corvus brachyrhynchos",
    speciesCode: "amecro",
    family: "Corvidae (Crows, Jays)",
    habitat: "Forests, farmland, cities",
    description: "Among the most intelligent animals. Crows use tools, recognize human faces, hold grudges, and pass knowledge to their offspring.",
    soundDescription: "Loud, harsh 'caw-caw-caw'",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Corvus-brachyrhynchos-001.jpg/320px-Corvus-brachyrhynchos-001.jpg",
    wikiUrl: "https://en.wikipedia.org/wiki/American_crow",
    range: "North America",
    size: "46 cm",
    color: "Entirely glossy black"
  },
  {
    commonName: "House Sparrow",
    scientificName: "Passer domesticus",
    speciesCode: "houspa",
    family: "Passeridae (Old World Sparrows)",
    habitat: "Cities, towns, farms",
    description: "One of the most widespread birds in the world, introduced from Europe. A bold, cheery presence in urban environments worldwide.",
    soundDescription: "Constant chirping 'cheep-cheep'; male has a repetitive single-note song",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Passer_domesticus_male_%2815%29.jpg/320px-Passer_domesticus_male_%2815%29.jpg",
    wikiUrl: "https://en.wikipedia.org/wiki/House_sparrow",
    range: "Worldwide",
    size: "16 cm",
    color: "Gray crown, chestnut back, black bib (male)"
  },
  {
    commonName: "European Starling",
    scientificName: "Sturnus vulgaris",
    speciesCode: "eursta",
    family: "Sturnidae (Starlings)",
    habitat: "Cities, farms, open woodlands",
    description: "Introduced to North America in 1890. Famous for spectacular murmurations — thousands of birds moving in coordinated aerial displays.",
    soundDescription: "Complex mix of whistles, clicks, rattles and mimicry of other birds",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Sturnus_vulgaris_-Canary_Wharf%2C_London%2C_England-8.jpg/320px-Sturnus_vulgaris_-Canary_Wharf%2C_London%2C_England-8.jpg",
    wikiUrl: "https://en.wikipedia.org/wiki/Common_starling",
    range: "Worldwide (introduced)",
    size: "22 cm",
    color: "Iridescent black with white spots (winter)"
  },
  {
    commonName: "Mourning Dove",
    scientificName: "Zenaida macroura",
    speciesCode: "moudov",
    family: "Columbidae (Pigeons, Doves)",
    habitat: "Open areas, woodlands, suburbs",
    description: "One of the most abundant birds in North America. Their mournful cooing is a familiar sound in backyards and parks.",
    soundDescription: "Soft, mournful 'ooh-woo-woo-woo' cooing",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Zenaida_macroura-_quad.jpg/320px-Zenaida_macroura-_quad.jpg",
    wikiUrl: "https://en.wikipedia.org/wiki/Mourning_dove",
    range: "North America",
    size: "31 cm",
    color: "Pale grayish-brown, pinkish below, spotted wings"
  },
  {
    commonName: "Eastern Bluebird",
    scientificName: "Sialia sialis",
    speciesCode: "easblu",
    family: "Turdidae (Thrushes)",
    habitat: "Open country, orchards, meadows",
    description: "A symbol of happiness, the brilliant blue male and rusty-breasted female are treasured sights at nest boxes across eastern North America.",
    soundDescription: "Soft, melodious 'tu-wee' or 'chur-wi'; musical warbling",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Eastern_Bluebird_%28Sialia_sialis%29_male.jpg/320px-Eastern_Bluebird_%28Sialia_sialis%29_male.jpg",
    wikiUrl: "https://en.wikipedia.org/wiki/Eastern_bluebird",
    range: "Eastern North America",
    size: "18 cm",
    color: "Brilliant blue above, rusty-orange breast (male)"
  },
  {
    commonName: "Cedar Waxwing",
    scientificName: "Bombycilla cedrorum",
    speciesCode: "cedwax",
    family: "Bombycillidae (Waxwings)",
    habitat: "Forests, orchards, suburbs",
    description: "A sleek, crested bird that travels in flocks and feeds on berries. Named for the red waxy tips on their wing feathers.",
    soundDescription: "High-pitched, trilled 'zeee-zeee-zeee'",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Cedar_Waxwing_%28Bombycilla_cedrorum%29.jpg/320px-Cedar_Waxwing_%28Bombycilla_cedrorum%29.jpg",
    wikiUrl: "https://en.wikipedia.org/wiki/Cedar_waxwing",
    range: "North America",
    size: "18 cm",
    color: "Smooth brown, yellow tail tip, red wing spots"
  },
  {
    commonName: "Common Loon",
    scientificName: "Gavia immer",
    speciesCode: "comloo",
    family: "Gaviidae (Loons)",
    habitat: "Northern lakes, coastal waters",
    description: "Symbol of wilderness and the call of the north. Their haunting wail echoes across northern lakes and is one of the most evocative sounds in nature.",
    soundDescription: "Haunting wail, tremolo, yodel; iconic wilderness call",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/CommonLoonGavia.jpg/320px-CommonLoonGavia.jpg",
    wikiUrl: "https://en.wikipedia.org/wiki/Common_loon",
    range: "Northern North America",
    size: "80 cm",
    color: "Black head, checkered back, white belly"
  }
];

export function getRandomBird(): BirdSpecies {
  return DEMO_BIRDS[Math.floor(Math.random() * DEMO_BIRDS.length)];
}

export function findBirdByCode(code: string): BirdSpecies | undefined {
  return DEMO_BIRDS.find(b => b.speciesCode.toLowerCase() === code.toLowerCase());
}
