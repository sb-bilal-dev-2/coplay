
fetchPopularVideos()

async function fetchPopularVideos() {
    const url = 'https://content-youtube.googleapis.com/youtube/v3/videos?regionCode=US&chart=mostPopular&part=snippet,contentDetails,statistics&key=AIzaSyBeo4NGA__U6Xxy-aBE6yFm19pgq8TY-TM';

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Accept': '*/*',
              'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
              'X-Origin': 'https://explorer.apis.google.com',
              'Referer': 'https://explorer.apis.google.com'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Error fetching popular videos:', error);
    }
};
