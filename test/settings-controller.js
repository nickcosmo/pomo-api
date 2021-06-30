const { expect } = require('chai');
const sinon = require('sinon');

const { postSettings } = require('../controllers/settings-controller');
const User = require('../models/user-model');

describe('Settings Controller', function () {
    it('should throw an error with code 500 if accessing the db fails', function (done) {
        sinon.stub(User, 'findByIdAndUpdate');
        User.findByIdAndUpdate.throws();

        const req = {
            body: {
                studyInterval: 5,
                breakInterval: 5,
                longBreakInterval: 5,
                dailyGoal: 5,
            },
        };

        postSettings(req, {}, () => {}).then((result) => {
            expect(result).to.be.an('error');
            expect(result).to.have.property('statusCode', 500);
            expect(result).to.have.property('message');
            done();
        });
        User.findByIdAndUpdate.restore();
    });

    it('should return an error if no user is found in the database', function (done) {
        const mock = {
            exec: function () {
                return null;
            },
        };
        sinon.stub(User, 'findByIdAndUpdate');
        User.findByIdAndUpdate.returns(mock);

        const req = {
            body: {
                studyInterval: 5,
                breakInterval: 5,
                longBreakInterval: 5,
                dailyGoal: 5,
            },
        };
        postSettings(req, {}, () => {}).then((result) => {
            expect(result).to.be.an('error');
            expect(result).to.have.property('statusCode', 404);
            expect(result).to.have.property('message');
            done();
        });

        User.findByIdAndUpdate.restore();
    });

    it('should return a response with status 200 if user is found', () => {
        const mock = {
            exec: function () {
                return {
                    _doc: 'user',
                };
            },
        };
        sinon.stub(User, 'findByIdAndUpdate');
        User.findByIdAndUpdate.returns(mock);

        const req = {
            body: {
                studyInterval: 5,
                breakInterval: 5,
                longBreakInterval: 5,
                dailyGoal: 5,
            },
        };

        const res = {
            statusCode: null,
            message: null,
            userData: null,
            status: function (code) {
                this.statusCode = code;
                return this;
            },
            json: function (object) {
                const { message, ...userData } = object;
                this.message = message;
                this.userData = userData;
            },
        };

        return postSettings(req, res, () => {}).then(() => {
            console.log(res);
            expect(res.statusCode).to.be.equal(200);
            expect(res.message).to.be.equal('Post Successful!');
            expect(res.userData).to.not.be.equal(null);
            User.findByIdAndUpdate.restore();
        });

    });
});
