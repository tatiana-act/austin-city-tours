import type { PoiId } from '@/data/poi.programs';
import type { PoiText } from '@/types/poi';

// Names are the real English proper names, not transliterations of the Russian:
// the English page can only be found by them.
export const poiEn: Record<PoiId, PoiText> = {
  capitol: {
    name: 'Texas State Capitol',
    description:
      "The 1888 Capitol building towers over downtown Austin at the head of Congress Avenue. It is one of the tallest state capitols in the United States — taller even than the Capitol in Washington.",
  },
  old_bakery: {
    name: 'Old Bakery and Emporium',
    description:
      "On Congress Avenue, just a stone's throw from the Capitol, stands the old bakery building. It was built back in 1876 for Swedish baker Charles Lundberg. Inside, elements of the original historic décor have been preserved.",
  },
  millet: {
    name: 'Millett Opera House',
    description:
      "Charles Millett's 1878 Opera House on Ninth Street was, at its opening, one of the largest performance halls in Texas — a full 800 seats! Though the stage is gone, the building survives to this day with minimal changes, and now belongs to the private Austin's Club.",
  },
  st_mary: {
    name: "Saint Mary's Cathedral",
    description:
      "Designed by Nicholas J. Clayton and completed in 1884, Saint Mary Cathedral is the mother church of the Catholic Diocese of Austin.",
  },
  paramount: {
    name: 'Paramount Theatre',
    description:
      "The 1915 Paramount Theatre on Congress Avenue is built in the Neoclassical style. Listed on the National Register of Historic Places, it has delighted audiences with vaudeville, film, and live performances for more than a century. Above the windows sit notable reliefs of theatrical masks.",
  },
  norwood: {
    name: 'Norwood Tower',
    description:
      "Austin's only Neo-Gothic skyscraper was built in 1929 and partially rebuilt in 1983. It was a favorite building of President Lyndon Johnson's wife, Claudia \"Lady Bird\" Johnson; her daughters purchased the penthouse and still own it today.",
  },
  angelina: {
    name: 'Angelina Eberly Statue',
    description:
      "This monument honors a brave woman, innkeeper Angelina Eberly. On a dark night in 1842 she fired a cannon to rally the townspeople against President Sam Houston's men, who were hauling away the Republic's archives. Her decisive act preserved Austin's status as the capital of Texas.",
  },
  driskill: {
    name: 'The Driskill',
    description:
      "The 1886 Driskill hotel, built in the Romanesque Revival style at the corner of 6th and Brazos, is the oldest operating hotel in Austin. Once famed as the finest hotel south of St. Louis, the Driskill remains one of the most legendary landmarks in Texas.",
  },
  txdot: {
    name: 'TxDOT Headquarters',
    description:
      "This eight-story 1933 building is one of the finest examples of Art Deco style. By day the Texas Department of Transportation runs things here, but by night the building passes into the realm of ghosts and spirits. The last successful hunt for otherworldly forces took place in 2010!",
  },
  land_office: {
    name: 'General Land Office Building',
    description:
      "Built in 1857 in the style of German Baroque castles. For a time William Sydney Porter — the future writer O. Henry — worked here.",
  },
  history_cen: {
    name: 'Austin History Center',
    description:
      "A 1933 building in the Neo-Renaissance style. Austin's former central library, today it holds the city's main archive: historical documents, photographs, and letters — witnesses to times gone by.",
  },
  woolridge: {
    name: 'Wooldridge Square',
    description:
      "In 1909, through the efforts of Mayor Alexander Wooldridge, one of Austin's earliest squares was redeveloped as a park. The park's crown jewel is a charming gazebo-pergola in the Neoclassical style.",
  },
  travis_court: {
    name: 'Travis County Courthouse',
    description:
      "North of Wooldridge Square rises the Travis County Courthouse, built in the Art Deco style. The building's entrance is adorned with beautiful bas-reliefs.",
  },
  hirshfield: {
    name: 'Henry Hirshfeld Mansion',
    description:
      "Built in 1886 for a businessman, banker, and civic leader, it became a reflection of his life's success. Beside it survives an 1873 cottage that Hirshfeld built for his young family when he was still a small entrepreneur.",
  },
  bremond: {
    name: 'Bremond Block Historic District',
    description:
      "A jewel of Austin, an elite district of several generations of a single family of entrepreneurs and bankers. An ensemble of eleven Victorian homes built between 1850 and 1910 for the Bremond family.",
  },
  john_bremond: {
    name: 'John Bremond House',
    description:
      "The 1886 John Bremond House is the jewel of the Bremond Block, the most beautiful mansion in the Second French Empire style. Since 1969 it has housed the headquarters of the Texas Classroom Teachers Association.",
  },
  pier_bremond: {
    name: 'Pierre Bremond House',
    description:
      "Built in 1898, the Pierre Bremond House completed the formation of the Bremond family block. This home is built in a strict yet elegant Queen Anne style.",
  },
  eug_bremond: {
    name: 'Eugene Bremond House',
    description:
      "The 1873 Eugene Bremond House is an Italian-style residence, the only surviving wooden mansion in the Bremond Block.",
  },
  north_cottage: {
    name: 'North Cottage',
    description:
      "An 1874 cottage of Harvey and Catherine North, founders of the nearby Chateau Bellevue.",
  },
  chateau: {
    name: 'Chateau Bellevue',
    description:
      "Chateau Bellevue, an 1874 Romanesque Revival mansion, was built by architect Alfred Giles for Harvey and Catherine North and remodeled in 1892 for Major Ira Evans. Since 1929 it has been the home of the Austin Woman's Club. The jewel of the Bremond Block!",
  },
  mayfield: {
    name: 'Mayfield Park',
    description:
      "A fully restored 1870s cottage with terraced gardens, koi ponds, and a flock of free-roaming peacocks. A serene corner of old Austin.",
  },
  covert: {
    name: 'Covert Park at Mount Bonnell',
    description:
      "Climb the limestone steps to the top of Mount Bonnell — one of the highest overlooks in Austin — and you'll be rewarded with wonderful views of a bend in the Colorado River and the downtown skyscrapers.",
  },
  bat_bridge: {
    name: 'Ann W. Richards Congress Avenue Bat Bridge',
    description:
      "Every summer evening at sunset you can witness a mesmerizing sight: thousands upon thousands of bats stream out from beneath the bridge for their evening hunt. The world's largest urban colony of Mexican free-tailed bats took hold after the bridge's 1980 reconstruction, which created ideal conditions for roosting.",
  },
  williamson: {
    name: 'The Williamson Museum',
    description:
      "The history of the county from its first settlers to the present day. The museum is housed in the former Farmers State Bank building on Georgetown's historic square.",
  },
  wil_court: {
    name: 'Williamson County Courthouse',
    description:
      "Built with Masonic funds in the Beaux-Arts style. It was here that one of Texas's most famous cases of a century ago was heard: the case of Dan Moody versus the Ku Klux Klan.",
  },
  onion_dome: {
    name: 'Old Masonic Lodge Building',
    description:
      "Built by Charles Belford in 1900 on commission from the San Gabriel Masonic Lodge. The building's most unusual feature is its decorative onion-shaped dome.",
  },
  city_post: {
    name: 'City Post',
    description:
      "The building is constructed in a strict Neoclassical style. At various times it has housed both the federal post office and City Hall, and in 2021 the City Post Chophouse restaurant opened. Inside, the original finishes from its days as a post office have been preserved.",
  },
  gtown_art: {
    name: 'Georgetown Art Center',
    description:
      "The old firehouse (circa 1892) has been rebuilt as an art center. Here local history meets contemporary art.",
  },
  grace_center: {
    name: 'Grace Heritage Center',
    description:
      "This intimate Gothic-style chapel, built in 1881–1882 for Grace Episcopal Church, is Georgetown's oldest wooden house of worship, standing by the historic square. Moved twice to save it, today it serves as a heritage center and event venue.",
  },
  chisholm: {
    name: 'Chisholm Trail and Brushy Creek',
    description:
      "Round Rock grew up at a natural ford across Brushy Creek. Since a settlement named Brushy Creek already existed in Texas, the place was named for the round limestone rock lying in the creek nearby. That is how Round Rock got its name.",
  },
  rr_hall: {
    name: 'Round Rock City Hall',
    description:
      "Round Rock City Hall stands in the heart of downtown, where limestone buildings form a historic district. It is the modern hub of one of the fastest-growing cities in the United States.",
  },
  woodbine: {
    name: 'Woodbine Mansion',
    description:
      "The Woodbine Mansion in Round Rock was built in 1895–1900 by the Page Brothers for a prosperous family of Swedish immigrants, and remodeled in 1931 in the Neoclassical style.",
  },
  rr_post: {
    name: 'Round Rock Old Post Office',
    description:
      "Round Rock's Old Post Office is an 1878 brick building. On the ground floor the city post office operated for over 70 years, while the upper floor long housed a Masonic lodge.",
  },
  sam_bass: {
    name: 'Round Rock Cemetery and Sam Bass Gravesite',
    description:
      "In Round Rock's old cemetery rests Sam Bass, a 19th-century train robber — a Wild West legend the city still honors to this day. One of Round Rock's main streets is named in his honor!",
  },
  sw_university: {
    name: 'Southwestern University',
    description:
      "Founded in 1840, Southwestern University in Georgetown is considered the oldest institution of higher education in Texas. Today it is a small private university.",
  },
  inner_space: {
    name: 'Inner Space Cavern',
    description:
      "Hidden beneath Interstate 35 for tens of thousands of years, Inner Space Cavern was only discovered in 1963, when highway drillers broke through 40 feet of limestone into a vast cave full of fossils.",
  },
};
