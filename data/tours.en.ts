import { TourProgram } from '@/types/tour';

export const tours: TourProgram[] = [
    {
        id: 'Acap',
        title: 'Walking tour of downtown Austin',
        shortTitle: 'Downtown Austin tour',
        description:
            "We will stroll along the famous Congress Avenue, the city’s main street where the spirit of old Austin is still preserved. We will admire historic buildings and learn which of them are mentioned in O. Henry’s stories, pop into a bakery-museum, and visit the legendary Driskill Hotel — a true architectural masterpiece with ghosts and an amazing history.",
        duration: '2–2.5 hours',
        price: 0,
        imageUrl:
            'https://images.unsplash.com/photo-1666972120465-efebce20bf93?q=80&w=800&h=600&auto=format&fit=crop',
        highlights: [
            'See, hear, and feel Austin as it was a hundred years ago.',
            'Do not forget to charge your phones — there will be plenty to photograph!',
            'After the tour, those who wish can have coffee and experience the atmosphere of the 19th century in a beautiful historic café at the hotel.',
        ],
        included: [
            'Professional tour guide',
            'Historical maps and materials',
            'Entry to public buildings',
            'Small group experience (max 15 people)',
        ],
        extra:
            '👉 There are 2 options: 1️⃣ walk with a visit to the Capitol 2️⃣ without the Capitol, but the walk will be longer',
        meetingPoint:
            'We meet at the south gates of the Texas Capitol (intersection of Congress Ave and 11th St)',
        meetingPointLink: 'https://maps.app.goo.gl/vTTBHFYjYFnkgYPB6',
        difficulty: 'Easy',
    },

    {
        id: 'Haust',
        title: 'Mystical Austin',
        shortTitle: 'Mystical Austin',
        description:
            'An enchanting walk through downtown, filled with secrets and mysteries, mystical legends, and ghost stories.',
        duration: '2 hours',
        price: 30,
        imageUrl: '/haust.jpg',
        highlights: [
            'Walk along the streets where mysterious events took place.',
            'See buildings that may still be inhabited by ghosts today.',
            'Tickle your nerves with urban legends.',
        ],
        included: [],
        meetingPoint: 'We meet near the Texas Capitol Visitors Center',
        meetingPointLink: 'https://maps.app.goo.gl/Bso8TEdRQwCgCbaY7',
        difficulty: 'Easy',
    },
    {
        id: 'Gcrt',
        title: 'Tour of downtown Georgetown',
        shortTitle: 'Downtown Georgetown',
        description:
            'An engaging quest-tour for adults and children through the historic center of Georgetown — one of the most beautiful and cozy towns in Texas!',
        duration: '1.5–2 hours',
        price: 0,
        imageUrl: '/georgetown.jpg',
        highlights: [
            'Quest walk around Georgetown’s central square: we will solve the mysteries of the buildings standing on it, examine the architecture and sculptures, and get acquainted with the past of Texas.',
            'Coffee break in a cozy café.',
            'Tour of the Williamson Museum — the county’s history brought to life, interesting exhibits, and the atmosphere of the past.',
            'Suitable for adults and children 7+.',
            'After the tour: coffee break or a visit to an ice-cream café!',
        ],
        included: [
            'Expert food guide',
            'All food tastings',
            'Recipe cards to take home',
            'Market shopping tips',
            'Dietary restrictions accommodated',
        ],
        meetingPoint:
            'We meet on Georgetown’s central square, near the Williamson Museum',
        meetingPointLink: 'https://maps.app.goo.gl/c9spEFwMY7VWcPTS6',
        difficulty: 'Easy',
    },
    {
        id: 'Rrock',
        title: 'Round Rock: From the Wild West to the Paris Stage',
        shortTitle: 'Round Rock',
        description:
            'Join me for a walk through historic downtown Round Rock — a place where Wild West history, local legends, and the lives of remarkable people still echo today.\n' +
            'We’ll step back into the days of the Chisholm Trail, uncover the story of the legendary train robber Sam Bass, and visit his final resting place at Round Rock’s old cemetery.\n' +
            'But the most unexpected chapter of all is still ahead of us: the story of Barbette (Vander Clyde Broadway), a Round Rock native who conquered the stages of New York and Paris, inspired Jean Cocteau, and linked a small Texas town to the world of art.',
        duration: '2–2.5 hours',
        price: 0,
        imageUrl:
            '/round-rock.jpg',
        highlights: [
            'Discover the unexpected stories of a small Texas town',
            'Experience the atmosphere of the real Wild West',
            'Hear about real people whose lives became part of local legend',
            'Learn how one person’s life connected Round Rock to 1920s Paris',
            'End the walk with a cup of coffee in a cozy café in the historic downtown area.'
        ],
        included: [
        ],
        meetingPoint:
            'Chisholm Trail Crossing Park',
        meetingPointLink: 'https://maps.app.goo.gl/gNghyezKAVjKKyWu8',
        difficulty: 'Easy',
    },
    {
        id: 'Brmn',
        title: 'Tour of the Bremond district',
        shortTitle: 'Bremond district tour',
        description:
            'I invite you on a unique walk through the historic Bremond district in Austin — a charming neighborhood with Victorian houses from the late 19th century. You will see exquisite architecture: wrought-iron fences, carved decorations, and fairy-tale turrets.',
        duration: '2 hours',
        price: 0,
        imageUrl: '/bremond.jpg',
        highlights: [
            'The beauty of late 19th‑century Victorian architecture.',
            'Fascinating stories of Austin families who left their mark in the heart of Austin.',
            'Touch the historical heritage and feel as if you are in a fairy tale.',
        ],
        included: [
            'Photography guide',
            'Tripod rental available',
            'Photo editing tips',
        ],
        meetingPoint:
            'We meet at the pavilion on Wooldridge Square, at the intersection of Guadalupe and West 9th streets',
        meetingPointLink: 'https://maps.app.goo.gl/UiDVakHKfszzTE5b7',
        difficulty: 'Easy',
    },
    {
        id: 'Auswe',
        title: 'Weekend Austin-style',
        shortTitle: 'Weekend Austin-style',
        description:
            'Spend an exciting weekend Austin-style! ' +
            'Day 1 — Historic Austin (4–5 hours): ' +
            'Walk through downtown, Congress Avenue and the pivotal events in the city’s life, ' +
            'Millett Opera House and the legend of Priscilla, ' +
            'The Driskill Hotel — architecture, symbols, and urban stories. ' +
            'Day 2 — Underground Texas: hidden history (4–6 hours): ' +
            'Caves of Central Texas — nature, origin, and context, ' +
            'Quest-walk through a historic town near Austin.',
        duration: '2 days',
        price: 400,
        imageUrl: '/auswe.jpg',
        highlights: [
            'You save time: all the best and most interesting in just 2 days.',
            'Individual format and comfortable pace, vivid lively stories, and details you will not find in guidebooks.',
            'Lunch and shopping like locals: cozy spots and unusual shops.',
        ],
        included: [],
        meetingPoint: 'Arranged individually',
        meetingPointLink: '',
        difficulty: 'Easy',
    },

    {
        id: 'Auhnry',
        title: "Walk through downtown Austin + O. Henry Museum",
        shortTitle: "Austin tour + O. Henry Museum",
        description:
            'Step into history as you stroll along Congress Avenue — the city’s pulsing artery, where a bygone era will come to life before us: architectural battles, bustling commercial and cultural life, and the fateful shot of Angelina Eberly, which saved Austin’s status as the capital of Texas.\n' +
            'We will visit the museum of the famous writer O. Henry and learn which lyrical and tragic events in his difficult life are connected with Austin.',
        duration: '2.5 hours',
        price: 0,
        imageUrl: '/aushenry.jpg',
        highlights: [
            'Unhurried walk without a rigid route or timing.',
            'You will visit places in Austin associated with O. Henry.',
            'A cup of aromatic coffee in the atmosphere of the 19th century in the beautiful historic café at the Driskill Hotel.',
        ],
        included: [
            'Photography guide',
            'Tripod rental available',
            'Photo editing tips',
        ],
        meetingPoint:
            'We meet at the guitar sculpture (“Vibrancy guitar statue”), at the intersection of Congress Avenue and East 4th',
        meetingPointLink: 'https://maps.app.goo.gl/tvFiqw2Z93jqi5WS6',
        difficulty: 'Easy',
    },

    {
        id: 'Hyde',
        title: 'Walking tour of Hyde Park',
        shortTitle: 'Hyde Park tour',
        description:
            'Discover the charm of Austin’s oldest suburb — Hyde Park! This walking tour will transport you to the early 20th century, where shady streets lined with Victorian homes whisper stories about Texas’s golden age. Walk with us along picturesque alleys, breathe the fresh air, and feel the pulse of authentic Austin — without haste and without crowds.',
        duration: '2 hours',
        price: 40,
        imageUrl: '/hyde.jpg',
        highlights: [
            'Captivating stories about the neighborhood’s famous residents and historic mansions in many styles — classical, Victorian, Tudor, Queen Anne.',
            'A taste of real history at Avenue B Grocery & Market — the oldest store in Austin.',
            'Visit to First Light Books — a cozy bookstore with rare editions, unusual souvenirs, and aromatic coffee.',
        ],
        included: [],
        meetingPoint:
            'We meet at Shipe Neighborhood Park, closer to East 44th Street',
        meetingPointLink: 'https://maps.app.goo.gl/TkbGjf1g56Vr8mEc6',
        difficulty: 'Easy',
    },

    {
        id: 'Acstm',
        title: 'Pearls of Austin',
        shortTitle: 'Pearls of Austin',
        description:
            'This private tour combines popular walking tours of the historic center so you can see as many sights as possible: the majestic Capitol, the city’s central artery Congress Avenue, the historic Driskill Hotel, the dynamic University of Texas, the exquisite houses of the Bremond district, and the viewpoint on Mount Bonnell. If you wish, we will pop into souvenir shops and take a break in a stylish, cozy café. This is the ideal option for anyone who wants to immerse themselves in the history, mysteries, and beauty of the Texas capital. Austin is waiting just for you!',
        duration: 'From 3 to 6 hours, depending on your wishes',
        price: 0,
        imageUrl: '/acustom.jpg',
        highlights: [
            'Personalization to your taste: only what is interesting to you.',
            'A sea of positive impressions.',
            'An interesting and eventful day in Austin’s rhythm.',
        ],
        included: [],
        meetingPoint: 'Arranged individually',
        meetingPointLink: '',
        difficulty: 'Easy',
    },

    {
        id: 'Albjwc',
        title: 'Tour to the Lady Bird Johnson Wildflower Center',
        shortTitle: 'Wildflower Center tour',
        description:
            'A walk through an amazing place where nature intertwines with the history and cultural heritage of Texas. This is not just a botanical garden, but a living encyclopedia of the southern American landscape and a tribute to a woman whose influence forever changed the look of the country.',
        duration: '1–1.5 hours',
        price: 0,
        imageUrl:
            'https://images.unsplash.com/photo-1471644806490-77c53366b18b?w=800&h=600&fit=crop',
        highlights: [
            'The story of Lady Bird Johnson, First Lady of the USA. We will talk about her contribution to greening cities, her fight to preserve America’s natural beauty, and her role in the cultural history of the 1960s.',
            'Discussion of the center’s architecture and landscape design. You will take stunning shots from the observation deck on the tower.',
            'Talk about the symbolism of plants in the art and folk culture of Texas.',
        ],
        included: [
            'Photography guide',
            'Tripod rental available',
            'Photo editing tips',
            'Location map for future visits',
            'Small group (max 10 people)',
        ],
        extra: '🎟️ Entrance ticket is paid separately',
        meetingPoint: 'Lady Bird Johnson Wildflower Center',
        meetingPointLink: 'https://maps.app.goo.gl/aJf3ShjPhDnvwdJq5',
        difficulty: 'Moderate',
    },

    {
        id: 'Amhry',
        title: "Tour of the O. Henry Museum",
        shortTitle: "O. Henry Museum",
        description:
            'We will learn how the lyrical and tragic events in the writer’s life intertwine, how they are connected with Austin, and why O. Henry himself never spoke about them.',
        duration: '1 hour',
        price: 0,
        imageUrl: '/ohenry.jpg',
        highlights: [
            'You will discover the writer from an unexpected angle.',
            'You will play an antique piano and listen to a musical piece composed by O. Henry himself.',
            'After the tour, those who wish can have coffee and continue the conversation in the beautiful historic café at the Driskill Hotel.',
        ],
        included: [
            'Photography guide',
            'Tripod rental available',
            'Photo editing tips',
            'Location map for future visits',
            'Small group (max 10 people)',
        ],
        meetingPoint:
            'We meet at Brush Square, at the intersection of East 4th and Neches',
        meetingPointLink: 'https://maps.app.goo.gl/GDtQDZMwxYAMGudHA',
        difficulty: 'Easy',
    },

    {
        id: 'Milt',
        title:
            'Historic walk along Congress Avenue and the secrets of the Millett Opera House!',
        shortTitle: 'Millett Opera House',
        description:
            'Step into history as you stroll along Congress Avenue — the city’s pulsing artery, where a bygone era will come to life before us: architectural battles, bustling commercial and cultural life, and the fateful shot of Angelina Eberly, which saved Austin’s status as the capital of Texas.\n' +
            'We will visit the Millett Opera House (1878): learn its history, admire the Victorian interiors, and tingle our nerves with stories about the ghost of the opera singer Priscilla.',
        duration: '2.5–3 hours',
        price: 0,
        imageUrl: '/millett.jpg',
        highlights: [
            'Unhurried walk without a rigid route or timing.',
            'Visit to the legendary Millett Opera House.',
            'Refined lunch at the Millett Opera House restaurant.',
        ],
        included: [
            'Photography guide',
            'Tripod rental available',
            'Photo editing tips',
        ],
        meetingPoint:
            'We meet at the guitar sculpture (“Vibrancy guitar statue”), at the intersection of Congress Avenue and East 4th',
        meetingPointLink: 'https://maps.app.goo.gl/tvFiqw2Z93jqi5WS6',
        difficulty: 'Easy',
    },
];
