// eslint-disable-next-line no-undef
const crypto = globalThis && globalThis.crypto || require('node:crypto').webcrypto;

const RANDOM_BATCH_SIZE = 256;

let randomIndex;
let randomBytes;

const getNextRandomValue = function() {
	if (randomIndex === undefined || randomIndex >= randomBytes.length) {
		randomIndex = 0;
		randomBytes = crypto.getRandomValues(new Uint8Array(RANDOM_BATCH_SIZE));
	}

	let result = randomBytes[randomIndex];
	randomIndex += 1;

	return result;
};

// Generates a random number
const randomNumber = function(max) {
	// gives a number between 0 (inclusive) and max (exclusive)
	let rand = getNextRandomValue();
	while (rand >= 256 - (256 % max)) {
		rand = getNextRandomValue();
	}
	return rand % max;
};

// Possible combinations
let lowercase = 'abcdefghijklmnopqrstuvwxyz';
let uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
let numbers = '0123456789';
let symbols = '!@#$%^&*()+_-=}{[]|:;"/?.><,`~';
let similarCharacters = /[ilLI|`oO0]/g;
let strictRules = [
	{ name: 'lowercase', rule: /[a-z]/ },
	{ name: 'uppercase', rule: /[A-Z]/ },
	{ name: 'numbers', rule: /[0-9]/ },
	{ name: 'symbols', rule: /[!@#$%^&*()+_\-=}{[\]|:;"/?.><,`~]/ }
];

const generatePassword = function(options, pool) {
	let password = '';
	const optionsLength = options.length;
	const poolLength = pool.length;

	for (let i = 0; i < optionsLength; i++) {
		password += pool[randomNumber(poolLength)];
	}

	if (options.strict) {
		// Iterate over each rule, checking to see if the password works.
		let fitsRules = strictRules.every(function(rule) {
			// If the option is not checked, ignore it.
			if (!options[rule.name]) return true;

			// Treat symbol differently if explicit string is provided
			if (rule.name === 'symbols' && typeof options[rule.name] === 'string') {
				// Create a regular expression from the provided symbols
				let re = new RegExp('['+options[rule.name]+']');
				return re.test(password);
			}

			// Run the regex on the password and return whether
			// or not it matches.
			return rule.rule.test(password);
		});

		// If it doesn't fit the rules, generate a new one (recursion).
		if (!fitsRules) return generatePassword(options, pool);
	}

	return password;
};


const getPool = function(options) {
	// Generate character pool
	let pool = '';
	if (options.lowercase) pool += lowercase;
	if (options.uppercase) pool += uppercase;
	if (options.numbers) pool += numbers;
	if (options.symbols) {
		pool += typeof options.symbols === 'string' ? options.symbols : symbols;
	}

	// Throw error if pool is empty.
	if (!pool) {
		throw new TypeError('At least one rule for pools must be true');
	}

	if (options.excludeSimilarCharacters) pool = pool.replace(similarCharacters, '');

	// excludes characters from the pool
	let i = options.exclude.length;
	while (i--) {
		pool = pool.replace(options.exclude[i], '');
	}
	return pool;
};

// Generate a random password.
const generate = function(options = {}) {
	const defaults = {
		length: 10,
		numbers: false,
		symbols: false,
		exclude: '',
		uppercase: true,
		lowercase: true,
		excludeSimilarCharacters: false,
		strict: false
	};
	// Set defaults.
	options = Object.assign(defaults, options);

	if (options.strict) {
		let minStrictLength = 1 + (options.numbers ? 1 : 0) + (options.symbols ? 1 : 0) + (options.uppercase ? 1 : 0);
		if (minStrictLength > options.length) {
			throw new TypeError('Length must correlate with strict guidelines');
		}
	}

	const pool = getPool(options);
	return generatePassword(options, pool);
};

// Generates multiple passwords at once with the same options.
const generateMultiple = function(amount, options) {
	let passwords = [];

	for (let i = 0; i < amount; i++) {
		passwords[i] = module.exports.generate(options);
	}

	return passwords;
};

module.exports = {
	generate,
	generateMultiple
};

