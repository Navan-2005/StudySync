import { config } from "dotenv";
config();

export async function getYoutubeVideos(topic) {
    const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(topic)}&maxResults=3&type=video&key=${process.env.YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
        return `Error fetching YouTube videos for "${topic}". Status: ${response.statusText}`;
    }

    const data = await response.json();

    // If there is an error in the API response
    if (data.error) {
        return `Error: ${data.error.message}`;
    }

    // Extract video URLs from the response
    const videoUrls = data.items.map(item => `https://www.youtube.com/watch?v=${item.id.videoId}`);
    
    return videoUrls;
}
