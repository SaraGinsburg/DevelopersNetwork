const express = require('express');
const request = require('request');
const config = require('config')
const router = express.Router();
const { check, validationResult } = require('express-validator')

const auth = require('../../middleware/auth')
const User = require('../../models/User')
const Profile = require('../../models/Profile');
const { trusted } = require('mongoose');

//@route    GET api/profile/me
//@desc     Get current user's profile
//@access   Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({user: req.user.id}).populate('user',['name', 'avatar'])

    if (!profile) {
      return res.status(400).json({msg:'There is no profile for this user'})
    }
    res.json(profile)

  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
});

//@route    POST api/profile
//@desc     Create or Update a user's profile
//@access   Private
router.post(
  '/', 
  auth, 
  check('status', 'Status is required').notEmpty(),
  check('skills', 'Skills is required').notEmpty(),
  async (req, res )=> {
  const errors = validationResult(req)
  if(!errors.isEmpty()){
    return res.status(400).json({errors: errors.array()})
  }

  //destructure the request
  const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook
  } = req.body

  // Build profile object
  const profileFields = {}
  profileFields.user = req.user.id
  if(company) profileFields.company = company
  if(website) profileFields.website = website
  if(location) profileFields.location = location
  if(bio) profileFields.bio = bio
  if(status) profileFields.status = status
  if(githubusername) profileFields.githubusername = githubusername
  if(skills){
    profileFields.skills = skills.split(',').map(skill =>  skill.trim())
  }
  
  //Build social object
  profileFields.social = {}
  if (youtube) profileFields.social.youtube = youtube
  if (twitter) profileFields.social.twitter = twitter
  if (instagram) profileFields.social.instagram = instagram
  if (linkedin) profileFields.social.linkedin = linkedin
  if (facebook) profileFields.social.facebook = facebook

  try {
      //update, using upsert option (creates new doc if no match is found):
      let profile = await Profile.findOneAndUpdate(
        {user: req.user.id},
        {$set: profileFields},
        {new: true, upsert: true, setDefaultsOnInsert:true}
      )
      return res.json(profile)
    
    //create
    profile = await new Profile(profileFields)
    
    await profile.save()
    
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

//@route    GET api/profile
//@desc     Get all profiles
//@access   Public
router.get('/', async (req,res)=>{
  try {
    const profiles = await Profile.find().populate('user',['name', 'avatar'])
    res.json(profiles)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }

})

//@route    GET api/profile/user/:user_id
//@desc     Get profile by user ID
//@access   Public
router.get('/user/:user_id', async (req,res)=>{
  try {
    const profile = await Profile.findOne({user: req.params.user_id}).populate('user',['name', 'avatar'])
    
    if (!profile) return res.status(400).json({msg: 'Profile not found'})

    return res.json(profile)

  } catch (err) {
    console.error(err.message)
    if (err.kind == 'ObjectId') return res.status(400).json({msg: 'Profile not found'})
    res.status(500).send('Server Error')
  }

})

//@route    DELETE api/profile
//@desc     Delete profile, user & posts
//@access   Private
router.delete('/', auth,  async (req, res) => {
  try {
    // @todo - remove user's posts
    
    // remove user's profile
    await Profile.findOneAndRemove({ user: req.user.id })

    // remove user
    await User.findOneAndRemove({ _id: req.user.id })

    res.json({ msg: 'user deleted' })
    
  } catch (err) {
    console.error(err.message)
    return res.status(500).json({msg: err.message})
  }
})

//@route    PUT api/profile/experience
//@desc     Add profile experience
//@access   Private
router.put('/experience', [auth, [
  check('title', 'Title is required').notEmpty(),
  check('company', 'Company is required').notEmpty(),
  check('from', 'From date is required and needs to be from the past').notEmpty(),
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()})
  }
  const { title, company, location, from, to, current, description } = req.body;

  const newExp = { title, company, location, from, to, current, description }
  
  try {
    const profile = await Profile.findOne({ user: req.user.id })
    profile.experience.unshift(newExp)
    await profile.save()
    res.json(profile)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

//@route    DELETE api/profile/experience/:exp_id
//@desc     delete  experience from profile
//@access   Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id })
    
    if (profile.experience) { 
      profile.experience = profile.experience.filter(
        (e) => e._id.toString() !== req.params.exp_id.toString())
    }

    await profile.save()
    return res.status(200).json(profile)

  } catch (err) {
    console.error(err.message)
    res.status(500).json({msg: 'Server error'})
  }
})

//@route    PUT api/profile/education
//@desc     Add profile education
//@access   Private
router.put('/education', [auth, [
  check('school', 'School is required').notEmpty(),
  check('degree', 'Degree is required').notEmpty(),
  check('fieldofstudy', 'Field of Study is required').notEmpty(),
  check('from', 'From date is required and needs to be from the past').notEmpty(),
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()})
  }
  const { school, degree, fieldofstudy, from, to, current, description } = req.body;

  const newEdu = { school, degree, fieldofstudy, from, to, current, description }
  
  try {
    const profile = await Profile.findOne({ user: req.user.id })
    profile.education.unshift(newEdu)
    await profile.save()
    res.json(profile)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

//@route    DELETE api/profile/education/:edu_id
//@desc     delete  education from profile
//@access   Private
router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id })
    
    if (profile.education) { 
      profile.education = profile.education.filter(
        (e) => e._id.toString() !== req.params.edu_id.toString())
    }

    await profile.save()
    return res.status(200).json(profile)

  } catch (err) {
    console.error(err.message)
    res.status(500).json({msg: 'Server error'})
  }
})

//@route    Get api/profile/github/:username
//@desc     Get user repos from Github
//@access   Public
router.get('/github/:username', async (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
      method: 'GET',
      headers: {'user-agent': 'node.js'}
    }
    request(options, (error, response, body) => {
      if (error) console.error(error)
        
      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: 'No github profile found' })
      }
      res.json(JSON.parse(body))
    })
        
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})
module.exports = router;
