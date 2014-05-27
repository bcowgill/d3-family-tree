// Person.js
// A person 'Class' for use within FamilyTree

var UTIL = require('util'),
	ASSERT = require('assert');

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
	this.children = [];
	initNames.call(this);
	initId.call(this);
	return this;
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

// Set a property of the person.
Person.prototype.set = function (property, value)
{
	assertOk.call(this, 'married' !== property, "Not allowed to set married property of a person. Use addMarriage().");
	assertOk.call(this, 'children' !== property, "Not allowed to set children property of a person. Use addChild().");
	assertOk.call(this, 'id' !== property, "Not allowed to set id property of a person once created.");
	this[property] = value;
	return this;
}

// Add a Person Id as a marriage of the Person
Person.prototype.addMarriage = function (personId, marriageNumber)
{
	registerId.call(this, personId, 'mentioned');
	assertOk.call(this, 'X' !== this.sex, "addMarriage not allowed for Person with unknown sex 'X'.");
	if (marriageNumber)
	{
		assertOk.call(this, this.married.length < marriageNumber || !this.married[marriageNumber - 1], "addMarriage number (" + marriageNumber + ") already exists. " + UTIL.inspect(this.married));
		this.married[marriageNumber - 1] = personId;
	}
	else
	{
		this.married.push(personId);
	}
	return this;
}

// Add a Person Id as a child of the Person
Person.prototype.addChild = function (personId, childNumber)
{
	registerId.call(this, personId, 'mentioned');
	assertOk.call(this, 'X' !== this.sex, "addChild not allowed for Person with unknown sex 'X'.");
	if (childNumber)
	{
		assertOk.call(this, this.children.length < childNumber || !this.children[childNumber - 1], "addChild number (" + childNumber + ") already exists. " + UTIL.inspect(this.children));
		this.children[childNumber - 1] = personId;
	}
	else
	{
		this.children.push(personId);
	}
	return this;
}

// Debugging function to show the register of Person Ids
Person.prototype.inspectIds = function ()
{
	return UTIL.inspect(oPersonId);
}

// Verify there are no more mentioned Id's in the Person Id register.
// That is, all known Person Ids now exist.
Person.prototype.allExist = function ()
{
	return Object.keys(oPersonId).every(function (id)
	{
		return 'exists' === oPersonId[id];
	});
}

//=======================================================================
// Private Methods

// Parse the fullName for pre-names, given names, surname, and aliases.
// [Pre Names] Given Names Surname (Alias Names)
// Pre Names are traditional names given to people i.e. First male always
// named John
function initNames()
{
	var fullName = this.fullName, Match;
	this.surName = '';
	this.preNames = [];
	this.aliasNames = [];
	this.givenNames = [];
	Match = fullName.match(/^\s*\[([^\]]+)\]\s*/);
	if (Match && Match.length >= 2)
	{
		this.preNames = Match[1].split(/\s+/);
		fullName = fullName.substr(Match[0].length);
	}
	Match = fullName.match(/\s*\(([^\)]+)\)\s*$/);
	if (Match && Match.length >= 2)
	{
		this.aliasNames = Match[1].split(/\s+/);
		fullName = fullName.substr(0, fullName.length - Match[0].length);
	}
	Match = fullName.split(/\s+/);
	assertOk.call(this, Match.length >= 1, "fullName must have at least a given name.");
	if (Match.length > 1)
	{
		this.surName = Match.pop();
	}
	this.givenNames = Match;
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
	registerId.call(this, this.id);
	return this;
}

// Register a person's Id as existing or mentioned. Registering an already
// existing Id as existing is a fatal error. Registering a mentioned Id
// makes it exist. Registering an existing Id as mentioned has no effect.
function registerId(id, state)
{
	assertOk.call(this, !/^\s*$/.test(id), "Person ID (" + id + ") must not be an empty string.");
	var doesNotExist = !oPersonId.hasOwnProperty(id) || 'exists' !== oPersonId[id];
	state = state || 'exists';
	if ('exists' === state)
	{
		assertOk.call(this, doesNotExist,
			"Person ID (" + id + ") already exists.");
		oPersonId[id] = 'exists';
	}
	else
	{
		if (doesNotExist)
		{
			oPersonId[id] = 'mentioned';
		}
	}
	return this;
}

// Assert data is ok given condition and die with message if not.
// The Id and source of the Person will be shown in the message if there is one.
function assertOk(condition, message)
{
	if (this.id)
	{
		message = "Person#" + this.id + ": " + message;
	}
	if (this.source)
	{
		message += " From " + this.source;
	}
	ASSERT.ok(condition, message);
}
