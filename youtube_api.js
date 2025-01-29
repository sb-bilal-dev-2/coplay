const apiKey = 'AIzaSyA6FAzes_jSk5lcm6aolHIIn_xfSp7teBs'
// fetchPopularVideos()

// async function fetchPopularVideos() {
//     const url = 'https://content-youtube.googleapis.com/youtube/v3/videos?regionCode=US&chart=mostPopular&part=snippet,contentDetails,statistics&key=' + apiKey;

//     try {
//         const response = await fetch(url, {
//             method: 'GET',
//             headers: {
//               'Accept': '*/*',
//               'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
//               'X-Origin': 'https://explorer.apis.google.com',
//               'Referer': 'https://explorer.apis.google.com'
//             }
//         });

//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}.`);
//         }

//         const data = await response.json();
//         console.log(data);
//     } catch (error) {
//         console.error('Error fetching popular videos:', error);
//     }
// };

async function fetchTrendingVideos(mediaLang = 'US', limit = 10, page = 1, category = '') {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&chart=mostPopular&regionCode=${mediaLang}&maxResults=${limit}&key=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error fetching trending videos: ${response.statusText}`);
        }
        const data = await response.json();
        console.log('data.items', data.items)
        const videos = data.items
            // .filter(item => item.isFamilySafe)
            .map((item) => ({
                title: item.snippet.title,
                videoId: item.id,
                description: item.snippet.description,
                thumbnail: item.snippet.thumbnails.high.url,
                channelTitle: item.snippet.channelTitle,
                stats: item.statistics,
            }));

        console.log('Trending Videos:', videos);
        return videos;
    } catch (error) {
        console.error('Error fetching trending videos:', error);
        return [];
    }
}

async function fetchPopularVideos(mediaLang = 'US', limit = 10, pageToken = '', category = '') {
    // Validate `limit` to ensure it's within YouTube's constraints
    if (limit < 1 || limit > 50) {
        throw new Error('The limit parameter must be between 1 and 50.');
    }

    // Construct the URL
    let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${limit}&regionCode=${mediaLang}&order=viewCount&key=${apiKey}`;

    // Add category if provided
    if (category) {
        url += `&videoCategoryId=${category}`;
    }

    // Add pageToken for pagination
    if (pageToken) {
        url += `&pageToken=${pageToken}`;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error fetching most viewed videos: ${response.statusText}`);
        }

        const data = await response.json();

        // Map and structure the results
        const videos = data.items.map((item) => ({
            title: item.snippet.title,
            videoId: item.id.videoId,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.high.url,
            channelTitle: item.snippet.channelTitle,
        }));

        console.log('Most Viewed Videos:', videos);
        return videos;
    } catch (error) {
        console.error('Error fetching most viewed videos:', error);
        return [];
    }
}

// Example Usage
// fetchTrendingVideos('US', 5).then(console.log);
// fetchPopularVideos('US', 5, 1, 'Music').then(console.log);

async function searchYouTubeVideos(query, mediaLang = 'US', limit = 10, pageToken = '') {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${limit}&q=${encodeURIComponent(query)}&regionCode=${mediaLang}&key=${apiKey}&pageToken=${pageToken}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error searching YouTube: ${response.statusText}`);
        }
        const data = await response.json();

        // Extract relevant video information
        const videos = data.items.map((item) => ({
            title: item.snippet.title,
            videoId: item.id.videoId,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.high.url,
            channelTitle: item.snippet.channelTitle,
            publishTime: item.snippet.publishTime,
        }));

        console.log('Search Results:', videos);
        return {
            videos,
            nextPageToken: data.nextPageToken || null, // For pagination
        };
    } catch (error) {
        console.error('Error searching YouTube:', error);
        return { videos: [], nextPageToken: null };
    }
}

async function fetchRecommendedVideos(videoId, mediaLang = 'US', limit = 10, pageToken = '') {
    const apiKey = 'YOUR_API_KEY'; // Replace with your YouTube Data API key

    // Validate the input videoId
    if (!videoId) {
        throw new Error('A valid videoId is required.');
    }

    // Validate `limit` to ensure it's within YouTube's constraints
    if (limit < 1 || limit > 50) {
        throw new Error('The limit parameter must be between 1 and 50.');
    }

    // Construct the API URL
    let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&relatedToVideoId=${videoId}&regionCode=${mediaLang}&maxResults=${limit}&key=${apiKey}`;
    
    // Add pagination if pageToken is provided
    if (pageToken) {
        url += `&pageToken=${pageToken}`;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error fetching recommended videos: ${response.statusText}`);
        }

        const data = await response.json();

        // Extract video details
        const videos = data.items.map((item) => ({
            title: item.snippet.title,
            videoId: item.id.videoId,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.high.url,
            channelTitle: item.snippet.channelTitle,
            publishTime: item.snippet.publishTime,
        }));

        console.log('Recommended Videos:', videos);
        return {
            videos,
            nextPageToken: data.nextPageToken || null, // For pagination
        };
    } catch (error) {
        console.error('Error fetching recommended videos:', error);
        return { videos: [], nextPageToken: null };
    }
}

// Example Usage
// fetchRecommendedVideos('dQw4w9WgXcQ', 'US', 5).then((result) => {
//     console.log('Videos:', result.videos);
//     console.log('Next Page Token:', result.nextPageToken);
// });

module.exports = {
    fetchTrendingVideos,
    fetchPopularVideos,
    searchYouTubeVideos,
    fetchRecommendedVideos
}

// Example Usage
// searchYouTube('JavaScript tutorials', 'US', 5).then((result) => {
//     console.log('Videos:', result.videos);
//     console.log('Next Page Token:', result.nextPageToken);
// });
