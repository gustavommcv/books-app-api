import 'dotenv/config';
import mongoose from 'mongoose';
import Book from '../entities/Book';
import axios from 'axios';

const mapBookData = (apiBooks: any[]) => {
  return apiBooks.map((book) => {
    const volumeInfo = book.volumeInfo;
    return {
      title: volumeInfo.title,
      author: volumeInfo.authors ? volumeInfo.authors[0] : 'Unknown',
      description: volumeInfo.description || 'No description available.',
      genre: volumeInfo.categories || ['Unknown'],
      publicationDate: volumeInfo.publishedDate ? new Date(volumeInfo.publishedDate) : new Date(),
      pageCount: volumeInfo.pageCount || 0,
      cover: volumeInfo.imageLinks?.thumbnail || '/images/default_cover.png', // Default cover image if there is no cover
    };
  });
};

const seedBooks = async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}${process.env.DB_NAME}`);

    console.log('Fetching books from Google Books API...');
    const response = await axios.get('https://www.googleapis.com/books/v1/volumes?q=subject:fiction&maxResults=40');

    if (response.data.items) {
      const books = mapBookData(response.data.items);

      // Deletar dados existentes e inserir novos livros
      await Book.deleteMany();
      await Book.insertMany(books);

      console.log('Seed data inserted successfully!');
      process.exit(0);
    } else {
      console.error('No books found from API.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error inserting seed data:', error);
    process.exit(1);
  }
};

seedBooks();
