const apiKey = 'AIzaSyBhopJDCaP_4D9d9JHlKKtTxJyBgJhmcK8'

const REGIONS_BY_MEDIA_LANG = {
    "en": "US",
    "ko": "KR",
    "zh-CN": "SG",
    "tr": "TR",
    "ru": "RU",
}

const RELEVALNCE_LANGUAGES_MAP = {
    'zh-CN': 'zh-Hant'
}

const PLAYLIST_CACHE = {}
const PLAYLIST_URL_BY_NAME = {
    "PLY_music_vocoplay": "",
    "PLY_music_popular": "https://www.youtube.com/watch?v=lWA2pjMjpBs&list=RDQMggCxizMVigw&start_radio=1",
    "PLY_music_pop": "https://www.youtube.com/watch?v=JGwWNGJdvx8&list=PLMC9KNkIncKvYin_USF1qoJQnIyMAfRxl",
    "PLY_music_cartoon": "https://www.youtube.com/watch?v=YVVTZgwYwVo&list=PLiNVoBckLqLmdcbotc6n_MjdTDCHLiYDo",
    "PLY_music_work": "https://www.youtube.com/watch?v=hT_nvWreIhg&list=PLhGO2bt0EkwvRUioaJMLxrMNhU44lRWg8",
    "PLY_music_rap": "https://www.youtube.com/watch?v=xFYQQPAOz7Y&list=PLOhV0FrFphUdkuWPE2bzJEsGxXMRKVkoM",
    "PLY_music_classical": "https://www.youtube.com/watch?v=btPJPFnesV4&list=PL3RlTwDWXaUGMvEUkGSM8PtzM6RYRztDZ",
    "PLY_music_morning": "https://www.youtube.com/watch?v=ru0K8uYEZWw&list=PLVgakZ6MigxxNhXZae5cALEW588-sMQn6",
    "PLY_music_calm": "https://www.youtube.com/watch?v=rtOvBOTyX00&list=PL7v1FHGMOadDghZ1m-jEIUnVUsGMT9jbH",
    "PLY_music_trending": "https://www.youtube.com/watch?v=ekr2nIex040&list=PL3-sRm8xAzY9gpXTMGVHJWy_FMD67NBed",
    "PLY_ceo_podcast": "https://www.youtube.com/watch?v=uxu37dqVR90&list=PL22egh3ok4cP0T7UZRmP6TMLErZYWMN-l",
    "PLY_tedtalks": "https://www.youtube.com/watch?v=Lp7E973zozc&list=PLQltO7RlbjPJnbfHLsFJWP-DYnWPugUZ7",
    "PLY_mel_robbins": "https://www.youtube.com/watch?v=SQ54wma-JQA&list=PLhW2xUEb-B-Y92Q1wVWw6TyMNr4idD-yv",
    "PLY_joe_rogan": "https://www.youtube.com/watch?v=ycPr5-27vSI&list=PLmM1MkVIgsWV6Nn06Kew8MrZG-y8GS6Fx",
    "PLY_series_cartoon_avatar": "https://www.youtube.com/watch?v=XmvkpGTwT6E&list=PLctu_t5fR-ZS2Q5LVeiw7hh9_WPpnrOpx",
    "PLY_series_friends": "https://www.youtube.com/watch?v=BYw3XZm5e0E&list=PL7PQp2APUAPL-q1GnguwovMusN6g3RdwX&index=1",
}

async function fetchPlaylist(playlistId, limit = 20, expireMinutes = 10) {
    if (playlistId.includes("PLY_")) {
        playlistId = PLAYLIST_URL_BY_NAME[playlistId]?.split("list=")[1]
    }
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=${limit}&playlistId=${playlistId}&key=${apiKey}`

    try {
        const CACHED_PLAYLIST = PLAYLIST_CACHE[playlistId]
        if (CACHED_PLAYLIST && !CACHED_PLAYLIST.expired) {
            return CACHED_PLAYLIST.videos
        }
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error fetching playlist videos: ${response.statusText}`);
        }
        const data = await response.json();

        const videos = data.items?.map((item) => {
            return {
                title: item.snippet.title,
                videoId: item?.snippet?.resourceId?.videoId,
                description: item.snippet.description,
                thumbnail: item.snippet.thumbnails.high.url,
                channelTitle: item.snippet.channelTitle,
                playlistId: item.snippet.playlistId
                // stats: item.statistics,
            }
        })
        PLAYLIST_CACHE[playlistId] = { videos }
        setTimeout(() => {
            PLAYLIST_CACHE[playlistId].expired = true
        }, expireMinutes * 60 * 1000)
        return videos;
    } catch (error) {
        console.error('Error fetching playlist videos:', error);
        return PLAYLIST_CACHE[playlistId]?.videos || [];
    }
}
const TRENDING_CACHE = {}

// &relevanceLanguage=en
async function fetchTrendingVideos(mediaLang = 'US', limit = 15, page = 1, category = '', expireMinutes = 10) {
    const region = REGIONS_BY_MEDIA_LANG[mediaLang]
    const relevanceLanguage = RELEVALNCE_LANGUAGES_MAP[mediaLang] || mediaLang
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&chart=mostPopular${region ? '&regionCode=' + region : ''}&maxResults=${limit}&key=${apiKey}&relevanceLanguage=${relevanceLanguage}`;
    const cachedVideos = TRENDING_CACHE[url]
    if (cachedVideos && !cachedVideos.expired) {
        return cachedVideos?.videos
    }
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
                return !restrictions;
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
        TRENDING_CACHE[url] = { videos }
        setTimeout(() => {
            TRENDING_CACHE[url].expired = true
        }, expireMinutes * 60 * 1000)
        return videos;
    } catch (error) {
        console.error('Error fetching trending videos:', error);
        return cachedVideos?.videos || [];
    }
}

const UNORDINARY_POPULAR_VIDEOS_QUERY_MAP = {
    "series": {
        "en": 'popular scenes from the series'
    },
    "music": {
        "en": "popular music"
    },
    "music_pop": {
        "en": "pop music"
    },
    "music_cartoon": {
        "en": "music from cartoon"
    },
    "music_work": {
        "en": "work & study music"
    },
    "music_traditional": {
        "en": "country music"
    },
    "music_morning": {
        "en": "upbeat morning music"
    },
    "podcasts": {
        "en": "podcasts"
    },
    "cartoon": {
        "en": "cartoon scenes"
    }
}

const REGION_CODE_BY_LANG = {
    "en": "US"
}

async function fetchPopularVideos(category = '', mediaLang = 'en', limit = 15, pageToken = '') {
    // Validate `limit` to ensure it's within YouTube's constraints
    const queryByCategory = UNORDINARY_POPULAR_VIDEOS_QUERY_MAP[category][mediaLang] || category
    console.log('queryByCategory', queryByCategory)
    if (typeof queryByCategory === "string") {
        return searchYouTubeVideos(queryByCategory, REGION_CODE_BY_LANG[mediaLang] || mediaLang, limit, pageToken, true)
    } else {
        return { videos: queryByCategory }
    }
}

// Example Usage
// fetchTrendingVideos('US', 5).then(console.log);
// fetchPopularVideos('Music', 'US', 5, 1).then(console.log);
// searchYouTubeVideos('Podcast', mediaLang = 'US', 10)
async function searchYouTubeVideos(query, mediaLang = 'US', limit = 15, pageToken = '', sortByViews) {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${limit}&q=${encodeURIComponent(query)}&regionCode=${mediaLang}&key=${apiKey}&pageToken=${pageToken}`;
    const cachedVideos = TRENDING_CACHE[url]
    if (cachedVideos && !cachedVideos.expired) {
        return cachedVideos?.videos
    }
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
        TRENDING_CACHE[url] = { videos }
        setTimeout(() => {
            TRENDING_CACHE[url].expired = true
        }, expireMinutes * 60 * 1000)

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
    fetchRecommendedVideos,
    fetchPlaylist
}

// Example Usage
// searchYouTube('JavaScript tutorials', 'US', 5).then((result) => {
//     console.log('Videos:', result.videos);
//     console.log('Next Page Token:', result.nextPageToken);
// });
