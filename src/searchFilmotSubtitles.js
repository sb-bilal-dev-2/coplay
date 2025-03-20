// curl --request GET 
// 	--url 'https://filmot-tube-metadata-archive.p.rapidapi.com/getsearchsubtitles?query=%22defeating%20a%20sandwich%20only%20makes%20it%20tastier%22&lang=nl&category=Science%20%26%20Technology&excludeCategory=Gaming%2CMusic&license=2&maxViews=100000&minViews=1000&maxLikes=100000&minLikes=1000&country=153&channelID=UCXuqSBlHAE6Xw-yeJA0Tunw&title=find&startDuration=60&endDuration=3600&searchManualSubs=1&startDate=2024-01-08&endDate=2024-02-08' 
// 	--header 'x-rapidapi-host: filmot-tube-metadata-archive.p.rapidapi.com' 
// 	--header 'x-rapidapi-key: 483c5725a4msh3171d0bf8d95dcfp1d4f0cjsn7591d51f1a70'


// searchFilmotSubtitles({ query: '"hello world"' })
async function searchFilmotSubtitles(options = {}) {
    // Default options with all the parameters from the original curl command
    const defaultOptions = {
        //     query: '"defeating a sandwich only makes it tastier"',
        lang: 'en',
        minViews: 1000,
        minLikes: 1000,
        //     category: 'Science & Technology',
        //     excludeCategory: 'Gaming,Music',
        //     license: 2,
        //     maxViews: 100000,
        //     maxLikes: 100000,
        //     country: 153,
        //     channelID: 'UCXuqSBlHAE6Xw-yeJA0Tunw',
        //     title: 'find',
        //     startDuration: 60,
        //     endDuration: 3600,
        //     searchManualSubs: 1,
        //     startDate: '2024-01-08',
        //     endDate: '2024-02-08'
    };

    // Merge default options with provided options
    const params = { ...defaultOptions, ...options };

    // Construct the query string
    const queryString = new URLSearchParams(Object.entries(params)).toString();

    // API endpoint
    const url = `https://filmot-tube-metadata-archive.p.rapidapi.com/getsearchsubtitles?${queryString}`;

    // API request configuration
    const fetch_options = {
        method: 'GET',
        headers: {
            'x-rapidapi-host': 'filmot-tube-metadata-archive.p.rapidapi.com',
            'x-rapidapi-key': '483c5725a4msh3171d0bf8d95dcfp1d4f0cjsn7591d51f1a70'
        }
    };

    try {
        // Fetch the data
        const response = await fetch(url, fetch_options);

        // Check if the response is ok
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse and return the JSON data
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching subtitle search:', error);
        throw error;
    }
}

