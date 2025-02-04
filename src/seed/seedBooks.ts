import 'dotenv/config';
import mongoose from 'mongoose';
import Book from '../entities/Book';
import axios from 'axios';

const mapBookData = (apiBooks: any[]) => {
  return apiBooks.map((book) => {
    return {
      title: book.title,
      author: book.author_name ? book.author_name[0] : 'Unknown',
      description: book.first_sentence ? book.first_sentence[0] : 'No description available.',
      genre: book.subject ? book.subject.slice(0, 3) : ['Unknown'], // Pegando até 3 gêneros
      publicationDate: book.first_publish_year ? new Date(book.first_publish_year.toString()) : new Date(),
      pageCount: book.number_of_pages_median || 0,
      cover: book.cover_i 
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` 
        : '/images/default_cover.png', // Default cover if not available
    };
  });
};

const seedBooks = async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}${process.env.DB_NAME}`);
    console.log('Fetching books from Open Library API...');

    const limitPerRequest = 100;
    const totalBooks = 1000;
    const totalPages = Math.ceil(totalBooks / limitPerRequest);
    let allBooks: any[] = [];

    for (let i = 0; i < totalPages; i++) {
      console.log(`Fetching page ${i + 1} of ${totalPages}...`);
      const response = await axios.get(
        `https://openlibrary.org/search.json?q=fiction&limit=${limitPerRequest}&offset=${i * limitPerRequest}`
      );

      if (response.data.docs) {
        allBooks = allBooks.concat(response.data.docs);
      }
    }

    const books = mapBookData(allBooks);

    // Deletar dados existentes e inserir novos livros
    await Book.deleteMany();
    await Book.insertMany(books);

    console.log('Seed data inserted successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error inserting seed data:', error);
    process.exit(1);
  }
};

seedBooks();
