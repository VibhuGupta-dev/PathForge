// file: backend/controller/Communitycontroller.js
import Community from "../models/CommunityModel.js";

// Add community member - Only logged in users
export const addCommunityMember = async (req, res) => {
  try {
    const currentUserEmail = req.user?.email;
    
    if (!currentUserEmail) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    // Check if user already has a profile
    const existingProfile = await Community.findOne({ email: currentUserEmail });
    if (existingProfile) {
      return res.status(400).json({ 
        success: false, 
        message: "You already have a community profile" 
      });
    }

    const newMember = new Community({
      name: req.body.name,
      email: currentUserEmail,
      about: req.body.about, // Added about field
      linkedin: req.body.linkedin,
      github: req.body.github,
      profileimg: req.file ? req.file.path : null,
    });

    await newMember.save();
    res.status(201).json({ success: true, data: newMember });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get all community members
export const getCommunityMembers = async (req, res) => {
  try {
    const members = await Community.find().sort({ createdAt: -1 }).limit(10);
    res.json({ success: true, data: members });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single community member by ID
export const getCommunityMemberById = async (req, res) => {
  try {
    const member = await Community.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }
    res.json({ success: true, data: member });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update community member - Only creator can edit
export const updateCommunityMember = async (req, res) => {
  try {
    const currentUserEmail = req.user?.email;
    
    if (!currentUserEmail) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const existingMember = await Community.findById(req.params.id);
    if (!existingMember) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    if (existingMember.email !== currentUserEmail) {
      return res.status(403).json({ 
        success: false, 
        message: "You can only edit your own profile" 
      });
    }

    const updatedData = {
      name: req.body.name,
      about: req.body.about, // Added about field
      linkedin: req.body.linkedin,
      github: req.body.github,
    };

    if (req.file) {
      updatedData.profileimg = req.file.path;
    }

    const member = await Community.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    
    res.json({ success: true, data: member });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete community member - Only creator can delete
export const deleteCommunityMember = async (req, res) => {
  try {
    const currentUserEmail = req.user?.email;
    
    if (!currentUserEmail) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const existingMember = await Community.findById(req.params.id);
    if (!existingMember) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    if (existingMember.email !== currentUserEmail) {
      return res.status(403).json({ 
        success: false, 
        message: "You can only delete your own profile" 
      });
    }

    await Community.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Profile deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};