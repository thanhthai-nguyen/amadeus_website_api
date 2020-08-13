const auth = require('./auth');
const socialAuth = require('./socialAuth');
const user = require('./user');
const normal = require('./normal');
const cartItem = require('./cartitem');
const Admin = require('./admin');


const authenticate = require('../middlewares/authenticate');
const passport = require('passport');

module.exports = app => {
    app.get('/', (req, res) => {
        res.render('home');
    });
    
    app.use('/api/auth', auth);
    app.use('/api/user', authenticate, user);
    app.use('/api/normal', normal);
    app.use('/api/cart', authenticate, cartItem);
    app.use('/api/social', socialAuth);
    app.use('/api/admin', Admin);

    // =====================================
    // FACEBOOK ROUTES =====================
    // =====================================
    // yêu cầu xác thực bằng facebook
    app.get('/auth/facebook', 
        passport.authenticate('facebook', {scope: ['email']}));

    // xử lý sau khi user cho phép xác thực với facebook
    app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        session: false
        }), (req, res) => {
            if (req.user._id) {
                res.json({
                    success: true,
                    _id: req.user._id
            })
            } else {
                res.json({
                    success: false
            })
            }
        }
    );

};