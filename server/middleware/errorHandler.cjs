const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        error: `Route not found - ${req.originalUrl}`
    });
};

const errorHandler = (err, req, res, next) => {
    console.error('API Error:', err);
    
    const statusCode = err.status || err.statusCode || 500;
    
    res.status(statusCode).json({
        success: false,
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = {
    notFoundHandler,
    errorHandler
};
