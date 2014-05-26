// Person.js
// A person 'Class' for use within FamilyTree

var ASSERT = require('assert');

// Register of Unique Person Id's to prevent duplicates
var oPersonId = {};

//=======================================================================
// Public Methods

// Constructor for a Person
// Person({ key: val })
// fullName - [Optional Pre Names] Given Names Surname (Aliases)
//   be split into properties preNames givenNames Surname, Aliases
// sex - M, F, X X=unknown (cannot be married or have children)
// born - optional year born
// id - optional unique ID. Will be constructed from name and born if omitted
// source - optional source of the data if parsed from a file, etc.
function Person (oOptions)
{
	this.mustHave('type', oOptions, 'Person')
		.mayHave('source', oOptions)
		.mayHave('id', oOptions)
		.mustHave('fullName', oOptions)
		.mustHave('sex', oOptions, 'X')
		.mayHave('born', oOptions)
		.mayHave('father', oOptions)
		.mayHave('mother', oOptions)
		.mayHave('child_number', oOptions)
		.mayHave('died', oOptions);
	this.married = [];
	initNames.call(this);
	initId.call(this);
	// TODO validate ID's. Unknown Sex cannot marry or have children
}

module.exports = Person;

// During construction defines a property which the Person must have.
Person.prototype.mustHave = function (property, oFrom, defaultValue)
{
	if (oFrom.hasOwnProperty(property))
	{
		this[property] = oFrom[property];
	}
	else
	{
		this[property] = defaultValue;
	}
	if (null === this[property] || void 0 === this[property])
	{
		ASSERT.fail("New Person must have a " + property + "property.");
	}
	return this;
}

// During construction defines a property which the Person may be given.
Person.prototype.mayHave = function (property, oFrom, defaultValue)
{
	if (oFrom.hasOwnProperty(property))
	{
		this[property] = oFrom[property];
	}
	else
	{
		this[property] = defaultValue;
	}
	return this;
}

Person.prototype.set = function (property, value)
{
	this[property] = value;
	return this;
}

Person.prototype.addMarriage = function (personId, marriageNumber)
{
	// TODO implement this, check Id, use marriageNumber
	this.married.push(personId);
}

//=======================================================================
// Private Methods

// Parse the fullName for pre-names, given names, surname, and aliases.
function initNames()
{
	// TODO implement this.
	return this;
}

// Initialise a person's Id - generate it if missing and register it.
function initId()
{
	if (!this.id)
	{
		// Use the Full name and born year as Id but pull out all spaces and brackets
		this.id = this.fullName.replace(/\s+|\[|\]|\(|\)/g, '');
		if (this.born)
		{
			this.id = this.id + this.born.toString();
		}
	}
	assertOk.call(this, !oPersonId.hasOwnProperty(this.id) || 'exists' !== oPersonId[this.id], "Person ID (" + this.id + ") already exists");
	oPersonId[this.id] = 'exists';
	return this;
}

// Assert data is ok given condition and die with message if not.
// the source of the Person will be shown in the message if there is one.
function assertOk(condition, message)
{
	if (this.source)
	{
		message += " From " + this.source;
	}
	ASSERT.ok(condition, message);
}
