import prisma from '../database/prisma.js';

// Helper to normalize text fields
function toTextOrNull(value) {
  return value && value.trim() ? value.trim() : null;
}

export async function createClaimRequest(payload) {
  try {
    // Note: university_claim_requests table may need to be added to schema
    // For now, using university_claims directly
    const claim = await prisma.universityClaim.create({
      data: {
        universityId: payload.university_id || null,
        userId: payload.user_id || null, // Assuming user_id is available
        email: payload.requester_email || payload.email || '',
        phone: toTextOrNull(payload.requester_phone || payload.phone),
        position: toTextOrNull(payload.requester_position || payload.position),
        message: payload.message || null,
        status: 'pending',
      },
    });
    return claim;
  } catch (error) {
    throw error;
  }
}

export async function getClaimRequestById(id) {
  try {
    const claim = await prisma.universityClaim.findUnique({
      where: { id },
    });
    return claim || null;
  } catch (error) {
    throw error;
  }
}

export async function getClaimRequestsByUser(userId) {
  try {
    const claims = await prisma.universityClaim.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return claims || [];
  } catch (error) {
    throw error;
  }
}

export async function getAllClaimRequests(status = null) {
  try {
    const where = status ? { status } : {};
    const claims = await prisma.universityClaim.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return claims || [];
  } catch (error) {
    throw error;
  }
}

export async function updateClaimRequestStatus(id, status, adminUserId, adminNotes = null) {
  try {
    const update = {
      status,
      reviewedBy: adminUserId,
      reviewedAt: new Date(),
    };

    if (adminNotes !== null) {
      update.adminNotes = adminNotes;
    }

    const claim = await prisma.universityClaim.update({
      where: { id },
      data: update,
    });

    // If approved, create the claim (already created above)
    // Note: This logic may need adjustment based on schema

    return claim;
  } catch (error) {
    throw error;
  }
}

export async function createClaim(claimRequest) {
  try {
    // First, check if a claim already exists
    const existingClaim = await getClaimByUniversityOrGroup(
      claimRequest.university_id,
      null
    );

    if (existingClaim) {
      throw new Error('This university/group is already claimed');
    }

    // Get user by email if needed
    let userId = claimRequest.user_id;
    if (!userId && claimRequest.requester_email) {
      const user = await prisma.user.findFirst({
        where: { email: claimRequest.requester_email },
        select: { id: true },
      });
      if (!user) {
        throw new Error('User not found for claim request');
      }
      userId = user.id;
    }

    const claim = await prisma.universityClaim.create({
      data: {
        universityId: claimRequest.university_id || null,
        userId: userId,
        email: claimRequest.requester_email || claimRequest.email || '',
        phone: toTextOrNull(claimRequest.requester_phone || claimRequest.phone),
        position: toTextOrNull(claimRequest.requester_position || claimRequest.position),
        status: 'active',
      },
    });
    return claim;
  } catch (error) {
    throw error;
  }
}

export async function getClaimByUniversityOrGroup(universityId, universityGroupId) {
  try {
    const where = {
      status: 'active',
    };

    if (universityId) {
      where.universityId = universityId;
    } else if (universityGroupId) {
      // Note: university_group_id may need schema update
      return null;
    } else {
      return null;
    }

    const claim = await prisma.universityClaim.findFirst({
      where,
    });

    return claim || null;
  } catch (error) {
    throw error;
  }
}

export async function getClaimByUserId(userId) {
  try {
    const claims = await prisma.universityClaim.findMany({
      where: {
        userId,
        status: 'active',
      },
    });
    return claims || [];
  } catch (error) {
    throw error;
  }
}

export async function updateClaimStatus(id, status) {
  try {
    const claim = await prisma.universityClaim.update({
      where: { id },
      data: { status },
    });
    return claim;
  } catch (error) {
    throw error;
  }
}
