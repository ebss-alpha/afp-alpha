const express = require('express')
const router = express.Router()

// Add your routes here - above the module.exports line

module.exports = router

router.get(['/'], (req, res) => {
  req.session.data = {}
  res.render('index.html')
})

router.get(['/start'], (req, res) => {
  req.session.data = {
    cookies: req.session.data.cookies
  }
  res.render('start.html')
})

router.get(['/cookie-choice'], (req, res) => {
  const cookieChoice = req.query.choice === 'accept'
  req.session.data.cookies = cookieChoice
  res.redirect(req.headers.referer)
})

router.get(['/location-check'], (req, res) => {
  switch (req.session.data['where-do-you-live']) {
    case 'northern-ireland':
      res.redirect('/apply-for-combined-fund')
      break
    case 'england-scotland-wales':
    default:
      res.redirect('/do-you-have-a-bank-account')
      break
  }
})

router.get(['/bank-account-check'], (req, res) => {
  switch (req.session.data['do-you-have-a-bank-account']) {
    case 'yes':
      res.redirect('/how-is-your-home-mainly-heated')
      break
    case 'no':
    default:
      res.redirect('/get-a-bank-account')
      break
  }
})

router.get(['/fuel-check'], (req, res) => {
  const ineligibleFuels = ['mains-gas', 'electric', 'heat-network']
  const afpIneligible = req.session.data['how-is-your-home-mainly-heated'].some(fuel => ineligibleFuels.includes(fuel))
  if (afpIneligible) {
    res.redirect('/ineligible-for-afp')
  } else {
    res.redirect('/describe-where-you-live')
  }
})

const describeWhereYouLiveSummary = {
  'house-or-flat-owned': 'I live in a house or flat that my household owns',
  'heat-network': 'I live in a home that has a heat network, communal or district heating',
  'park-home': 'I live in a residential park home',
  'residential-mooring': 'I live on a boat with a permanent residential mooring licence',
  'continous-crusier': 'I live on a boat with a continuous cruising licence',
  farm: 'I live on a farm',
  'permanent-residential': 'I live in a caravan/mobile home on a permanent residential site',
  'pay-for-care': 'I live in a care home and I pay for some or all of my care',
  'private-landlord': 'I rent from a private landlord or agency',
  'council-or-housing-association': 'I rent from a council or housing association',
  other: "I don't fit into any of these categories"
}

router.get(['/user-group-check'], (req, res) => {
  req.session.data['dwyl-summary'] = describeWhereYouLiveSummary[req.session.data['describe-where-you-live']]
  switch (req.session.data['describe-where-you-live']) {
    case 'house-or-flat-rented':
      res.redirect('/house-or-flat-rented')
      break
    case 'house-or-flat-owned':
      res.redirect('/find-your-address')
      break
    case 'park-home':
      res.redirect('/find-your-address')
      break
    case 'care-home':
      res.redirect('/care-home')
      break
    case 'boat':
      res.redirect('/boat')
      break
    case 'farm':
      res.redirect('/find-your-address')
      break
    case 'caravan':
      res.redirect('/caravan')
      break
    case 'other':
    default:
      res.redirect('/find-your-address')
      break
  }
})

router.get(['/address-lookup'], (req, res) => {
  const numberProvided = req.session.data['address-housenumber'].length > 0
  if (numberProvided) {
    res.redirect('/is-this-your-address')
  } else {
    res.redirect('/choose-your-address')
  }
})

router.get(['/address-confirmation-check'], (req, res) => {
  if (req.session.data['is-this-your-address'] === 'yes') {
    res.redirect('/is-this-your-main-home')
  } else {
    res.redirect('/what-is-your-address')
  }
})

router.get(['/home-check'], (req, res) => {
  if (req.session.data['is-this-your-main-home'] === 'no') {
    res.redirect('/ineligible-second-home')
  } else {
    res.redirect('/eligible-for-afp')
  }
})

router.get(['/situation-specific-check'], (req, res) => {
  req.session.data['dwyl-summary'] = describeWhereYouLiveSummary[req.session.data['situation-specific']]
  switch (req.session.data['situation-specific']) {
    case 'student':
    case 'continuous-cruiser':
    case 'do-not-pay-for-care':
    case 'not-fixed':
      res.redirect('/ineligible-home-type')
      break
    default:
      res.redirect('/find-your-address')
      break
  }
})

router.get(['/contact-check'], (req, res) => {
  const y = req.session.data['dob-year'].length > 0 ? parseInt(req.session.data['dob-year']) : 1930
  const m = req.session.data['dob-month'].length > 0 ? parseInt(req.session.data['dob-month']) - 1 : 0
  const d = req.session.data['dob-day'].length > 0 ? parseInt(req.session.data['dob-day']) : 1
  req.session.data.dob = new Date(y, m, d)
  res.redirect('/what-are-your-bank-account-details')
})

router.get(['/council-tax-check', '/rates-check'], (req, res) => {
  const proofRequired = req.session.data['describe-where-you-live'] === 'care-home' || req.session.data['rates-or-council-tax'] === 'no'
  if (proofRequired) {
    res.redirect('/upload-proof-of-address')
  } else {
    res.redirect('/what-is-your-full-name')
  }
})

router.get(['/live-bank-check'], (req, res) => {
  switch (req.session.data['sort-code'].trim().replaceAll('-', '')) {
    case '999999':
      res.redirect('/check-your-bank-details')
      break
    default:
      res.redirect('/check-your-answers')
  }
})
