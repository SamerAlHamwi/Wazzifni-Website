const mongoose = require('mongoose');

const repSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Rep = mongoose.model('Rep', repSchema);

// Attempt to drop the stale 'name_1' index if it exists in the database.
// This is necessary because we removed the 'name' field but the unique index remains.
Rep.collection.dropIndex('name_1')
  .then(() => console.log('Successfully dropped stale name_1 index'))
  .catch(err => {
    // IndexNotFound (code 27) is expected if it's already gone
    if (err.code !== 27) {
      // console.error('Note: name_1 index could not be dropped (it may not exist)');
    }
  });

module.exports = Rep;