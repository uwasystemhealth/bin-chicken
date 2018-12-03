module.exports = {
    type: String,
    required: [true, 'A Pheme number is required'],
    match: [/^\d{8}$/, 'Invalid Pheme number provided']
};