/**
 * Photography shot by our team (Canon R5 originals, resized for the web in /public/media/photos).
 * Listing photos are HDR-merged finals; event photos are client events.
 */
export type Photo = { src: string; alt: string; w: number; h: number };

/** Listing photography — interiors, exteriors and outdoor living. */
export const RE_PHOTOS: Photo[] = [
  { src: "/media/photos/twilight-deck.jpg", alt: "Twilight exterior with deck, 13521 Granite Rock Dr", w: 1600, h: 1067 },
  { src: "/media/photos/twilight-rambler.jpg", alt: "Twilight exterior, 8100 St David Ct", w: 1600, h: 1061 },
  { src: "/media/photos/craftsman-exterior.jpg", alt: "Craftsman exterior", w: 1600, h: 1067 },
  { src: "/media/photos/chandelier-kitchen.jpg", alt: "White kitchen and dining room, 224 Stoic Street", w: 1600, h: 1067 },
  { src: "/media/photos/great-room.jpg", alt: "Vaulted great room", w: 1600, h: 1067 },
  { src: "/media/photos/twilight-colonial.jpg", alt: "Brick colonial at twilight", w: 1600, h: 1065 },
  { src: "/media/photos/primary-suite.jpg", alt: "Primary suite, 3706 Edward Bluff", w: 1600, h: 1067 },
  { src: "/media/photos/spa-bath.jpg", alt: "Spa bath with freestanding tub, 3605 17th Street N", w: 1600, h: 1067 },
  { src: "/media/photos/pool-exterior.jpg", alt: "Pool and spa", w: 1600, h: 1067 },
  { src: "/media/photos/bay-living.jpg", alt: "Living room with bay window, 7914 Saint George", w: 1600, h: 1067 },
  { src: "/media/photos/library.jpg", alt: "Library with skylight, 1410 Cedar Avenue", w: 1600, h: 1067 },
  { src: "/media/photos/twilight-brick.jpg", alt: "Twilight exterior, 13521 Granite Rock Dr", w: 1600, h: 1067 },
  { src: "/media/photos/screened-porch.jpg", alt: "Screened porch, 224 Stoic Street", w: 1600, h: 1067 },
  { src: "/media/photos/white-kitchen.jpg", alt: "Renovated white kitchen, 202 Nimitz Ave", w: 1600, h: 1067 },
  { src: "/media/photos/sunroom.jpg", alt: "Sunroom, 8100 St David Ct", w: 1600, h: 1067 },
  { src: "/media/photos/home-office.jpg", alt: "Home office, 3706 Edward Bluff", w: 1600, h: 1066 },
  { src: "/media/photos/living-dining.jpg", alt: "Open living and dining room, 2703 Brownlee Ct", w: 1600, h: 1067 },
  { src: "/media/photos/marble-shower.jpg", alt: "Marble shower, 3706 Edward Bluff", w: 1600, h: 1067 },
  { src: "/media/photos/twilight-garden.jpg", alt: "Twilight garden view, 8001 Rockwood Ct", w: 1600, h: 1067 },
  { src: "/media/photos/fireplace-living.jpg", alt: "Living room with stone fireplace", w: 1600, h: 1067 },
  { src: "/media/photos/garden-dining.jpg", alt: "Dining room, 8001 Rockwood Ct", w: 1600, h: 1066 },
  { src: "/media/photos/nursery.jpg", alt: "Nursery, 704 Vestal St", w: 1600, h: 1066 },
  { src: "/media/photos/staged-living.jpg", alt: "Staged living room, 10465 Sugarberry", w: 1600, h: 1067 },
  { src: "/media/photos/family-room.jpg", alt: "Family room with fireplace, 704 Vestal St", w: 1600, h: 1067 },
  { src: "/media/photos/breakfast-nook.jpg", alt: "Breakfast nook, 5473 Loggerhead", w: 1600, h: 1067 },
  { src: "/media/photos/fireplace-dining.jpg", alt: "Dining room with fireplace, 15648 Avocet Loop", w: 1600, h: 1067 },
  { src: "/media/photos/tray-bedroom.jpg", alt: "Bedroom with tray ceiling, 4667 Kell Ln", w: 1600, h: 1067 },
  { src: "/media/photos/pool-house.jpg", alt: "Backyard pool", w: 1600, h: 1067 },
  { src: "/media/photos/twilight-townhouse.jpg", alt: "Townhouse at twilight, 704 Vestal St", w: 1600, h: 1067 },
];

/** Elevate Property Group — team night at the ballpark. */
export const EPG_PHOTOS: Photo[] = [
  { src: "/media/photos/suite-sunset.jpg", alt: "Elevate Property Group suite party at sunset", w: 1600, h: 1067 },
  { src: "/media/photos/ballpark.jpg", alt: "Ballpark view from the Elevate Property Group suite", w: 1600, h: 1067 },
  { src: "/media/photos/step-repeat-1.jpg", alt: "Elevate Property Group step-and-repeat portraits", w: 1067, h: 1600 },
  { src: "/media/photos/suite-view.jpg", alt: "Elevate Property Group guests watching the game", w: 1600, h: 1067 },
  { src: "/media/photos/suite-event.jpg", alt: "Elevate Property Group suite event at the ballpark", w: 1600, h: 1067 },
  { src: "/media/photos/step-repeat-2.jpg", alt: "Elevate Property Group step-and-repeat portraits", w: 1067, h: 1600 },
  { src: "/media/photos/ballpark-guests.jpg", alt: "Elevate Property Group guests at the ballpark", w: 1600, h: 1067 },
];

/** Right Fit Realty — client event at 2 Silos Brewery. */
export const SILOS_PHOTOS: Photo[] = [
  { src: "/media/photos/2-silos-stage.jpg", alt: "The Yard at 2 Silos Brewery \u2014 Right Fit Realty client event", w: 1600, h: 1067 },
  { src: "/media/photos/2-silos-taproom.jpg", alt: "Taproom at 2 Silos Brewery \u2014 Right Fit Realty client event", w: 1600, h: 1067 },
  { src: "/media/photos/2-silos-garden.jpg", alt: "Beer garden at 2 Silos Brewery \u2014 Right Fit Realty client event", w: 1600, h: 1067 },
  { src: "/media/photos/right-fit-table.jpg", alt: "Right Fit Realty welcome table", w: 1600, h: 1067 },
  { src: "/media/photos/2-silos-cider.jpg", alt: "Fall drinks at 2 Silos Brewery \u2014 Right Fit Realty client event", w: 1600, h: 1067 },
];

/** Around Washington, D.C. */
export const DC_PHOTOS: Photo[] = [
  { src: "/media/photos/monument-kites.jpg", alt: "Washington Monument during the kite festival", w: 1600, h: 1067 },
  { src: "/media/photos/cherry-blossoms.jpg", alt: "Cherry blossoms at the Tidal Basin", w: 1600, h: 1067 },
  { src: "/media/photos/kite-festival.jpg", alt: "Kite festival on the National Mall", w: 1600, h: 1067 },
  { src: "/media/photos/blossom-lantern.jpg", alt: "Japanese lantern and cherry blossoms", w: 1600, h: 1067 },
];

/** Homepage photography wall — a mix of everything. */
export const HOME_PHOTOS: Photo[] = [
  { src: "/media/photos/twilight-deck.jpg", alt: "Twilight exterior with deck, 13521 Granite Rock Dr", w: 1600, h: 1067 },
  { src: "/media/photos/suite-sunset.jpg", alt: "Elevate Property Group suite party at sunset", w: 1600, h: 1067 },
  { src: "/media/photos/great-room.jpg", alt: "Vaulted great room", w: 1600, h: 1067 },
  { src: "/media/photos/2-silos-stage.jpg", alt: "The Yard at 2 Silos Brewery \u2014 Right Fit Realty client event", w: 1600, h: 1067 },
  { src: "/media/photos/primary-suite.jpg", alt: "Primary suite, 3706 Edward Bluff", w: 1600, h: 1067 },
  { src: "/media/photos/twilight-rambler.jpg", alt: "Twilight exterior, 8100 St David Ct", w: 1600, h: 1061 },
  { src: "/media/photos/cherry-blossoms.jpg", alt: "Cherry blossoms at the Tidal Basin", w: 1600, h: 1067 },
  { src: "/media/photos/spa-bath.jpg", alt: "Spa bath with freestanding tub, 3605 17th Street N", w: 1600, h: 1067 },
  { src: "/media/photos/2-silos-taproom.jpg", alt: "Taproom at 2 Silos Brewery \u2014 Right Fit Realty client event", w: 1600, h: 1067 },
  { src: "/media/photos/chandelier-kitchen.jpg", alt: "White kitchen and dining room, 224 Stoic Street", w: 1600, h: 1067 },
  { src: "/media/photos/twilight-colonial.jpg", alt: "Brick colonial at twilight", w: 1600, h: 1065 },
  { src: "/media/photos/monument-kites.jpg", alt: "Washington Monument during the kite festival", w: 1600, h: 1067 },
];
