#!/usr/bin/env node
// parseFamilyTree.js
// parse a txt file representation of a family tree and produce JSON for d3

var fs = require('fs'),
	byline = require('byline'), // https://github.com/jahewson/node-byline
	ASSERT = require('assert'), // http://nodejs.org/api/assert.html
	UTIL = require('util');     // http://nodejs.org/api/util.html

var stream = fs.createReadStream('data/family-tree.txt');
stream = byline.createStream(stream);

stream.on('data', function(line)
{
	line = line.toString();
	if (!/^\s*#/.test(line))
	{
		var oPerson = { type: 'Person', married: [], 'line': line }, aFields = line.split(/\s*;\s*/);
		ASSERT.ok(aFields.length >= 3, "Person information must contain an ID; Sex; Name; For line: " + line);
		oPerson.id = aFields.shift();
		ASSERT.ok(!/^\s*$/.test(oPerson.id), "Person information ID (" + oPerson.id + ") must not be an empty string. For line: " + line);
		oPerson.sex = aFields.shift().toUpperCase();
		ASSERT.ok(/^[MFX]$/.test(oPerson.sex), "Person information Sex (" + oPerson.sex + ") must be M, F or X. For line: " + line);
		oPerson.name = aFields.shift();
		ASSERT.ok(!/^\s*$/.test(oPerson.name), "Person information Name (" + oPerson.name + ") must not be an empty string. For line: " + line);
		aFields.forEach(function (field) {
			var numParams = 2, aKeyValue = field.split(/\s*:\s*/);
			if (!/^\s*$/.test(field))
			{
				ASSERT.ok(aKeyValue.length >= 2, "Person information field (" + field + ") must have at least a key:value. For line: " + line);
				switch (aKeyValue[0])
				{
					case '':
						break;
					case 'b':
						ASSERT.ok(/^\d+$/.test(aKeyValue[1]), "Person information Born field (" + field + ") must be a year. For line: " + line);
						oPerson.born = aKeyValue[1];
						break;
					case 'd':
						ASSERT.ok(/^\d+$/.test(aKeyValue[1]), "Person information Died field (" + field + ") must be a year. For line: " + line);
						oPerson.died = aKeyValue[1];
						break;
					case 'm':
						if (aKeyValue.length > numParams)
						{
							numParams = 3;
							ASSERT.ok(/^\d+$/.test(aKeyValue[1]), "Person information Married field (" + field + ") parameter 1 must be a number. For line: " + line);
							ASSERT.ok(parseInt(aKeyValue[1]) >= 1, "Person information Married field (" + field + ") parameter 1 must be a number >= 1. For line: " + line);
							ASSERT.ok(!/^\s*$/.test(aKeyValue[2]), "Person information Married field (" + field + ") parameter 2 Person ID must not be an empty string. For line: " + line);
							oPerson.married[parseInt(aKeyValue[1]) - 1] = aKeyValue[2];
						}
						else
						{
							ASSERT.ok(!/^\s*$/.test(aKeyValue[1]), "Person information Married field (" + field + ") parameter 1 Person ID must not be an empty string. For line: " + line);
							oPerson.married.push(aKeyValue[1]);
						}
						break;
					case 'pm':
						ASSERT.ok(!/^\s*$/.test(aKeyValue[1]), "Person information Mother field (" + field + ") Person ID must not be an empty string. For line: " + line);
						oPerson.mother = aKeyValue[1];
						break;
					case 'pf':
						ASSERT.ok(!/^\s*$/.test(aKeyValue[1]), "Person information Father field (" + field + ") Person ID must not be an empty string. For line: " + line);
						oPerson.father = aKeyValue[1];
						break;
					case 'cn':
						ASSERT.ok(/^\d+$/.test(aKeyValue[1]), "Person information Child Number field (" + field + ") must be a number. For line: " + line);
						ASSERT.ok(parseInt(aKeyValue[1]) >= 1, "Person information Child Number field (" + field + ") must be a number >= 1. For line: " + line);
						oPerson.child_number = aKeyValue[1];
						break;
					default:
						ASSERT.fail("Person information field (" + field + ") unknown key name. For line: " + line);
				}
				ASSERT.ok(aKeyValue.length <= numParams, "Person information field (" + field + ") must have no more than " + numParams + " values separated by a colon. For line: " + line);
				// TODO validate ID's, marriages, unknown sex cannot have children, be married.
			}
		});
		UTIL.puts(UTIL.inspect(oPerson), '');
	}
});
