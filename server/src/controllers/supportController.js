import SupportContact from "../models/SupportContact.js";

/**
 * Get support contact details (public)
 */
export const getSupportContact = async (req, res) => {
  try {
    let contact = await SupportContact.findOne();
    
    // If no record exists, create default
    if (!contact) {
      contact = await SupportContact.create({
        email: "support@coinwave247.com",
        phone: "+91-1234567890",
        telegram: "https://t.me/coinwave247",
        whatsapp: "https://wa.me/911234567890",
      });
    }

    return res.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error("❌ getSupportContact error:", error.message || error);
    return res.status(500).json({
      success: false,
      message: "Error fetching support contact",
      error: error.message || String(error),
    });
  }
};

/**
 * Update support contact details (admin only)
 */
export const updateSupportContact = async (req, res) => {
  try {
    const { email, phone, telegram, whatsapp, businessName, description } =
      req.body;

    console.log("📌 updateSupportContact called");
    console.log("   Body received:", { email, phone, telegram, whatsapp, businessName, description });
    console.log("   req.user:", req.user);

    // Validate user is authenticated
    if (!req.user) {
      console.error("❌ Not authenticated");
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Not authenticated",
      });
    }

    // Check if admin role
    const userRole = req.user.role || "user";
    console.log("   User role:", userRole);
    
    if (userRole !== "admin" && userRole !== "superadmin") {
      console.error("❌ Forbidden - User role:", userRole);
      return res.status(403).json({
        success: false,
        message: "Forbidden - Admin access required",
      });
    }

    // Helper function to check if string is valid ObjectId
    const isValidObjectId = (id) => {
      return id && String(id).match(/^[0-9a-fA-F]{24}$/);
    };

    // Find existing contact
    let contact = await SupportContact.findOne();
    
    if (!contact) {
      console.log("📝 No contact found, creating new one...");
      // Create new document
      const newContact = new SupportContact({
        email: email || "support@coinwave247.com",
        phone: phone || "+91-1234567890",
        telegram: telegram || "https://t.me/coinwave247",
        whatsapp: whatsapp || "https://wa.me/911234567890",
        businessName: businessName || "CoinWave247",
        description: description || "Your trusted cryptocurrency exchange platform",
        updatedBy: isValidObjectId(req.user._id) ? req.user._id : null,
      });
      
      const savedContact = await newContact.save();
      console.log("✅ New support contact created:", savedContact._id);
      
      return res.json({
        success: true,
        message: "Support contact created successfully",
        data: savedContact,
      });
    }

    // Update existing document
    console.log("🔄 Updating existing contact...");
    
    if (email) contact.email = email;
    if (phone) contact.phone = phone;
    if (telegram) contact.telegram = telegram;
    if (whatsapp) contact.whatsapp = whatsapp;
    if (businessName) contact.businessName = businessName;
    if (description) contact.description = description;
    
    // Only set updatedBy if admin ID is valid ObjectId
    if (isValidObjectId(req.user._id)) {
      contact.updatedBy = req.user._id;
    }

    console.log("   Updating contact fields:", { email, phone, telegram, whatsapp, businessName, description });

    const savedContact = await contact.save();

    console.log("✅ Support contact updated successfully:", savedContact._id);

    return res.json({
      success: true,
      message: "Support contact updated successfully",
      data: savedContact,
    });
  } catch (error) {
    console.error("❌ updateSupportContact error:", error);
    console.error("   Error message:", error.message);
    console.error("   Error stack:", error.stack);
    
    return res.status(500).json({
      success: false,
      message: "Error updating support contact",
      error: error.message || String(error),
    });
  }
};
