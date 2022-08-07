const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/rizal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

// // Menambah 1 data
// const contact1 = new Contact({
//   nama: 'Ihsan Besarik',
//   nohp: '081293846648',
//   email: 'luminaire09@gmail.com',
// });

// // Simpan ke collection
// contact1.save().then((contact) => console.log(contact));
