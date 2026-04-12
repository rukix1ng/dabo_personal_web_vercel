type InvitationAssetFields = {
  image?: string | null;
  image_en?: string | null;
  poster?: string | null;
  poster_en?: string | null;
};

export function getInvitationImageUrl(invitation: InvitationAssetFields): string | null {
  return invitation.image_en || invitation.image || null;
}

export function getInvitationPosterUrl(invitation: InvitationAssetFields): string | null {
  return invitation.poster_en || invitation.poster || null;
}
