// src/presentation/middlewares/errorHandler.js
function errorHandler(err, req, res, next) {
    console.error('Error:', err);

    let statusCode = 500;

    if (err.name === 'ValidationError') statusCode = 400;
    else if (err.name === 'NotFoundError') statusCode = 404;
    else if (err.name === 'ConflictError') statusCode = 409;

    // fallback: sqlite unique constraint
    if (statusCode === 500 && String(err.message || '').includes('UNIQUE')) {
        statusCode = 409;
    }

    res.status(statusCode).json({
        error: err.message || 'Internal server error'
    });
}

module.exports = errorHandler;
