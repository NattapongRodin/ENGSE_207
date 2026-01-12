// src/business/services/bookService.js
const bookRepository = require('../../data/repositories/bookRepository');
const bookValidator = require('../validators/bookValidator');

class BookService {
    async getAllBooks(status = null) {
        if (status !== null && status !== undefined && status !== '') {
            bookValidator.validateStatus(status);
        } else {
            status = null;
        }

        const books = await bookRepository.findAll(status);

        const available = books.filter((b) => b.status === 'available').length;
        const borrowed = books.filter((b) => b.status === 'borrowed').length;

        return {
            books,
            statistics: { available, borrowed, total: books.length }
        };
    }

    async getBookById(id) {
        const bookId = bookValidator.validateId(id);

        const book = await bookRepository.findById(bookId);
        if (!book) {
            const err = new Error('Book not found');
            err.name = 'NotFoundError';
            throw err;
        }

        return book;
    }

    async createBook(bookData) {
        bookValidator.validateBookData(bookData);
        bookValidator.validateISBN(bookData.isbn);

        try {
            const created = await bookRepository.create(bookData);
            return created;
        } catch (e) {
            // sqlite unique constraint
            if (String(e.message || '').includes('UNIQUE')) {
                const err = new Error('ISBN already exists');
                err.name = 'ConflictError';
                throw err;
            }
            throw e;
        }
    }

    async updateBook(id, bookData) {
        const bookId = bookValidator.validateId(id);
        bookValidator.validateBookData(bookData);
        bookValidator.validateISBN(bookData.isbn);

        const existing = await bookRepository.findById(bookId);
        if (!existing) {
            const err = new Error('Book not found');
            err.name = 'NotFoundError';
            throw err;
        }

        try {
            const updated = await bookRepository.update(bookId, bookData);
            if (!updated) {
                const err = new Error('Book not found');
                err.name = 'NotFoundError';
                throw err;
            }
            return updated;
        } catch (e) {
            if (String(e.message || '').includes('UNIQUE')) {
                const err = new Error('ISBN already exists');
                err.name = 'ConflictError';
                throw err;
            }
            throw e;
        }
    }

    async borrowBook(id) {
        const bookId = bookValidator.validateId(id);

        const book = await bookRepository.findById(bookId);
        if (!book) {
            const err = new Error('Book not found');
            err.name = 'NotFoundError';
            throw err;
        }

        if (book.status === 'borrowed') {
            const err = new Error('Book is already borrowed');
            err.name = 'ValidationError';
            throw err;
        }

        const updated = await bookRepository.updateStatus(bookId, 'borrowed');
        if (!updated) {
            const err = new Error('Book not found');
            err.name = 'NotFoundError';
            throw err;
        }

        return updated;
    }

    async returnBook(id) {
        const bookId = bookValidator.validateId(id);

        const book = await bookRepository.findById(bookId);
        if (!book) {
            const err = new Error('Book not found');
            err.name = 'NotFoundError';
            throw err;
        }

        if (book.status !== 'borrowed') {
            const err = new Error('Book is not borrowed');
            err.name = 'ValidationError';
            throw err;
        }

        const updated = await bookRepository.updateStatus(bookId, 'available');
        if (!updated) {
            const err = new Error('Book not found');
            err.name = 'NotFoundError';
            throw err;
        }

        return updated;
    }

    async deleteBook(id) {
        const bookId = bookValidator.validateId(id);

        const book = await bookRepository.findById(bookId);
        if (!book) {
            const err = new Error('Book not found');
            err.name = 'NotFoundError';
            throw err;
        }

        if (book.status === 'borrowed') {
            const err = new Error('Cannot delete borrowed book');
            err.name = 'ValidationError';
            throw err;
        }

        return await bookRepository.delete(bookId);
    }
}

module.exports = new BookService();
