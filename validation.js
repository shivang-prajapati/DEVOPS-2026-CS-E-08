function validateName(name) {
    return name.trim() !== "";
}

function validateEmail(email) {
    const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
    return emailPattern.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

function validateMobile(mobile) {
    const mobilePattern = /^[0-9]{10}$/;
    return mobilePattern.test(mobile);
}

module.exports = {
    validateName,
    validateEmail,
    validatePassword,
    validateMobile
};