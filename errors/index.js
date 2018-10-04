const errors = module.exports = {};

const extendError = (defName, defStatus, defMessage='') => {
    class CustomError extends Error {
        constructor(message) {
            super(message || defMessage);
            this.name = defName;
            this.status = defStatus;
        }
    }
    errors[defName] = CustomError;
    return CustomError;
}

extendError('TokenRequired', 400, 'Token required.');
extendError('InvalidLogin', 401, 'Invalid login details provided.');
extendError('InvalidToken', 401, 'Invalid token provided.');
extendError('InvalidAPIToken', 401, 'Invalid API token provided.');
extendError('InvalidUserToken', 401, 'Invalid userToken provided.');
extendError('InvalidCard', 401, 'Invalid card provided.');

extendError('MaxCardsReached', 400, 'Maximum cards registered, remove some to add more.');
extendError('CardNotFound', 404, 'Card does not exist.');

extendError('UserDisabled', 403, 'Your account has been diabled, contact an admin.');
extendError('AppNameRequired', 400, 'Application name is required.');
extendError('AppNameExists', 400, 'Application name already exists.');
extendError('TokenLimit', 400, 'You have registered too many tokens, please contact an admin.');

extendError('Internal', 500, 'An internal server error occurred, please alert an admin.');