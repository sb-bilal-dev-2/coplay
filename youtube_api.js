const apiKey = 'AIzaSyBhopJDCaP_4D9d9JHlKKtTxJyBgJhmcK8'

const REGIONS_BY_MEDIA_LANG = {
    "en": "US",
    "ko": "KR",
    "zh-CN": "SG"
}

const RELEVALNCE_LANGUAGES_MAP = {
    'zh-CN': 'zh-Hant'
}

// &relevanceLanguage=en
async function fetchTrendingVideos(mediaLang = 'US', limit = 15, page = 1, category = '') {
    const region = REGIONS_BY_MEDIA_LANG[mediaLang]
    const relevanceLanguage = RELEVALNCE_LANGUAGES_MAP[mediaLang] || mediaLang
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&chart=mostPopular${region ? '&regionCode=' + region : ''}&maxResults=${limit}&key=${apiKey}&relevanceLanguage=${relevanceLanguage}`;
    console.log('requesting trending for ' + mediaLang, url)
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error fetching trending videos: ${response.statusText}`);
        }
        const data = await response.json();
        // console.log('data.items', data.items)
        const videos = data.items
            // .filter(item => item.isFamilySafe)
            .filter(item => {
                console.log('restrictions', item.contentDetails.regionRestriction)
                const restrictions = item.contentDetails.regionRestriction;
                return !(restrictions?.blocked && restrictions.blocked.includes(region));
            })    
            .filter((item) => !item.isShortsEligible)
            .map((item) => ({
                title: item.snippet.title,
                videoId: item.id,
                description: item.snippet.description,
                thumbnail: item.snippet.thumbnails.high.url,
                channelTitle: item.snippet.channelTitle,
                stats: item.statistics,
            }));

        return videos;
    } catch (error) {
        console.error('Error fetching trending videos:', error);
        return [];
    }
}

const UNORDINARY_POPULAR_VIDEOS_QUERY_MAP = {
    "series": {
        "en": 'popular scenes from the series'
    },
    "music": {
        "en": "music"
    },
    "podcasts": {
        "en": "podcasts"
    },
    "cartoon": {
        "en": "cartoon"
    }
}

const REGION_CODE_BY_LANG = {
    "en": "US"
}

async function fetchPopularVideos(category = '', mediaLang = 'en', limit = 15, pageToken = '') {
    // Validate `limit` to ensure it's within YouTube's constraints
    const queryByCategory = UNORDINARY_POPULAR_VIDEOS_QUERY_MAP[category][mediaLang] || category
    return searchYouTubeVideos(queryByCategory, REGION_CODE_BY_LANG[mediaLang] || mediaLang, limit, pageToken, true)
}

// Example Usage
// fetchTrendingVideos('US', 5).then(console.log);
// fetchPopularVideos('Music', 'US', 5, 1).then(console.log);
// searchYouTubeVideos('Podcast', mediaLang = 'US', 10)
async function searchYouTubeVideos(query, mediaLang = 'US', limit = 15, pageToken = '', sortByViews) {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${limit}&q=${encodeURIComponent(query)}&regionCode=${mediaLang}&key=${apiKey}&pageToken=${pageToken}`;

    if (sortByViews) {
        url + '&order=viewCount'
    }
    console.log('youtube search url: ' + url)
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error searching YouTube: ${response.statusText}\n${response.toString()}`);
        }
        const data = await response.json();

        // Extract relevant video information
        const videos = data.items
            .filter((item) => !item.isShortsEligible)
            .map((item) => ({
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
