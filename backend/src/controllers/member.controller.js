import {
    findMemberProfileByUserId,
    updateMemberProfileByUserId
} from "../models/member.model.js";

function sanitizeMemberProfile(profile) {
    if (!profile) {
        return null;
    }

    return {
        id: profile.id,
        memberId: profile.member_id,
        fullName: profile.full_name,
        phone: profile.phone,
        email: profile.email,
        address: profile.address,
        emergencyContact: profile.emergency_contact,
        role: profile.role,
        status: profile.status,
        joinedAt: profile.joined_at,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at
    };
}

export async function getMemberProfile(req, res, next) {
    try {
        const profile = await findMemberProfileByUserId(req.auth.userId);

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Member profile was not found."
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                profile: sanitizeMemberProfile(profile)
            }
        });
    } catch (error) {
        next(error);
    }
}

export async function updateMemberProfile(req, res, next) {
    try {
        const {
            fullName,
            phone,
            address,
            emergencyContact
        } = req.body;

        if (
            fullName !== undefined &&
            (typeof fullName !== "string" || fullName.trim().length < 2)
        ) {
            return res.status(400).json({
                success: false,
                message: "Full name must contain at least 2 characters."
            });
        }

        if (
            phone !== undefined &&
            (
                typeof phone !== "string" ||
                phone.trim().length < 7 ||
                phone.trim().length > 30
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Phone number must contain between 7 and 30 characters."
            });
        }

        if (
            address !== undefined &&
            address !== null &&
            typeof address !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Address must be a text value."
            });
        }

        if (
            emergencyContact !== undefined &&
            emergencyContact !== null &&
            typeof emergencyContact !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Emergency contact must be a text value."
            });
        }

        const currentProfile = await findMemberProfileByUserId(
            req.auth.userId
        );

        if (!currentProfile) {
            return res.status(404).json({
                success: false,
                message: "Member profile was not found."
            });
        }

        const updatedProfile = await updateMemberProfileByUserId(
            req.auth.userId,
            {
                fullName:
                    fullName !== undefined
                        ? fullName.trim()
                        : currentProfile.full_name,

                phone:
                    phone !== undefined
                        ? phone.trim()
                        : currentProfile.phone,

                address:
                    address !== undefined
                        ? address === null
                            ? null
                            : address.trim()
                        : currentProfile.address,

                emergencyContact:
                    emergencyContact !== undefined
                        ? emergencyContact === null
                            ? null
                            : emergencyContact.trim()
                        : currentProfile.emergency_contact
            }
        );

        if (!updatedProfile) {
            return res.status(404).json({
                success: false,
                message: "Member profile could not be updated."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            data: {
                profile: sanitizeMemberProfile(updatedProfile)
            }
        });
    } catch (error) {
        next(error);
    }
}