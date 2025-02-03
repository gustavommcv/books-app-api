import 'dotenv/config';
import mongoose from 'mongoose';
import Book from '../entities/Book';

const seedBooks = async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}${process.env.DB_NAME}`);

    const books = [
      {
        title: 'The Witcher: The Last Wish',
        author: 'Andrzej Sapkowski',
        description: 'The first book in The Witcher saga, introducing the adventures of Geralt of Rivia.',
        genre: ['Fantasy', 'Adventure'],
        publicationDate: new Date('1993-01-01'),
        pageCount: 288,
        cover: '/public/images/The_Witcher_O_Ultimo_Desejo.jpg'
      },
      {
        title: 'The Witcher: Sword of Destiny',
        author: 'Andrzej Sapkowski',
        description: 'The second book in The Witcher saga, a collection of short stories setting the stage for future events.',
        genre: ['Fantasy', 'Adventure'],
        publicationDate: new Date('1992-01-01'),
        pageCount: 400,
        cover: '/public/images/The_Witcher_A_Espada_do_Destino.jpg'
      },
      {
        title: 'The Witcher: Blood of Elves',
        author: 'Andrzej Sapkowski',
        description: 'The third book in The Witcher saga, where the journey of Ciri begins.',
        genre: ['Fantasy', 'Adventure'],
        publicationDate: new Date('1994-01-01'),
        pageCount: 320,
        cover: '/public/images/The_Witcher_O_Sangue_dos_Elfos.jpg'
      },
      {
        title: 'The Witcher: Time of Contempt',
        author: 'Andrzej Sapkowski',
        description: 'The fourth book in The Witcher saga, with war brewing and Ciri’s fate unfolding.',
        genre: ['Fantasy', 'Adventure'],
        publicationDate: new Date('1995-01-01'),
        pageCount: 352,
        cover: '/public/images/The_Witcher_Tempo_do_Desprezo.jpg'
      },
      {
        title: 'The Witcher: Baptism of Fire',
        author: 'Andrzej Sapkowski',
        description: 'The fifth book in The Witcher saga, where Geralt forms a new company on his quest to rescue Ciri.',
        genre: ['Fantasy', 'Adventure'],
        publicationDate: new Date('1996-01-01'),
        pageCount: 378,
        cover: '/public/images/The_Witcher_Batismo_de_Fogo.jpg'
      },
      {
        title: 'The Witcher: The Tower of the Swallow',
        author: 'Andrzej Sapkowski',
        description: 'The sixth book in The Witcher saga, where Ciri faces new dangers and visions of her destiny.',
        genre: ['Fantasy', 'Adventure'],
        publicationDate: new Date('1997-01-01'),
        pageCount: 432,
        cover: '/public/images/The_Witcher_A_Torre_da_Andorinha.jpg'
      },
      {
        title: 'The Witcher: The Lady of the Lake',
        author: 'Andrzej Sapkowski',
        description: 'The seventh and final book in The Witcher saga, bringing Ciri’s story to an epic conclusion.',
        genre: ['Fantasy', 'Adventure'],
        publicationDate: new Date('1999-01-01'),
        pageCount: 544,
        cover: '/public/images/The_Witcher_A_Senhora_do_Lago.jpg'
      }
    ];

    // Delete existing data and insert new books
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
