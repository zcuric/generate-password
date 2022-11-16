/*eslint no-unused-vars: "off"*/
const generator = require('./main');

// Generate one password.
const onePassword = generator.generate({
	length: 15, // defaults to 10
	numbers: true, // defaults to false
	symbols: true, // defaults to false
	uppercase: true, // defaults to true
	strict: true // defaults to false
});

console.log('Generate one password:', onePassword);

// Generate one password with provided list of symbols.
const onePasswordWithSymbols = generator.generate({
	length: 15, // defaults to 10
	numbers: true, // defaults to false
	symbols: '!@#$%&*', // defaults to false
	uppercase: true, // defaults to true
	strict: true // defaults to false
});

console.log('Generate one password with provided list of symbols \'!@#$%&*:', onePasswordWithSymbols);

// Generate ten bulk.
const passwords = generator.generateMultiple(10, {
	length: 15,
	numbers: true,
	symbols: true,
	uppercase: true
});

console.log('Generate array of 10 passwords:', passwords);
