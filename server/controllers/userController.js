const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Add a new address
// @route   POST /api/users/address
// @access  Private
const addAddress = asyncHandler(async (req, res) => {
    // console.log("Adding address for user:", req.user._id);
    const user = await User.findById(req.user._id);

    if (user) {
        const { label, fullName, phoneNumber, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = req.body;
        // console.log("Address payload:", req.body);

        const newAddress = {
            label,
            fullName,
            phoneNumber,
            addressLine1,
            addressLine2: addressLine2 || "", // Ensure it's not undefined
            city,
            state,
            postalCode,
            country,
            isDefault: isDefault || false // Ensure boolean
        };

        if (!user.addresses) {
            user.addresses = [];
        }

        if (isDefault) {
            user.addresses.forEach(addr => {
                addr.isDefault = false;
            });
        }

        user.addresses.push(newAddress);
        console.log("Saving user with new address...");
        try {
            const updatedUser = await user.save();
            console.log("User saved successfully.");
            res.json(updatedUser.addresses);
        } catch (error) {
            console.error("Error saving user address:", error);
            res.status(500);
            throw new Error('Failed to save address: ' + error.message);
        }
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Delete address
// @route   DELETE /api/users/address/:id
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.id);
        const updatedUser = await user.save();
        res.json(updatedUser.addresses);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update address
// @route   PUT /api/users/address/:id
// @access  Private
const updateAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const address = user.addresses.id(req.params.id);

        if (address) {
            address.label = req.body.label || address.label;
            address.fullName = req.body.fullName || address.fullName;
            address.phoneNumber = req.body.phoneNumber || address.phoneNumber;
            address.addressLine1 = req.body.addressLine1 || address.addressLine1;
            address.addressLine2 = req.body.addressLine2 || address.addressLine2;
            address.city = req.body.city || address.city;
            address.state = req.body.state || address.state;
            address.postalCode = req.body.postalCode || address.postalCode;
            address.country = req.body.country || address.country;

            if (req.body.isDefault) {
                user.addresses.forEach(addr => {
                    addr.isDefault = false;
                });
                address.isDefault = true;
            } else if (req.body.isDefault === false) {
                address.isDefault = false;
            }

            const updatedUser = await user.save();
            res.json(updatedUser.addresses);
        } else {
            res.status(404);
            throw new Error('Address not found');
        }
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = {
    addAddress,
    deleteAddress,
    updateAddress
};
