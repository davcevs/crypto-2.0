import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class NewsService {
  private readonly apiUrl = 'https://api.coin-stats.com/v1/news'; // Correct endpoint
  private readonly apiKey = 'Aw7viyZfqcdGE3u3gUrJ4naM+TUOyNlxcTgZgsne4so='; // If needed, adjust based on API docs

  async fetchCryptoNews() {
    try {
      // Fetching all news; adjust this line if you want to filter by type
      const response = await axios.get(this.apiUrl); // No parameters are necessary for fetching all news

      // Ensure response data has the expected structure
      if (response.data && response.data.news) {
        return response.data.news; // Adjust based on the actual response structure
      } else {
        console.error('Unexpected response structure:', response.data);
        throw new HttpException(
          'Invalid response structure',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      // Log detailed error information for debugging
      console.error(
        'Error fetching crypto news:',
        error.response?.data || error.message,
      );
      throw new HttpException(
        'Failed to fetch crypto news',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
