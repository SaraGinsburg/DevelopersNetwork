const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator')

const auth = require('../../middleware/auth')
const User = require('../../models/User')
const Profile = require('../../models/Profile')

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
    let profile = await Profile.findOne({user: req.user.id})

    if(profile){
      //update
      profile = await Profile.findOneAndUpdate(
        {user: req.user.id},
        {$set: profileFields},
        {new: true}
      )
      return res.json(profile)
    }
    //create
    profile = await new Profile(profileFields)
    
    await profile.save()
    
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

module.exports = router;
