const { check } = require('express-validator');


module.exports = [
    check('creditCardNumber')
    .exists().withMessage('Vui lòng cung cấp số thẻ')
    .notEmpty().withMessage('Không được để trống số thẻ')
    .isLength({min: 6, max: 6}).withMessage('Sai định dạng, số thẻ bao gồm 6 chữ số'),

    check('expirationDate')
    .exists().withMessage('Vui lòng cung cấp ngày hết hạn thẻ')
    .notEmpty().withMessage('Ngày hết hạn thẻ không được để trống'),

    check('cvvCode')
    .exists().withMessage('Vui lòng cung cấp mã cvv')
    .notEmpty().withMessage('Không được để trống mã cvv')
    .isLength({min: 3, max: 3}).withMessage('Sai định dạng, mã cvv bao gồm 3 chữ số'),

    check('actor')
    .exists().withMessage('Vui lòng cung cấp access token')
    .notEmpty().withMessage('Không được để trống access token'),

    check('money')
    .exists().withMessage('Vui lòng cung cấp số tiền cần nạp')
    .notEmpty().withMessage('Số tiền cần nạp không được để trống')
    .isNumeric().withMessage('Số tiền cần nạp phải là kiểu số'),
]
