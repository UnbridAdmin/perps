export interface Category {
    id: number;
    name: string;
    icon?: string;           // Boxicons class, e.g. 'bx bx-football'
    children?: Category[];   // Sub-categorías (opcional, puede ser vacío o ausente)
}

/**
 * Árbol de todas las categorías con sus subcategorías anidadas.
 * El `id` del nodo HOJA (último nivel) es el que se usa como filtro real.
 */
export const CATEGORIES_TREE: Category[] = [
    {
        id: 1,
        name: 'Sports',
        icon: 'bx bx-trophy',
        children: [
            /*{
                id: 10,
                name: 'Football',
                icon: 'bx bx-football',
                children: [
                    { id: 100, name: 'NFL', icon: 'bx bx-star' },
                    { id: 101, name: 'College Football', icon: 'bx bx-star' },
                    { id: 102, name: 'CFL', icon: 'bx bx-star' }
                ]
            },*/
            {
                id: 11,
                name: 'Soccer',
                icon: 'bx bx-cricket-ball',
                children: [
                    {
                        id: 110,
                        name: 'International',
                        icon: 'bx bx-globe',
                        children: [
                            { id: 4, name: 'FIFA World Cup', icon: 'bx bx-world' },
                            // { id: 1101, name: 'UEFA Champions League', icon: 'bx bx-medal' },
                            // { id: 1102, name: 'Copa América', icon: 'bx bx-medal' }
                        ]
                    },
                    {
                        id: 5, name: 'Colombia', icon: 'bx bx-star',
                        children: [
                            { id: 6, name: 'Primera A', icon: 'bx bx-star' }
                        ]
                    },
                    /*{ id: 112, name: 'La Liga', icon: 'bx bx-star' },
                    { id: 113, name: 'Bundesliga', icon: 'bx bx-star' },
                    { id: 114, name: 'Serie A', icon: 'bx bx-star' }*/
                ]
            },
            /*{
                id: 12,
                name: 'Basketball',
                icon: 'bx bx-basketball',
                children: [
                    { id: 120, name: 'NBA', icon: 'bx bx-star' },
                    { id: 121, name: 'WNBA', icon: 'bx bx-star' },
                    { id: 122, name: 'EuroLeague', icon: 'bx bx-star' }
                ]
            },
            {
                id: 13,
                name: 'Tennis',
                icon: 'bx bx-cycling',
                children: [
                    { id: 130, name: 'Grand Slams', icon: 'bx bx-star' },
                    { id: 131, name: 'ATP Tour', icon: 'bx bx-star' },
                    { id: 132, name: 'WTA Tour', icon: 'bx bx-star' }
                ]
            },
            {
                id: 14,
                name: 'Baseball',
                icon: 'bx bx-baseball',
                children: [
                    { id: 140, name: 'MLB', icon: 'bx bx-star' },
                    { id: 141, name: 'NPB', icon: 'bx bx-star' }
                ]
            },
            { id: 15, name: 'Golf', icon: 'bx bx-golf' },
            { id: 16, name: 'MMA / UFC', icon: 'bx bx-dumbbell' },
            { id: 17, name: 'Racing', icon: 'bx bx-car' }*/
        ]
    },
    {
        id: 7,
        name: 'Politics',
        icon: 'bx bx-buildings',
        children: [
            { id: 8, name: 'Elections', icon: 'bx bx-check-square' },
           /* { id: 21, name: 'World Leaders', icon: 'bx bx-globe' },
            { id: 22, name: 'Elections', icon: 'bx bx-check-square' },
            { id: 23, name: 'Legislation', icon: 'bx bx-file' }*/
        ]
    },
    /*{
        id: 3,
        name: 'Crypto',
        icon: 'bx bx-bitcoin',
        children: [
            { id: 30, name: 'Bitcoin', icon: 'bx bx-bitcoin' },
            { id: 31, name: 'Ethereum', icon: 'bx bx-coin' },
            { id: 32, name: 'Altcoins', icon: 'bx bx-coin-stack' },
            { id: 33, name: 'DeFi', icon: 'bx bx-network-chart' },
            { id: 34, name: 'NFTs', icon: 'bx bx-image' }
        ]
    },
    {
        id: 4,
        name: 'Finance',
        icon: 'bx bx-line-chart',
        children: [
            { id: 40, name: 'Stocks', icon: 'bx bx-trending-up' },
            { id: 41, name: 'Commodities', icon: 'bx bx-package' },
            { id: 42, name: 'Forex', icon: 'bx bx-transfer' },
            { id: 43, name: 'Real Estate', icon: 'bx bx-building-house' }
        ]
    },
    {
        id: 5,
        name: 'Tech',
        icon: 'bx bx-chip',
        children: [
            { id: 50, name: 'AI', icon: 'bx bx-bot' },
            { id: 51, name: 'Gaming', icon: 'bx bx-joystick' },
            { id: 52, name: 'Space', icon: 'bx bx-planet' },
            { id: 53, name: 'Big Tech', icon: 'bx bx-server' }
        ]
    },
    {
        id: 6,
        name: 'Culture',
        icon: 'bx bx-music',
        children: [
            { id: 60, name: 'Music', icon: 'bx bx-music' },
            { id: 61, name: 'Movies', icon: 'bx bx-film' },
            { id: 62, name: 'Awards', icon: 'bx bx-award' },
            { id: 63, name: 'Celebrities', icon: 'bx bx-star' }
        ]
    }*/
];
