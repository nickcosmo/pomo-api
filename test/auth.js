const { expect } = require('chai');
const { authCheck, autoLogIn } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');

describe('Auth Middleware', () => {
    describe('authCheck Function', () => {
        it('should return an error if no token is found', function () {
            const req = {
                cookies: {},
            };
            const result = authCheck(req, {}, () => {});
            expect(result).to.be.an('error');
            expect(result).to.have.property('statusCode', 403);
            expect(result).to.have.property('message', 'You are not authorized to make this request!');
        });

        it('should return an error with statusCode of 403 if jwt malformed', () => {
            const req = {
                cookies: {
                    jwt: 'abc',
                },
            };
            sinon.stub(jwt, 'verify');
            jwt.verify.throws(new Error('jwt malformed'));
            const result = authCheck(req, {}, () => {});
            expect(result).to.have.property('statusCode', 403);
            expect(result).to.be.an('error');
            jwt.verify.restore();
        });
    });

    describe('autoLogin Function', () => {
        it('should return an error if no token is found', function () {
            const req = {
                cookies: {},
            };
            const result = autoLogIn(req, {}, () => {});
            expect(result).to.be.an('error');
            expect(result).to.have.property('statusCode', 403);
            expect(result).to.have.property('message', 'You are not authorized to make this request!');
        });

        it('should add userId and email to req after jwt is verified', () => {
            const req = {
                body: {},
                cookies: {
                    jwt: 'abc',
                },
            };
            sinon.stub(jwt, 'verify');
            jwt.verify.returns({ _id: 123, email: 'abc' });
            autoLogIn(req, {}, () => {});
            expect(req).to.have.property('userId');
            expect(req.body).to.have.property('email');
            jwt.verify.restore();
        });

        it('should return an error with statusCode of 403 if jwt is malformed', () => {
            const req = {
                body: {},
                cookies: {
                    jwt: 'abc',
                },
            };
            sinon.stub(jwt, 'verify');
            jwt.verify.throws(new Error('jwt malformed'));
            const result = autoLogIn(req, {}, () => {});
            expect(result).to.have.property('statusCode', 403);
            jwt.verify.restore();
        });
    });
});
