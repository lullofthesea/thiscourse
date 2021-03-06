const bearerToken = require("express-bearer-token");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { jwtConfig } = require("./config");
const { User } = require("./db/models");

const { secret, expiresIn } = jwtConfig;

const getUserToken = user => {
    const userData = {
        id: user.id,
        email: user.email,
    };

    const token = jwt.sign(
        { data: userData },
        secret,
        { expiresIn: parseInt(expiresIn, 10) }
    );

    return token;
};

const restoreUser = (req, res, next) => {
    const { token } = req;
    if (!token) {
        const err = new Error('Missing token.');
        err.errors = ['Token was missing from request'];
        err.status = 401;
        err.title = 'Missing token.';
        return next(err);
    }

    return jwt.verify(token, secret, null, async (err, jwtPayload) => {
        if (err) {
            err.status = 401;
            return next(err);
        }

        const { id } = jwtPayload.data;

        try {
            req.user = await User.findByPk(id);
        } catch (e) {
            return next(e);
        }

        if (!req.user) {
            return res.set("WWW-Authenticate", "Bearer")
                .status(401)
                .end();
        }

        return next();
    });
};

const requireUserAuth = [bearerToken(), restoreUser];

const validatePassword = (password, hashedPassword) => {
    return bcrypt.compareSync(password, hashedPassword.toString());
}

module.exports = {
    getUserToken,
    requireUserAuth,
    validatePassword,
};