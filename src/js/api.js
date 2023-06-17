import axios from 'axios';

const API_KEY = '37225834-865f532e88eda3622dc991a4d';
const URL = 'https://pixabay.com/api/';
const PER_PAGE = 40;

export async function getImages(searchQuery, pageCount) {
    const params = {
        params: {
            key: API_KEY,
            q: searchQuery,
            image_type: 'photo',
            orientation: 'horizontal',
            safesearch: true,
            page: pageCount,
            per_page: PER_PAGE,
        },
    };
    const response = await axios.get(URL, params);
    return response.data;
}
