const express = require('express');
const expressLayouts = require('express-ejs-layouts');

const { body, validationResult, check } = require('express-validator');
const methodOvveride = require('method-override');

const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

require('./utils/db');
const Contact = require('./model/contact');

const app = express();
const port = 3000;

// Setup Method Ovveride
app.use(methodOvveride('_method'));

// Setup EJS
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Konfigurasi flash
app.use(cookieParser('secret'));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

// Halaman Home
app.get('/', (req, res) => {
  // res.sendFile('./index.html', { root: __dirname });
  const player = [
    {
      nama: 'Gustian',
      email: 'gustianrekt@gmail.com',
    },
    {
      nama: 'Ihsan Besarik',
      email: 'luminaire9@gmail.com',
    },
    {
      nama: 'Maxhill',
      email: 'antimagee@gmail.com',
    },
  ];
  res.render('index', {
    layout: 'layouts/main-layouts',
    nama: 'Rizal Kalam',
    title: 'Halaman Home',
    player,
  });
});

// Halaman About
app.get('/about', (req, res) => {
  res.render('about', {
    layout: 'layouts/main-layouts',
    title: 'Halaman About',
  });
});

// Halaman Contact
app.get('/contact', async (req, res) => {
  const contacts = await Contact.find();

  res.render('contact', {
    title: 'Halaman Contact',
    layout: 'layouts/main-layouts',
    contacts,
    msg: req.flash('msg'),
  });
});

// halaman form tambah data contact
app.get('/contact/add', (req, res) => {
  res.render('add-contact', {
    title: 'Form Tambah Data Contact',
    layout: 'layouts/main-layouts',
  });
});

// proses tambah data contact
app.post(
  '/contact',
  [
    body('nama').custom(async (value) => {
      const duplikiat = await Contact.findOne({ nama: value });
      if (duplikiat) {
        throw new Error('Nama contact sudah digunakan!');
      }
      return true;
    }),
    check('email', 'Email tidak valid!').isEmail(),
    check('nohp', 'No HP tidak valid!').isMobilePhone('id-ID'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('add-contact', {
        title: 'Form Tambah Data Contact',
        layout: 'layouts/main-layouts',
        errors: errors.array(),
      });
    } else {
      Contact.insertMany(req.body, (error, result) => {
        // kirimkan flash message
        req.flash('msg', 'Data Contact Berhasil Ditambahkan!');
        res.redirect('/contact');
      });
    }
  }
);

// // proses delete contact
// app.get('/contact/delete/:nama', async (req, res) => {
//   const contact = await Contact.findOne({ nama: req.params.nama });
//   if (!contact) {
//     res.status(404);
//     res.send('<h1>404</h1>');
//   } else {
//     Contact.deleteOne({ _id: contact._id }).then((result) => {
//       req.flash('msg', 'Data Contact Berhasil Dihapus!');
//       res.redirect('/contact');
//     });
//   }
// });
app.delete('/contact', (req, res) => {
  Contact.deleteOne({ nama: req.body.nama }).then((result) => {
    req.flash('msg', 'Data Contact Berhasil Dihapus!');
    res.redirect('/contact');
  });
});

// form ubah data contact
app.get('/contact/edit/:nama', async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });

  res.render('edit-contact', {
    title: 'Form Ubah Data Contact',
    layout: 'layouts/main-layouts',
    contact,
  });
});

// proses ubah data
app.put(
  '/contact',
  [
    body('nama').custom(async (value, { req }) => {
      const duplikiat = await Contact.findOne({ nama: value });
      if (value !== req.body.oldNama && duplikiat) {
        throw new Error('Nama contact sudah digunakan!');
      }
      return true;
    }),
    check('email', 'Email tidak valid!').isEmail(),
    check('nohp', 'No HP tidak valid!').isMobilePhone('id-ID'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('edit-contact', {
        title: 'Form Ubah Data Contact',
        layout: 'layouts/main-layouts',
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      Contact.updateOne(
        { _id: req.body._id },
        {
          $set: {
            nama: req.body.nama,
            email: req.body.email,
            nohp: req.body.nohp,
          },
        }
      ).then((result) => {
        // kirimkan flash message
        req.flash('msg', 'Data Contact Berhasil Diubah!');
        res.redirect('/contact');
      });
    }
  }
);

// halaman detail contact
app.get('/contact/:nama', async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });

  res.render('detail', {
    layout: 'layouts/main-layouts',
    title: 'Halaman Detail Contact',
    contact,
  });
});

app.listen(port, () => {
  console.log(`Mongo Contact App | listening at http://localhost:${port}`);
});
