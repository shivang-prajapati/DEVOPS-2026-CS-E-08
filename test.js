const {
    validateName,
    validateEmail,
    validatePassword,
    validateMobile
} = require('./validation');

test('Valid Name', () => {
    expect(validateName('Shivang')).toBe(true);
});

test('Invalid Name', () => {
    expect(validateName('')).toBe(false);
});

test('Valid Email', () => {
    expect(validateEmail('abc@gmail.com')).toBe(true);
});

test('Invalid Email', () => {
    expect(validateEmail('abc@gmail')).toBe(false);
});

test('Valid Password', () => {
    expect(validatePassword('abcdef')).toBe(true);
});

test('Invalid Password', () => {
    expect(validatePassword('123')).toBe(false);
});

test('Valid Mobile', () => {
    expect(validateMobile('9876543210')).toBe(true);
});

test('Invalid Mobile', () => {
    expect(validateMobile('12345')).toBe(false);
});