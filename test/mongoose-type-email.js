var expect = require('chai').expect;
var mongoose = require('mongoose');
var Mockgoose = require('mockgoose').Mockgoose;
new Mockgoose(mongoose);
require('../');

mongoose.Promise = Promise;

var UserSimple = mongoose.model('UserSimple', new mongoose.Schema({
	email: mongoose.SchemaTypes.Email
}));

var UserCustomMessage = mongoose.model('UserCustomMessage', new mongoose.Schema({
	email: { type: mongoose.SchemaTypes.Email, required: true, invalid: 'User invalid email address' }
}));

var UserAllowBlank = mongoose.model('UserAllowBlank', new mongoose.Schema({
	email: { type: mongoose.SchemaTypes.Email, allowBlank: true }
}));

var UserRequired = mongoose.model('UserRequired', new mongoose.Schema({
	email: {type: mongoose.SchemaTypes.Email, required: true}
}));

var UserNested = mongoose.model('UserNested', new mongoose.Schema({
	email: {
		work: {type: mongoose.SchemaTypes.Email, required: true},
		home: {type: mongoose.SchemaTypes.Email, required: true}
	}
}));

describe('mongoose-type-email', function(){
	before(function(done){
		mongoose.connect('mongodb://localhost/test');
		mongoose.connection.on('error', function(){});
		mongoose.connection.once('open', done);
	});

	after(function(){
		mongoose.connection.close();
	});

	it('should enable basic email field-type in schema', function(done){
		var user =  new UserSimple();
		user.save(done);
	});

	it('should not enable blank value', function(done){
		var user =  new UserSimple();
		user.email = '';
		user.validate(function(err){
			expect(err.errors.email.message).to.equal('invalid email address');
			done();
		});
	});

	it('should use custom invalid message', function(done) {
		var user =  new UserCustomMessage();
		user.email = 'invalid.email@';
		user.validate(function(err){
			expect(err.errors.email.message).to.equal('User invalid email address');
			done();
		});
	});

	it('should enable blank value when stated', function(done){
		var user =  new UserAllowBlank();
		user.email = '';
		user.save(done);
	});

	it('should require email', function(done){
		var user =  new UserRequired();
		user.validate(function(err){
			expect(err.errors.email.message).to.equal('Path `email` is required.');
			done();
		});
	});

	it('should enable nested required email', function(done){
		var user =  new UserNested();
		user.validate(function(err){
			expect(err.errors['email.home'].message).to.equal('Path `email.home` is required.');
			expect(err.errors['email.work'].message).to.equal('Path `email.work` is required.');
			done();
		});
	});
});