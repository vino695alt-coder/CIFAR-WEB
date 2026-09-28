/**
 * Wonder Dash: Magic World - Central Game Configuration
 * Production-ready Game Engine, AdMob & Google Play Billing Setup
 * Original All-Ages Family-Friendly Casual Runner
 */

const WONDER_CONFIG = {
  APP_INFO: {
    NAME: "Wonder Dash: Magic World",
    VERSION: "1.0.0",
    BUILD_NUMBER: 100,
    PACKAGE_NAME: "com.wonderdash.magicworld",
    COMPANY: "WonderDash Studios",
    FAMILY_FRIENDLY: true,
    TARGET_FPS: 60
  },

  GAMEPLAY: {
    LANES: [-2.5, 0, 2.5], // 3 lanes (Left, Center, Right)
    LANE_SWITCH_SPEED: 14.0, // Smooth lerp speed
    INITIAL_SPEED: 18.0, // Initial track speed
    MAX_SPEED: 42.0, // Cap on maximum speed
    SPEED_ACCELERATION: 0.25, // Speed increment per 100m
    GRAVITY: -40.0, // Jump physics gravity
    JUMP_FORCE: 15.0, // Jump vertical velocity
    SLIDE_DURATION: 0.85, // Duration of slide in seconds
    SEGMENT_LENGTH: 50.0, // Length of each procedural track chunk
    ACTIVE_SEGMENTS: 7, // Number of concurrent track chunks pooled
    OBSTACLE_MIN_DIST: 14.0, // Minimum distance between obstacles
    COLLISION_PLAYER_RADIUS: 0.65,
    COLLISION_COIN_RADIUS: 1.1,
    COLLISION_POWERUP_RADIUS: 1.4
  },

  // Google AdMob Configuration
  // Note: Official Google Test IDs are enabled by default for seamless safe development & review.
  // Replace with live AdMob IDs from Google AdMob console before final Play Store release.
  ADMOB: {
    TEST_MODE: true, // Set to false when using live AdMob IDs
    APP_ID: "ca-app-pub-3940256099942544~3347511713",
    BANNER_ID: "ca-app-pub-3940256099942544/6300978111",
    INTERSTITIAL_ID: "ca-app-pub-3940256099942544/1033173712",
    REWARDED_ID: "ca-app-pub-3940256099942544/5224354917",
    
    // Family Policy & Ethical Ad Controls
    CHILD_DIRECTED_TREATMENT: true, // Google Play Families policy compliance
    MAX_AD_CONTENT_RATING: "G", // General audience / family safe
    INTERSTITIAL_RUN_INTERVAL: 3, // Only show interstitial every 3 games, never during run
    REWARD_REVIVE_CAP_PER_RUN: 1, // Fair play: 1 revive per run
    REWARD_DOUBLE_COINS_MULTIPLIER: 2.0
  },

  // Google Play Billing (IAP) Configuration
  BILLING: {
    TEST_MODE: true, // Sandbox simulation available in Web & Android preview
    PRODUCTS: {
      REMOVE_ADS: {
        id: "wonder_dash_remove_ads",
        type: "non_consumable",
        title: "Remove Ads & Ad-Free Bonus",
        price: "$2.99",
        coins: 1000,
        gems: 50,
        description: "Permanently removes all interstitial and banner ads, plus 50 bonus gems!"
      },
      COINS_SMALL: {
        id: "wonder_dash_coins_small",
        type: "consumable",
        title: "Pouch of Gold",
        price: "$0.99",
        coins: 2000,
        gems: 0,
        description: "2,000 sparkling gold coins for character upgrades!"
      },
      COINS_MEDIUM: {
        id: "wonder_dash_coins_medium",
        type: "consumable",
        title: "Chest of Wonders",
        price: "$2.99",
        coins: 7500,
        gems: 25,
        description: "7,500 coins + 25 rare magic gems!"
      },
      COINS_MEGA: {
        id: "wonder_dash_coins_mega",
        type: "consumable",
        title: "Dragon Treasure Vault",
        price: "$7.99",
        coins: 25000,
        gems: 120,
        description: "25,000 coins + 120 magic gems for ultimate unlocks!"
      },
      GEMS_SMALL: {
        id: "wonder_dash_gems_small",
        type: "consumable",
        title: "Crystal Satchel",
        price: "$1.99",
        coins: 0,
        gems: 60,
        description: "60 glowing magic gems to instantly unlock premium characters!"
      },
      GEMS_VAULT: {
        id: "wonder_dash_gems_vault",
        type: "consumable",
        title: "Starlight Gem Trove",
        price: "$6.99",
        coins: 0,
        gems: 300,
        description: "300 sparkling starlight gems!"
      },
      STARTER_BUNDLE: {
        id: "wonder_dash_starter_bundle",
        type: "non_consumable",
        title: "Hero Starter Pack",
        price: "$4.99",
        coins: 10000,
        gems: 100,
        skin: "milo_golden",
        removeAds: true,
        description: "Remove Ads + 10,000 Coins + 100 Gems + Exclusive Golden Milo Skin!"
      }
    }
  },

  // 8 Unique Magical Worlds with High-Res Artworks & Themed Icons
  WORLDS: [
    {
      id: "enchanted_forest",
      name: "Enchanted Forest",
      subtitle: "Glowing flora and ancient magic trees",
      icon: "🌲",
      themeColor: "#10b981",
      skyColor: "#064e3b",
      fogColor: "#022c22",
      groundColor: "#059669",
      accentColor: "#fbbf24",
      unlockLevel: 1,
      unlockCoins: 0,
      unlockGems: 0,
      musicStyle: "forest_whimsical",
      particles: "fireflies",
      speedModifier: 1.0,
      coinDensity: 1.0,
      gemRate: 0.05,
      previewImg: "assets/images/world_enchanted_forest.jpg",
      obstacles: ["ancient_log", "moss_boulder", "thorny_arch", "low_branch"]
    },
    {
      id: "rainbow_valley",
      name: "Rainbow Valley",
      subtitle: "Floating pastel clouds and prism bridges",
      icon: "🌈",
      themeColor: "#ec4899",
      skyColor: "#38bdf8",
      fogColor: "#f472b6",
      groundColor: "#8b5cf6",
      accentColor: "#fde047",
      unlockLevel: 3,
      unlockCoins: 1500,
      unlockGems: 25,
      musicStyle: "rainbow_upbeat",
      particles: "rainbow_sparkles",
      speedModifier: 1.05,
      coinDensity: 1.15,
      gemRate: 0.06,
      previewImg: "assets/images/world_rainbow_valley.jpg",
      obstacles: ["prism_crystal", "bouncy_cloud", "rainbow_hurdle", "color_gate"]
    },
    {
      id: "candy_kingdom",
      name: "Candy Kingdom",
      subtitle: "Sugar glaze mountains and lollipop groves",
      icon: "🍭",
      themeColor: "#fb7185",
      skyColor: "#fbcfe8",
      fogColor: "#fda4af",
      groundColor: "#4c0519",
      accentColor: "#f43f5e",
      unlockLevel: 5,
      unlockCoins: 3500,
      unlockGems: 50,
      musicStyle: "candy_melody",
      particles: "sugar_sprinkles",
      speedModifier: 1.1,
      coinDensity: 1.2,
      gemRate: 0.07,
      previewImg: "assets/images/world_candy_kingdom.jpg",
      obstacles: ["peppermint_roll", "lollipop_barrier", "wafer_arch", "gumdrop_spike"]
    },
    {
      id: "dinosaur_island",
      name: "Dinosaur Island",
      subtitle: "Prehistoric giant ferns and amber volcanos",
      icon: "🌋",
      themeColor: "#ea580c",
      skyColor: "#c2410c",
      fogColor: "#7c2d12",
      groundColor: "#292524",
      accentColor: "#f97316",
      unlockLevel: 8,
      unlockCoins: 6000,
      unlockGems: 80,
      musicStyle: "dino_adventure",
      particles: "ember_sparks",
      speedModifier: 1.15,
      coinDensity: 1.25,
      gemRate: 0.08,
      previewImg: "assets/images/world_dinosaur_island.jpg",
      obstacles: ["amber_rock", "fossil_arch", "steam_vent", "rolling_boulder"]
    },
    {
      id: "ocean_adventure",
      name: "Ocean Adventure",
      subtitle: "Sunken coral gardens and pearl reef currents",
      icon: "🌊",
      themeColor: "#06b6d4",
      skyColor: "#0284c7",
      fogColor: "#0369a1",
      groundColor: "#0f766e",
      accentColor: "#38bdf8",
      unlockLevel: 11,
      unlockCoins: 9000,
      unlockGems: 120,
      musicStyle: "ocean_breeze",
      particles: "bubble_currents",
      speedModifier: 1.2,
      coinDensity: 1.3,
      gemRate: 0.09,
      previewImg: "assets/images/world_ocean_adventure.jpg",
      obstacles: ["coral_reef", "sea_jelly_hazard", "anchor_gate", "bubble_spout"]
    },
    {
      id: "space_adventure",
      name: "Space Adventure",
      subtitle: "Cosmic asteroid tracks and stardust nebulae",
      icon: "🚀",
      themeColor: "#8b5cf6",
      skyColor: "#0f172a",
      fogColor: "#1e1b4b",
      groundColor: "#030712",
      accentColor: "#00f0ff",
      unlockLevel: 14,
      unlockCoins: 13000,
      unlockGems: 160,
      musicStyle: "space_synthwave",
      particles: "cosmic_stardust",
      speedModifier: 1.25,
      coinDensity: 1.35,
      gemRate: 0.1,
      previewImg: "assets/images/world_space_adventure.jpg",
      obstacles: ["laser_hurdle", "asteroid_block", "satellite_dish", "energy_barrier"]
    },
    {
      id: "crystal_mountains",
      name: "Crystal Mountains",
      subtitle: "Iridescent amethyst spires and glittering ice",
      icon: "💎",
      themeColor: "#38bdf8",
      skyColor: "#0e7490",
      fogColor: "#164e63",
      groundColor: "#0369a1",
      accentColor: "#c084fc",
      unlockLevel: 17,
      unlockCoins: 18000,
      unlockGems: 200,
      musicStyle: "crystal_echo",
      particles: "ice_glimmer",
      speedModifier: 1.3,
      coinDensity: 1.4,
      gemRate: 0.12,
      previewImg: "assets/images/world_crystal_mountains.jpg",
      obstacles: ["amethyst_spire", "icicle_gate", "quartz_bridge", "crystal_shards"]
    },
    {
      id: "magical_sky_kingdom",
      name: "Magical Sky Kingdom",
      subtitle: "Golden palace towers amidst sunlit celestial clouds",
      icon: "👑",
      themeColor: "#f59e0b",
      skyColor: "#f59e0b",
      fogColor: "#d97706",
      groundColor: "#fef3c7",
      accentColor: "#fbbf24",
      unlockLevel: 20,
      unlockCoins: 25000,
      unlockGems: 300,
      musicStyle: "sky_orchestral",
      particles: "golden_feathers",
      speedModifier: 1.35,
      coinDensity: 1.5,
      gemRate: 0.15,
      previewImg: "assets/images/world_sky_kingdom.jpg",
      obstacles: ["golden_pillar", "celestial_arch", "cloud_barrier", "winged_totem"]
    }
  ],

  // 5 Original Cute Characters with Vibrant Saturated Colors
  CHARACTERS: [
    {
      id: "milo",
      name: "Milo",
      title: "Adventurous Fox",
      description: "Fast, brave, and naturally curious! Equipped with his golden aviation goggles.",
      baseColor: "#ff7b00",
      secondaryColor: "#ffffff",
      accentColor: "#06b6d4",
      unlocked: true,
      costCoins: 0,
      costGems: 0,
      perk: {
        name: "Magnet Master",
        desc: "+20% Star Magnet Duration & +10% Coin Value",
        magnetBonus: 0.20,
        coinBonus: 0.10
      },
      skins: [
        { id: "classic", name: "Classic Milo", icon: "🦊", unlocked: true, costCoins: 0, costGems: 0 },
        { id: "golden_pilot", name: "Golden Aviator", icon: "👑", unlocked: false, costCoins: 4000, costGems: 40 },
        { id: "starry_ninja", name: "Starry Shadow", icon: "⭐", unlocked: false, costCoins: 8000, costGems: 75 }
      ]
    },
    {
      id: "luna",
      name: "Luna",
      title: "Magical Star Cat",
      description: "Mystical feline wizard who summons starlight and casts protective charms.",
      baseColor: "#9d4edd",
      secondaryColor: "#5b21b6",
      accentColor: "#fbbf24",
      unlocked: false,
      costCoins: 3000,
      costGems: 45,
      perk: {
        name: "Star Sorcery",
        desc: "+25% 2X Multiplier Duration & +15% Star Score",
        multiplierBonus: 0.25,
        scoreBonus: 0.15
      },
      skins: [
        { id: "classic", name: "Mystic Witch", icon: "🐱", unlocked: true, costCoins: 0, costGems: 0 },
        { id: "cosmic_mage", name: "Cosmic Sorceress", icon: "✨", unlocked: false, costCoins: 5000, costGems: 50 },
        { id: "lunar_spirit", name: "Lunar Spirit", icon: "🌙", unlocked: false, costCoins: 9000, costGems: 90 }
      ]
    },
    {
      id: "pip",
      name: "Pip",
      title: "Baby Dragon",
      description: "Cheerful little turquoise dragon with adorable flutter wings and a fiery heart.",
      baseColor: "#00f5d4",
      secondaryColor: "#ff6b6b",
      accentColor: "#ffd166",
      unlocked: false,
      costCoins: 6000,
      costGems: 90,
      perk: {
        name: "Dragon Barrier",
        desc: "+30% Magic Shield Duration & +1 Hit Shield Absorption",
        shieldBonus: 0.30,
        shieldExtraHit: 1
      },
      skins: [
        { id: "classic", name: "Turquoise Hatchling", icon: "🐲", unlocked: true, costCoins: 0, costGems: 0 },
        { id: "ruby_drake", name: "Ruby Flame", icon: "🔥", unlocked: false, costCoins: 7500, costGems: 70 },
        { id: "emerald_royalty", name: "Emerald Prince", icon: "💎", unlocked: false, costCoins: 12000, costGems: 110 }
      ]
    },
    {
      id: "coco",
      name: "Coco",
      title: "Cheerful Panda",
      description: "Chubby, jolly panda explorer with his trusty bamboo backpack and green vest.",
      baseColor: "#1e293b",
      secondaryColor: "#ffffff",
      accentColor: "#10b981",
      unlocked: false,
      costCoins: 10000,
      costGems: 140,
      perk: {
        name: "Bountiful Bamboo",
        desc: "+25% Cloud Wings Flight Duration & +20% Coin Value",
        wingsBonus: 0.25,
        coinBonus: 0.20
      },
      skins: [
        { id: "classic", name: "Safari Explorer", icon: "🐼", unlocked: true, costCoins: 0, costGems: 0 },
        { id: "zen_master", name: "Zen Bamboo Master", icon: "🎋", unlocked: false, costCoins: 10000, costGems: 95 },
        { id: "golden_bamboo", name: "Golden Panda", icon: "💛", unlocked: false, costCoins: 15000, costGems: 140 }
      ]
    },
    {
      id: "nova",
      name: "Nova",
      title: "Cosmic Space Bunny",
      description: "High-tech bunny with a luminous astronaut visor and anti-gravity rocket ears.",
      baseColor: "#f8fafc",
      secondaryColor: "#00f0ff",
      accentColor: "#f43f5e",
      unlocked: false,
      costCoins: 16000,
      costGems: 220,
      perk: {
        name: "Starlight Quantum",
        desc: "+30% Rare Magic Gem Spawns & +25% Speed Boost",
        gemBonus: 0.30,
        speedBonus: 0.10
      },
      skins: [
        { id: "classic", name: "Cosmic Astronaut", icon: "🐰", unlocked: true, costCoins: 0, costGems: 0 },
        { id: "cyber_neon", name: "Cyberpunk Glow", icon: "⚡", unlocked: false, costCoins: 14000, costGems: 130 },
        { id: "galaxy_empress", name: "Galaxy Empress", icon: "🌌", unlocked: false, costCoins: 20000, costGems: 180 }
      ]
    }
  ],

  // In-Game Power-Up Items & Upgrades
  POWER_UPS: {
    MAGNET: {
      id: "magnet",
      name: "Star Magnet",
      icon: "🧲",
      color: "#e74c3c",
      description: "Draws all nearby golden coins & stars directly to you!",
      baseDuration: 8.0,
      upgradeIncrease: 1.5,
      maxLevel: 5,
      upgradeCosts: [500, 1200, 2500, 5000, 10000]
    },
    SHIELD: {
      id: "shield",
      name: "Magic Shield",
      icon: "🛡️",
      color: "#3498db",
      description: "Protects against one obstacle crash without ending your run!",
      baseDuration: 10.0,
      upgradeIncrease: 2.0,
      maxLevel: 5,
      upgradeCosts: [600, 1500, 3000, 6000, 12000]
    },
    WINGS: {
      id: "wings",
      name: "Cloud Wings",
      icon: "🪽",
      color: "#f1c40f",
      description: "Take to the skies above all hazards on a lane packed with coins!",
      baseDuration: 7.0,
      upgradeIncrease: 1.5,
      maxLevel: 5,
      upgradeCosts: [800, 2000, 4000, 8000, 15000]
    },
    MULTIPLIER: {
      id: "multiplier",
      name: "2X Magic Star",
      icon: "⭐",
      color: "#9b59b6",
      description: "Doubles every score point you earn while active!",
      baseDuration: 10.0,
      upgradeIncrease: 2.0,
      maxLevel: 5,
      upgradeCosts: [500, 1200, 2500, 5000, 10000]
    },
    GEM_BURST: {
      id: "gem_burst",
      name: "Gem Burst",
      icon: "💎",
      color: "#1abc9c",
      description: "Instantly scatters a fountain of rare magic gems into your path!",
      baseDuration: 0,
      instantGems: 5,
      maxLevel: 5,
      upgradeCosts: [1000, 2500, 5000, 10000, 20000]
    }
  },

  // Daily Login 7-Day Streak Rewards
  DAILY_REWARDS: [
    { day: 1, type: "coins", amount: 500, label: "500 Coins", icon: "🪙" },
    { day: 2, type: "gems", amount: 15, label: "15 Gems", icon: "💎" },
    { day: 3, type: "coins", amount: 1200, label: "1,200 Coins", icon: "🪙" },
    { day: 4, type: "powerup", powerup: "magnet", levelBonus: 1, label: "Magnet Boost", icon: "🧲" },
    { day: 5, type: "gems", amount: 35, label: "35 Gems", icon: "💎" },
    { day: 6, type: "coins", amount: 3000, label: "3,000 Coins", icon: "💰" },
    { day: 7, type: "jackpot", coins: 5000, gems: 75, skin: "milo_golden", label: "Epic Chest + Skin!", icon: "🎁" }
  ],

  // 15 Achievements
  ACHIEVEMENTS: [
    { id: "first_dash", title: "First Steps", desc: "Complete your very first run in Wonder Dash", reward: { coins: 300, gems: 5 }, goal: 1, icon: "👟" },
    { id: "coin_hoarder_1", title: "Coin Collector", desc: "Collect 500 total coins across all runs", reward: { coins: 500, gems: 10 }, goal: 500, icon: "🪙" },
    { id: "coin_hoarder_2", title: "Treasure Hunter", desc: "Collect 5,000 total coins", reward: { coins: 2000, gems: 30 }, goal: 5000, icon: "💰" },
    { id: "distance_1", title: "Marathon Runner", desc: "Run a single distance of 1,000 meters", reward: { coins: 800, gems: 15 }, goal: 1000, icon: "🏃" },
    { id: "distance_2", title: "Endless Wanderer", desc: "Run a single distance of 3,000 meters", reward: { coins: 3000, gems: 50 }, goal: 3000, icon: "🏆" },
    { id: "high_score_1", title: "Rising Star", desc: "Reach a high score of 10,000 points", reward: { coins: 1000, gems: 20 }, goal: 10000, icon: "⭐" },
    { id: "high_score_2", title: "Champion of Wonders", desc: "Reach a high score of 50,000 points", reward: { coins: 5000, gems: 75 }, goal: 50000, icon: "🌟" },
    { id: "jump_master", title: "Leap of Faith", desc: "Perform 100 successful jumps over obstacles", reward: { coins: 800, gems: 15 }, goal: 100, icon: "🦘" },
    { id: "slide_pro", title: "Smooth Slider", desc: "Perform 80 slides under high obstacles", reward: { coins: 800, gems: 15 }, goal: 80, icon: "⛷️" },
    { id: "power_surge", title: "Supercharged", desc: "Collect 50 power-ups in total", reward: { coins: 1500, gems: 25 }, goal: 50, icon: "⚡" },
    { id: "flyer", title: "Sky Soarer", desc: "Use Cloud Wings 15 times", reward: { coins: 1200, gems: 20 }, goal: 15, icon: "🪽" },
    { id: "gem_seeker", title: "Gem Connoisseur", desc: "Collect 100 rare magic gems in runs", reward: { coins: 2500, gems: 40 }, goal: 100, icon: "💎" },
    { id: "world_explorer", title: "World Voyager", desc: "Unlock 4 different magical worlds", reward: { coins: 3500, gems: 60 }, goal: 4, icon: "🌍" },
    { id: "hero_squad", title: "Gather the Friends", desc: "Unlock 3 different original characters", reward: { coins: 4000, gems: 80 }, goal: 3, icon: "🐾" },
    { id: "daily_devotee", title: "Daily Adventurer", desc: "Claim 7 daily streak rewards", reward: { coins: 5000, gems: 100 }, goal: 7, icon: "📅" }
  ]
};

// Make accessible globally
if (typeof window !== "undefined") {
  window.WONDER_CONFIG = WONDER_CONFIG;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = WONDER_CONFIG;
}
