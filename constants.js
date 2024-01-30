const Departments = Object.freeze({
    Admin: 1,
    Marketing: 2,
    Sales: 3,
    Production: 4,
    Legal: 5
});

const HTTP = Object.freeze({
    OK: 200,
    Created: 201,
    BadRequest: 400,
    Unauthorized: 401,
    Forbidden: 403,
    NotFound: 404,
    InternalServerError: 500,
    NotImplemented: 501,
});

module.exports = {
    Departments,
    HTTP
};
