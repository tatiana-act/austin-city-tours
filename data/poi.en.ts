import type { PoiId } from '@/data/poi.programs';
import type { PoiText } from '@/types/poi';

// Names are the real English proper names, not transliterations of the Russian:
// the English page can only be found by them.
export const poiEn: Record<PoiId, PoiText> = {
  capitol: {
    name: 'Texas State Capitol',
    description:
      "The 1888 Texas State Capitol dominates downtown Austin at the head of Congress Avenue. At over 300 feet tall, it is one of the tallest state capitols in the nation — taller even than the U.S. Capitol — and houses the offices of the Governor and Legislature.",
  },
  old_bakery: {
    name: 'Old Bakery and Emporium',
    description:
      "Built in 1876 for Swedish baker Charles Lundberg, this is one of the oldest surviving commercial structures on Congress Avenue. Now a city-run artisan emporium, it sits half a block from the Capitol grounds.",
  },
  millet: {
    name: 'Millett Opera House',
    description:
      "Charles F. Millett's 1878 Opera House on Ninth Street was, at its opening, one of the largest performance halls in Texas, with 24-inch limestone walls and 800 seats. Though its stage days are over, the building survives as the home of the private Austin Club.",
  },
  st_mary: {
    name: "Saint Mary's Cathedral",
    description:
      "Designed by Nicholas J. Clayton and completed in 1884, Saint Mary Cathedral is the mother church of the Catholic Diocese of Austin. This Gothic Revival limestone landmark, with roots in the 1850s, anchors the block at 10th and Brazos.",
  },
  paramount: {
    name: 'Paramount Theatre',
    description:
      "The 1915 Paramount Theatre on Congress Avenue is a Classical Revival landmark by architect John Eberson. Listed on the National Register of Historic Places, it has hosted vaudeville, films, and live performances for more than a century.",
  },
  norwood: {
    name: 'Norwood Tower',
    description:
      "The 1929 Norwood Tower at 7th and Colorado is Austin's only Gothic Revival high-rise. When it opened it was the city's tallest commercial building and its first fully air-conditioned office tower — a monument to 1920s downtown ambition.",
  },
  angelina: {
    name: 'Angelina Eberly Statue',
    description:
      "At Sixth and Congress, a bronze Angelina Eberly by sculptor Pat Oliphant marks the spot where the innkeeper fired a six-pound cannon in 1842 to rouse the town against President Sam Houston's men hauling off the Republic's archives. Her shot ignited the 'Archive War' and helped keep Austin the capital.",
  },
  driskill: {
    name: 'The Driskill',
    description:
      "Colonel Jesse Driskill's 1886 Romanesque Revival hotel at 6th and Brazos is the oldest operating hotel in Austin. Once billed as the finest hotel south of St. Louis, the Driskill remains one of the most storied landmarks in Texas.",
  },
  txdot: {
    name: 'TxDOT Headquarters',
    description:
      "The 1933 Dewitt C. Greer State Highway Building at 125 E. 11th Street has housed the Texas Department of Transportation since it opened. Designed by Carleton Adams, this eight-story Moderne building sits a block east of the Capitol.",
  },
  dep_housing: {
    name: 'Texas Department of Housing and Community Affairs',
    description:
      "Created in 1991, the Texas Department of Housing and Community Affairs is the state's lead agency for affordable housing and community assistance, headquartered in a 1953 Modern building at 221 E. 11th Street across from the Capitol.",
  },
  land_office: {
    name: 'General Land Office Building',
    description:
      "The 1857 Old General Land Office Building on the Capitol grounds is the oldest surviving state government office building in Austin. Designed in castle-like Rundbogenstil style by German architect C. C. Stremme, it later employed O. Henry and now serves as the Capitol Visitors Center.",
  },
  history_cen: {
    name: 'Austin History Center',
    description:
      "The 1933 Renaissance Revival building at 810 Guadalupe began life as Austin's central library and today houses the Austin History Center, the city's primary local-history archive. It sits beside Wooldridge Square on one of Austin's original 1839 town squares.",
  },
  woolridge: {
    name: 'Wooldridge Square',
    description:
      "Wooldridge Square is the only one of Austin's four original 1839 town squares still serving as a park. Dedicated in 1909, its bowl-shaped lawn and Classical Revival gazebo form a natural amphitheater between the courthouse and the History Center.",
  },
  travis_court: {
    name: 'Travis County Courthouse',
    description:
      "The 1931 Travis County Courthouse at 1000 Guadalupe is a PWA Moderne landmark named for civil-rights plaintiff Heman Marion Sweatt. The third courthouse built for the county, it rises beside Wooldridge Square just north of the old central library.",
  },
  hirshfield: {
    name: 'Henry Hirshfeld Honeymoon Cottage',
    description:
      "The 1873 Honeymoon Cottage at 305 W. 9th Street was built for merchant Henry Hirshfeld and his bride Jennie, paired with an 1885 Italianate residence by John Andrewartha. Together they form one of downtown Austin's rare surviving family compounds, on the National Register since 1973.",
  },
  bremond: {
    name: 'Bremond Block Historic District',
    description:
      "The Bremond Block is a surviving cluster of eleven Victorian homes built between the 1850s and 1910 for the banking and mercantile Bremond family. Listed on the National Register in 1970, it is one of Texas's few intact upper-class 19th-century residential districts.",
  },
  john_bremond: {
    name: 'John Bremond House',
    description:
      "The 1886 John Bremond Jr. House at Seventh and Guadalupe is the showpiece of the Bremond Block — a Second Empire mansion with a crested mansard roof and cast-iron gallery. Since 1969 it has served as headquarters of the Texas Classroom Teachers Association.",
  },
  pier_bremond: {
    name: 'Pierre Bremond House',
    description:
      "Built in 1898 at 402 W. 7th Street, the Pierre Bremond House was the last of the Bremond Block mansions to rise. This Late Victorian home completes the family compound that defines one of Austin's premier historic districts.",
  },
  eug_bremond: {
    name: 'Eugene Bremond House',
    description:
      "The 1873 Eugene Bremond House at 404 W. 7th Street is an Italianate home at the heart of the family compound that gives the Bremond Block its name. Eugene, with brother John, anchored the banking and mercantile fortunes that built the district.",
  },
  north_cottage: {
    name: 'North Cottage',
    description:
      "The so-called North Cottage sits beside Chateau Bellevue on San Antonio Street in the Bremond Block area. Its identity is ambiguous in the sources, but it most likely refers to the 1874 cottage of Harvey and Catherine North, founders of the adjacent Chateau.",
  },
  chateau: {
    name: 'Chateau Bellevue',
    description:
      "Chateau Bellevue, the 1874 Romanesque Revival mansion at 708 San Antonio Street, was built by Harvey and Catherine North and remodeled in 1892 by architect Alfred Giles for Major Ira Evans. Home of the Austin Woman's Club since 1929, it is the crown jewel of the Bremond Block.",
  },
  mayfield: {
    name: 'Mayfield Park',
    description:
      "Just off West 35th Street, Mayfield Park pairs a restored 1870s cottage with terraced gardens, koi ponds, and a flock of free-roaming peacocks on a bluff over Lake Austin. Left to the city in 1971 and listed on the National Register, it is a serene relic of old Austin.",
  },
  covert: {
    name: 'Covert Park at Mount Bonnell',
    description:
      "Climb the 106 limestone steps to the top of Mount Bonnell — one of the highest public overlooks in Austin — for a sweeping view of Lake Austin, the Pennybacker Bridge, and the downtown skyline. Donated as Covert Park in 1939, it has been an Austin sightseeing staple since the 1850s.",
  },
  bat_bridge: {
    name: 'Ann W. Richards Congress Avenue Bat Bridge',
    description:
      "Each summer evening at sunset, up to 1.5 million Mexican free-tailed bats stream out from beneath the Congress Avenue Bridge in one of Austin's signature free spectacles. The world's largest urban bat colony took hold after the bridge's 1980 reconstruction created perfect roosting crevices.",
  },
  williamson: {
    name: 'The Williamson Museum',
    description:
      "Set inside the former Farmers State Bank building on Georgetown's historic square, the Williamson Museum tells the story of the county from pioneer days forward. Established in 1997 and free to visit, it also offers guided tours of the courthouse across the street.",
  },
  wil_court: {
    name: 'Williamson County Courthouse',
    description:
      "The copper-domed Williamson County Courthouse has anchored Georgetown's town square since 1911 — the fifth such building and a Beaux-Arts showcase by Austin architect Charles H. Page. Restored in 2008 to its classical grandeur, it remains the working centerpiece of one of Texas's prettiest downtowns.",
  },
  onion_dome: {
    name: 'Old Masonic Lodge Building',
    description:
      "Look up at the corner of Main and 7th in Georgetown for one of Texas's rarest architectural touches: a Byzantine onion dome crowning the 1900 Old Masonic Lodge. Built by the Belford Lumber Company for the San Gabriel Masonic Lodge, the dome vanished for decades and has been replicated twice since.",
  },
  city_post: {
    name: 'City Post',
    description:
      "Georgetown's 1932 federal post office — a Georgian Revival gem of pink Texas granite and imported marble — now houses City Post Chophouse, preserving its original mailboxes and mahogany trim. It is a contributing property in the Courthouse Historic District.",
  },
  gtown_art: {
    name: 'Georgetown Art Center',
    description:
      "Just off the Georgetown square, the city's old firehouse (circa 1892) has been reborn as the Georgetown Art Center, with wide engine-bay doors now framing a rotating gallery. Run by the nonprofit Georgetown Art Works, it blends local history with contemporary art and classes.",
  },
  grace_center: {
    name: 'Grace Heritage Center',
    description:
      "This tiny Carpenter Gothic chapel, built in 1881–1882 for Grace Episcopal Church, is Georgetown's oldest wood-framed church and sits just off the historic square. Moved twice to save it, the deconsecrated sanctuary now serves as a heritage center and event venue.",
  },
  chisholm: {
    name: 'Chisholm Trail and Brushy Creek',
    description:
      "Round Rock grew up at a natural ford across Brushy Creek, where a round limestone rock gave the town its name and guided cattle drives on the Chisholm Trail from 1867 to 1884. Wagon ruts worn into that rock are still visible today — a tangible link to the post–Civil War cattle drives that opened Texas to market.",
  },
  rr_hall: {
    name: 'Round Rock City Hall',
    description:
      "Round Rock City Hall at 221 E. Main Street sits in the heart of the city's 1876 railroad-era downtown, where limestone commercial buildings still line the historic district. It is the modern civic hub of one of the fastest-growing cities in the United States.",
  },
  woodbine: {
    name: 'Woodbine Mansion',
    description:
      "Round Rock's Woodbine Mansion was built 1895–1900 by the Page Brothers for a prosperous Swedish-immigrant family, then restyled in 1931 from Queen Anne to Neoclassical with a row of Ionic columns. A Recorded Texas Historic Landmark since 1973, it is now an events venue.",
  },
  rr_post: {
    name: 'Round Rock Old Post Office',
    description:
      "At 107 S. Mays Street stands Round Rock's 1878 Old Post Office and Masonic Lodge, a brick building with uniquely detailed parapets and arches. It hosted the town's post office for some 70 years and the Masonic Lodge for a century, anchoring the National Register historic district.",
  },
  sam_bass: {
    name: 'Round Rock Cemetery and Sam Bass Gravesite',
    description:
      "In Old Round Rock Cemetery lies Sam Bass, the 19th-century train robber killed by Texas Rangers in the 1878 downtown shootout — a Wild West legend the city still commemorates. His grave, chipped away by souvenir hunters, is now marked with a modern stone near a historic freedmen's burial ground.",
  },
  sw_university: {
    name: 'Southwestern University',
    description:
      "Founded in 1840 from the charter of Rutersville College, Southwestern University in Georgetown is widely regarded as Texas's oldest institution of higher education — a claim affirmed by a 2016 Texas Senate proclamation. The red-brick campus anchors Georgetown's southern edge and a deep Methodist educational legacy.",
  },
  inner_space: {
    name: 'Inner Space Cavern',
    description:
      "Hidden beneath I-35 for tens of thousands of years, Inner Space Cavern was discovered in 1963 when highway drillers punched through 40 feet of limestone into a vast, fossil-filled cave. Now a show cave since 1966, it offers tours through formations that are still actively growing.",
  },
};
