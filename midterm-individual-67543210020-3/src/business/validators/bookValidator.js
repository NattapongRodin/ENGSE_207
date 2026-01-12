// src/business/validators/bookValidator.js
class BookValidator {
    validateBookData(data) {
        const { title, author, isbn } = data || {};

        if (!title || !author || !isbn) {
            const err = new Error('Title, author, and ISBN are required');
            err.name = 'ValidationError';
            throw err;
        }

        return true;
    }

    validateISBN(isbn) {
        const isbnPattern = /^(97[89])?\d{9}[\dXx]$/;
        const cleanISBN = String(isbn || '').replace(/-/g, '');

        if (!isbnPattern.test(cleanISBN)) {
            const err = new Error('Invalid ISBN format');
            err.name = 'ValidationError';
            throw err;
        }

        return true;
    }

    validateId(id) {
        const numId = parseInt(id, 10);

        if (isNaN(numId) || numId <= 0) {
            const err = new Error('Invalid book ID');
            err.name = 'ValidationError';
            throw err;
        }

        return numId;
    }

    validateStatus(status) {
        const allowed = ['available', 'borrowed'];
        if (!allowed.includes(status)) {
            const err = new Error("Invalid status. Allowed: 'available' or 'borrowed'");
            err.name = 'ValidationError';
            throw err;
        }
        return true;
    }
}

module.exports = new BookValidator();
