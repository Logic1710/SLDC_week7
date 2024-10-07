const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports.validateInput = (email) => {
  return emailRegex.test(email);
};
