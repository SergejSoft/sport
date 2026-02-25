import { prisma } from "@/lib/prisma";

export type UserType = "Admin" | "Club owner" | "Participant";

export type AccountTypes = {
  isPlatformAdmin: boolean;
  isClubOwner: boolean;
  isParticipant: boolean;
  /** Display label: Admin > Club owner > Participant */
  label: UserType;
};

/**
 * Compute user types for an account. Used for display and access control.
 * - Admin: platform admin (isPlatformAdmin).
 * - Club owner: has at least one OrganisationMember with role OWNER or ADMIN.
 * - Participant: default (everyone can participate in bookings).
 */
export async function getAccountTypes(accountId: string): Promise<AccountTypes> {
  const [account, memberships] = await Promise.all([
    prisma.account.findUnique({
      where: { id: accountId },
      select: { isPlatformAdmin: true },
    }),
    prisma.organisationMember.findMany({
      where: { accountId },
      select: { role: true },
    }),
  ]);

  const isPlatformAdmin = account?.isPlatformAdmin ?? false;
  const isClubOwner = memberships.some(
    (m) => m.role === "OWNER" || m.role === "ADMIN"
  );
  const isParticipant = true; // everyone is a participant (can book)

  let label: UserType = "Participant";
  if (isPlatformAdmin) label = "Admin";
  else if (isClubOwner) label = "Club owner";

  return { isPlatformAdmin, isClubOwner, isParticipant, label };
}
