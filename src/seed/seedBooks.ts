import 'dotenv/config';
import mongoose from 'mongoose';
import Book from '../entities/Book';
import axios from 'axios';

const genres = ['fiction', 'nonfiction', 'fantasy', 'romance', 'science', 'history', 'mystery', 'thriller', 'biography'];

const mapBookData = (apiBooks: any[]) => {
  return apiBooks
    .filter((book) => book.volumeInfo?.title)
    .map((book) => {
      const volumeInfo = book.volumeInfo;
      return {
        title: volumeInfo.title || 'Unknown Title',
        author: volumeInfo.authors ? volumeInfo.authors[0] : 'Unknown',
        description: volumeInfo.description || 'No description available.',
        genre: volumeInfo.categories || ['Unknown'],
        publicationDate: volumeInfo.publishedDate ? new Date(volumeInfo.publishedDate) : new Date(),
        pageCount: volumeInfo.pageCount || 0,
        cover: volumeInfo.imageLinks?.thumbnail || `${process.env.API_URL}/images/default_cover.png`,
      };
    });
};

const seedBooks = async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}${process.env.DB_NAME}`);
    console.log('Fetching books from Google Books API...');

    let allBooks: any[] = [];
    const seenTitles = new Set();
    const limitPerRequest = 40;

    for (const genre of genres) {
      for (let i = 0; i < 5; i++) {
        console.log(`Fetching books from genre ${genre}, page ${i + 1}...`);
        const response = await axios.get(
          `https://www.googleapis.com/books/v1/volumes?q=subject:${genre}&maxResults=${limitPerRequest}&startIndex=${i * limitPerRequest}`
        );

        if (response.data.items) {
          const filteredBooks = mapBookData(response.data.items);
          filteredBooks.forEach((book) => {
            if (!seenTitles.has(book.title)) {
              seenTitles.add(book.title);
              allBooks.push(book);
            }
          });
        }
      }
    }

    console.log(`Total unique books collected: ${allBooks.length}`);

    await Book.deleteMany();
    await Book.insertMany(allBooks);

    console.log(`Successfully seeded ${allBooks.length} unique books!`);
    process.exit(0);
  } catch (error) {
    console.error('Error inserting seed data:', error);
    process.exit(1);
  }
};

seedBooks();
