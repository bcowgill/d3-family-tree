// ParseFamilyTree.js
// object for storage of a family tree.
// parse a text file representation to product JSON objects

var Person = require('./Person'),
	ASSERT = require('assert'); // http://nodejs.org/api/assert.html

//=======================================================================
// Public Methods

module.exports = { 'type': 'ParseFamilyTree' };

function parseLine(line, source)
{
	// Line being parsed looks like this:
	// ID; Sex; [Common Names] Names (Nickname(s)); b:YYYY; pm:ID; pf:ID; cn:1 m:1:YYYY:ID; d:YYYY;
	// b=born d=died pm=parent mother pf=parent father cn=child number m=married (number,year)
	var aFields = line.split(/\s*;\s*/), oPerson = {};
	assertOk(line, aFields.length >= 3, "must contain an 'ID; Sex; Name;'.");

	oPerson.source = source ? source + ': ' + line: line;
	oPerson.id = aFields.shift();
	oPerson.sex = aFields.shift().toUpperCase();
	oPerson.fullName = aFields.shift();

	assertOk(line, !/^\s*$/.test(oPerson.id),   "ID (" + oPerson.id + ") must not be an empty string.");
	assertOk(line, /^[MFX]$/.test(oPerson.sex), "Sex (" + oPerson.sex + ") must be M, F or X.");
	assertOk(line, !/^\s*$/.test(oPerson.name), "Name (" + oPerson.name + ") must not be an empty string.");

	// If birth year present it MUST be first parameter.
	if (/b\s*:\s*\d+/.test(line))
	{
		var aParams = parseField(aFields[0], line);
		assertOk(line, aParams[0] && ('born' === aParams[0]), "born field must be first field after full name (if present).");
		oPerson.born = aParams[1];
	}
	// Personify the data now that we may have the born date.
	oPerson = new Person(oPerson);

	aFields.forEach(function (field) {
		var aParams = parseField(field, line), key = aParams[0];
		if (key)
		{
			if ('married' === key)
			{
				if (aParams[2])
				{
					oPerson.addMarriage(aParams[1], aParams[2]);
				}
				else
				{
					oPerson.addMarriage(aParams[1]);
				}
			}
			else
			{
				oPerson.set(key, aParams[1]);
			}
		}
	});
	return oPerson;
}

module.exports.parseLine = parseLine;

//=======================================================================
// Private Methods

// Parse a colon separated field into key, value and optional number
// m:2:WifeName => [married, WifeName, 2]
function parseField(field, line)
{
	var numParams = 2, aKeyValue = field.split(/\s*:\s*/),
		key, value, number;
	if (!/^\s*$/.test(field))
	{
		assertOk(line, aKeyValue.length >= 2, "field (" + field + ") must have at least a key:value.");
		value = aKeyValue[1];
		switch (aKeyValue[0])
		{
			case '':
				break;
			case 'b':
				key = 'born';
				assertFieldOk(key, field, line, /^\d+$/.test(value),
					"must be a year.");
				value = parseInt(value);
				break;
			case 'd':
				key = 'died';
				assertFieldOk(key, field, line, /^\d+$/.test(value),
					"must be a year.");
				value = parseInt(value);
				break;
			case 'pm':
				key = 'mother';
				assertFieldOk(key, field, line, !/^\s*$/.test(value),
					"Person ID must not be an empty string.");
				break;
			case 'pf':
				key = 'father';
				assertFieldOk(key, field, line, !/^\s*$/.test(value),
					"Person ID must not be an empty string.");
				break;
			case 'cn':
				key = 'child_number';
				assertFieldOk(key, field, line, /^\d+$/.test(value),
					"must be a positive number.");
				value = parseInt(value);
				assertFieldOk(key, field, line, value >= 1,
					"must be a number >= 1.");
				break;
			case 'm':
				key = 'married';
				if (aKeyValue.length > numParams)
				{
					numParams = 3;
					assertFieldOk(key, field, line, /^\d+$/.test(value),
						"parameter 1 marriage number must be a positive number.");
					number = parseInt(value);
					value = aKeyValue[2];
					assertFieldOk(key, field, line, number >= 1,
						"parameter 1 marriage number must be a number >= 1.");
					assertFieldOk(key, field, line, !/^\s*$/.test(value),
						"parameter 2 Person ID must not be an empty string.");
				}
				else
				{
					assertFieldOk(key, field, line, !/^\s*$/.test(value),
						"parameter 1 Person ID must not be an empty string.");
				}
				break;
			default:
				assertFieldOk("Unknown", field, line, false, "error");
		}
		assertFieldOk(key, field, line, aKeyValue.length <= numParams,
			"must have no more than " + numParams + " values separated by a colon.");
	}
	return [key, value, number];
}

// Assert data is ok showing parsed line and message if not.
function assertOk(line, condition, message)
{
	// TODO could be an exception instead of an assertion.
	ASSERT.ok(condition, "Person information " + message + "\nFor line: " + line);
}

// Assert field is ok showing field, parsed line and message if not.
function assertFieldOk(key, field, line, condition, message)
{
	assertOk(line, condition, "Person information " + key + " field (" + field + ") " + message + "\nFor line: " + line);
}
