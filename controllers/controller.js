const { User, Profile, Category, Destination, Booking } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const QRCode = require('qrcode'); // MVP Package
const formatRupiah = require('../helpers/formatCurrency');
const nodemailer = require('nodemailer');

class Controller {
  // Landing Page
  static async landing(req, res) {
    try {
      res.render('landing', { user: req.session.user });
    } catch (err) {
      res.send(err.message);
    }
  }

  // Auth: Register Form
  static async registerForm(req, res) {
    try {
      const { errors } = req.query;
      res.render('register', { errors: errors ? errors.split(',') : [] });
    } catch (err) {
      res.send(err.message);
    }
  }

  // Auth: Post Register
  static async postRegister(req, res) {
    try {
      const { email, password, role, fullName, phone, address } = req.body;
      const newUser = await User.create({ email, password, role });
      await Profile.create({ fullName, phone, address, UserId: newUser.id });
      res.redirect('/login');
    } catch (err) {
      if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
        const errors = err.errors.map(e => e.message);
        return res.redirect(`/register?errors=${errors.join(',')}`);
      }
      res.send(err.message);
    }
  }

  // Auth: Login Form
  static async loginForm(req, res) {
    try {
      const { error } = req.query;
      res.render('login', { error });
    } catch (err) {
      res.send(err.message);
    }
  }

  // Auth: Post Login
  static async postLogin(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ where: { email } });
      if (user && bcrypt.compareSync(password, user.password)) {
        req.session.user = { id: user.id, email: user.email, role: user.role };
        return res.redirect('/destinations');
      }
      res.redirect('/login?error=Email atau password salah');
    } catch (err) {
      res.send(err.message);
    }
  }

  // Auth: Logout
  static async logout(req, res) {
    req.session.destroy(err => {
      if (err) return res.send(err.message);
      res.redirect('/login');
    });
  }

  // Destination List (Eager Loading + Search + Sort)
  static async destinationList(req, res) {
    try {
      const { search, sortBy, deleted } = req.query;
      let options = {
        include: Category, // Eager Loading Requirement
        where: {}
      };

      if (search) {
        options.where.name = { [Op.iLike]: `%${search}%` };
      }

      if (sortBy === 'price') {
        options.order = [['price', 'ASC']];
      } else if (sortBy === 'name') {
        options.order = [['name', 'ASC']];
      }

      const destinations = await Destination.findAll(options);
      res.render('destination', { 
        destinations, 
        user: req.session.user, 
        formatRupiah,
        deletedNotice: deleted 
      });
    } catch (err) {
      res.send(err.message);
    }
  }

  // Add Destination Form
  static async addDestinationForm(req, res) {
    try {
      const { errors } = req.query;
      const categories = await Category.findAll();
      res.render('add-destination', { 
        categories, 
        errors: errors ? errors.split(',') : [] 
      });
    } catch (err) {
      res.send(err.message);
    }
  }

  // Post Add Destination
  static async postAddDestination(req, res) {
    try {
      const { name, description, location, price, imageUrl, CategoryId } = req.body;
      await Destination.create({ name, description, location, price: +price, imageUrl, CategoryId: +CategoryId });
      res.redirect('/destinations');
    } catch (err) {
      if (err.name === 'SequelizeValidationError') {
        const errors = err.errors.map(e => e.message);
        return res.redirect(`/destinations/add?errors=${errors.join(',')}`);
      }
      res.send(err.message);
    }
  }

  // Delete Destination (Promise Chaining Requirement)
  static deleteDestination(req, res) {
    const { id } = req.params;
    let deletedName = '';
    Destination.findByPk(id)
      .then(destination => {
        if (!destination) throw new Error('Destinasi tidak ditemukan');
        deletedName = destination.name;
        return Destination.destroy({ where: { id } });
      })
      .then(() => {
        res.redirect(`/destinations?deleted=${encodeURIComponent(deletedName)}`);
      })
      .catch(err => {
        res.send(err.message);
      });
  }

  // Bookings List & MVP QR Code Generation
  static async bookingList(req, res) {
    try {
      const bookings = await Booking.findAll({
        where: { UserId: req.session.user.id },
        include: [Destination, User]
      });

      // Fitur MVP: QR Code Generation
      const bookingsWithQR = await Promise.all(bookings.map(async (b) => {
        const qrData = `BOOKING-ID:${b.id}|USER:${b.User.email}|DEST:${b.Destination.name}|TICKETS:${b.totalTicket}`;
        const qrCodeUrl = await QRCode.toDataURL(qrData);
        return { ...b.dataValues, qrCodeUrl };
      }));

      res.render('booking', { bookings: bookingsWithQR, formatRupiah, user: req.session.user });
    } catch (err) {
      res.send(err.message);
    }
  }

  // Post Create Booking
  static async createBooking(req, res) {
    try {
      const { DestinationId, totalTicket, bookingDate } = req.body;
      const destination = await Destination.findByPk(DestinationId);
      const totalPrice = destination.price * +totalTicket;

      await Booking.create({
        UserId: req.session.user.id,
        DestinationId: +DestinationId,
        bookingDate,
        totalTicket: +totalTicket,
        totalPrice,
        status: 'Success'
      });

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'tripnesiaori@gmail.com', // Email Gmail pengirim
          pass: 'txgwtrhrytaxumvr'     // 16 digit App Password Google
        }
      });
      console.log("Mengirim email ke:", req.session.user.email);
      // 2. Kirim Email Konfirmasi
      await transporter.sendMail({
        from: '"Tripnesia Support" <no-reply@tripnesia.com>',
        to: req.session.user.email,
        subject: `E-Tiket Konfirmasi Pemesanan - ${destination.name}`,
        html: `
          <h2>Pemesanan Berhasil!</h2>
          <p>Halo <strong>${req.session.user.email}</strong>, tiket wisata Anda berhasil dipesan.</p>
          <ul>
            <li><strong>Destinasi:</strong> ${destination.name}</li>
            <li><strong>Tanggal:</strong> ${new Date(bookingDate).toLocaleDateString('id-ID')}</li>
            <li><strong>Jumlah:</strong> ${totalTicket} tiket</li>
            <li><strong>Total Bayar:</strong> Rp ${totalPrice.toLocaleString('id-ID')}</li>
          </ul>
        `
      });

      res.redirect('/bookings');
    } catch (err) {
      res.send(err.message);
    }
  }
}

module.exports = Controller;