module.exports = {
    type: String,
    required: [true, 'An email is required.'],
    match: [/^.+@.+[.].+$/, 'Invalid email provided.'],
    trim: true,
    lowercase: true,
    maxLength: [256, 'An email address cannot exceed 256 characters in length']
};