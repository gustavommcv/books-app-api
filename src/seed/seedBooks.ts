import 'dotenv/config';
import mongoose from 'mongoose';
import Book from '../entities/Book';

const seedBooks = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string + process.env.DB_NAME);

    const books = [
      {
        title: 'The Witcher: O Último Desejo',
        description: 'Primeiro livro da saga The Witcher.',
        cover: '/public/images/The_Witcher_O_Ultimo_Desejo.jpg'
      },
      {
        title: 'The Witcher: A Espada do Destino',
        description: 'Segundo livro da saga The Witcher.',
        cover: '/public/images/The_Witcher_A_Espada_do_Destino.jpg'
      },
      {
        title: 'The Witcher: O Sangue dos Elfos',
        description: 'Terceiro livro da saga The Witcher.',
        cover: '/public/images/The_Witcher_O_Sangue_dos_Elfos.jpg'
      },
      {
        title: 'The Witcher: Tempo do Desprezo',
        description: 'Quarto livro da saga The Witcher.',
        cover: '/public/images/The_Witcher_Tempo_do_Desprezo.jpg'
      },
      {
        title: 'The Witcher: Batismo de Fogo',
        description: 'Quinto livro da saga The Witcher.',
        cover: '/public/images/The_Witcher_Batismo_de_Fogo.jpg'
      },
      {
        title: 'The Witcher: A Torre da Andorinha',
        description: 'Sexto livro da saga The Witcher.',
        cover: '/public/images/The_Witcher_A_Torre_da_Andorinha.jpg'
      },
      {
        title: 'The Witcher: A Senhora do Lago',
        description: 'Sétimo livro da saga The Witcher.',
        cover: '/public/images/The_Witcher_A_Senhora_do_Lago.jpg'
      }
    ];

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
