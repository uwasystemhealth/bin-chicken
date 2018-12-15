module.exports = {
    type: String,
    required: [true, 'A name is required.'],
    trim: true,
    lowercase: true,
    maxLength: [128, 'Names cannot exceed 128 characters in length.'],
};