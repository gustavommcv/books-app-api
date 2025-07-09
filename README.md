# 📚 Books API - Book Management with Personalized Recommendations

## 📖 Description
BooksApp is a book management application that allows users to browse a catalog, leave ratings, and receive personalized recommendations based on their reviews. The project was developed as part of a portfolio with the goal of demonstrating backend development, frontend integration, and the use of external APIs.

---

## 📋 Table of Contents
- [🚀 Features](#-features)  
- [🛠 Technologies Used](#-technologies-used)  
- [📂 Project Structure](#-project-structure)  
- [🔗 API Endpoints](#-api-endpoints)  
  - [Authentication](#authentication-api-auth)  
  - [Books](#books-api-books)  
  - [Reviews](#reviews-api-reviews)  
  - [Users](#users-api-user)  
  - [Comments](#comments-api-comments)  
- [🌟 Main Technical Decisions](#-main-technical-decisions)  
- [🛡 Possible Future Improvements](#-possible-future-improvements)  
- [👤 Author](#-author)  

---

## 🚀 Features
- 🔐 **Authentication and Authorization:** Secure authentication using JWT and role-based access control (admin and user).
- 🔑 **Access Control:** Admin users can manage books and moderate reviews, while regular users can review and explore the catalog.
- 📚 **Book Catalog:** Supports filtering, pagination, and sorting options to browse books.
- 🌟 **Personalized Recommendations:** Based on user reviews with positive ratings.
- ✍️ **Review System:** Users can leave ratings and comments on books.
- 📂 **Profile Management:** Upload and manage profile pictures.
- 🌍 **External API Integration:** Uses Google Books and Open Library APIs to populate the book catalog.
- ✉️ **Email Verification:** Real email verification powered by Nodemailer for user account activation.

---

## 🛠 Technologies Used
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** JWT, Bcrypt
- **External APIs:** Open Library API, Google Books API
- **Email Service:** Nodemailer for sending real verification emails
- **Request Validation:** express-validator
- **Dependency Management:** npm
- **Version Control:** Git

---

## 📂 Project Structure

    BooksApi/
    │
    ├── src/
    │ ├── entities/         # Mongoose schemas (Book, User, Review...)
    │ ├── infrastructure/   # Database configuration and related modules
    │ ├── interface/        # Application interface layer (routes, controllers, middlewares)
    │ │   ├── controllers/  # Endpoint logic
    │ │   ├── middlewares/  # Authentication, request validation, etc.
    │ │   ├── routes/       # Definition of API routes
    │ │   └── seed/         # Scripts to populate the database
    │ ├── services/         # Business logic and communication with the database
    │ └── app.ts            # Main application setup
    │
    ├── public/             # User images and uploads
    ├── .env                # Environment variables
    ├── .env.example        # Example of environment variables
    ├── cert.pem            # SSL certificate (for HTTPS)
    ├── key.pem             # SSL private key (for HTTPS)
    ├── package.json        # Dependencies and scripts
    ├── README.md           # Project documentation
    ├── tsconfig.json       # TypeScript settings
    └── server.ts           # Entry point to start the server

---

## 🔗 API Endpoints

### **Authentication (`/api/auth`)**
| Method | Endpoint          | Description                                  |
|--------|-------------------|----------------------------------------------|
| POST   | `/auth/login`     | Login with email and password               |
| POST   | `/auth/signup`    | Register a new user                         |
| GET    | `/auth/verify-email` | Verify user email using a token           |
| POST   | `/auth/logout`    | Logout current user                         |

---

### **Books (`/api/books`)**
| Method | Endpoint                       | Description                                          |
|--------|--------------------------------|------------------------------------------------------|
| GET    | `/books`                       | Fetch a paginated list of books with filters         |
| GET    | `/books/:bookId`               | Retrieve details of a specific book by its ID        |
| GET    | `/books/recommendations`       | Get personalized book recommendations                |
| POST   | `/books`                       | (Admin only) Create a new book                       |
| PUT    | `/books/:bookId`               | (Admin only) Update an existing book by its ID       |
| DELETE | `/books/:bookId`               | (Admin only) Delete a book by its ID                 |

---

### **Reviews (`/api/reviews`)**
| Method | Endpoint                       | Description                                          |
|--------|--------------------------------|------------------------------------------------------|
| GET    | `/reviews/user`                | Get all reviews made by the logged-in user           |
| GET    | `/reviews/book/:bookId`        | Get reviews for a specific book                      |
| GET    | `/reviews/:reviewId`           | Get a specific review by its ID                      |
| POST   | `/reviews`                     | Create a new review                                  |
| PUT    | `/reviews/:reviewId`           | Update an existing review                            |
| DELETE | `/reviews/:reviewId`           | (Admin only) Delete a review by its ID               |

---

### **Users (`/api/user`)**
| Method | Endpoint                       | Description                                          |
|--------|--------------------------------|------------------------------------------------------|
| GET    | `/user/profile`                | Get the logged-in user's profile                     |
| GET    | `/user/profile/:userId`        | Get another user's profile by their ID               |
| PUT    | `/user/profile`                | Update the logged-in user's profile                  |

---

### **Comments (`/api/comments`)**
| Method | Endpoint                       | Description                                          |
|--------|--------------------------------|------------------------------------------------------|
| GET    | `/comments/user`               | Get all comments made by the logged-in user          |
| GET    | `/comments/review/:reviewId`   | Get comments for a specific review                   |
| GET    | `/comments/:commentId`         | Get a specific comment by its ID                     |
| POST   | `/comments`                    | Post a new comment                                   |
| PUT    | `/comments/:commentId`         | Update a comment by its ID                           |
| DELETE | `/comments/:commentId`         | Delete a comment by its ID                           |

---

## 🌟 Main Technical Decisions
- **JWT Authentication:** To enable secure and scalable user authentication.
- **MongoDB with Mongoose:** Chosen for its flexibility with non-relational data.
- **Nodemailer:** Enables real email verification during user signup.
- **Integration with External APIs:** Enriches the book catalog with real data from Google Books and Open Library APIs.
- **Express-validator:** Ensures input validation to maintain secure and correct data processing.

---

## 🛡 Possible Future Improvements
- ✅ Implement automated tests.  
- ✅ Add a bookmarks system for saving favorite books.  
- ✅ Improve the recommendation algorithm with more advanced logic.  
- ✅ Implement caching for frequent API requests.  
- ✅ Implement HATEOAS 
