import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";


export const fileTypes = v.union(v.literal('image'), v.literal('pdf'), v.literal('csv'));
export const roles = v.union(v.literal('admin'), v.literal('member'))
export default defineSchema({
    files: defineTable({
        name: v.string(),
        type: fileTypes,
        orgId: v.string(),
        fileId: v.id("_storage"),
        fileUrlRudransh: v.union(v.string(), v.null()),
        shouldDelete: v.optional(v.boolean()),
        userId: v.id("users")
    }).index("by_orgId", ["orgId"])
        .index("by_shouldDelete", ["shouldDelete"]),
    users: defineTable({
        tokenIdentifier: v.string(),
        name: v.optional(v.string()),
        image: v.optional(v.string()),
        orgIds: v.array(v.object({
            orgId: v.string(),
            role: roles
        })),
    }).index("by_tokenIdentifier", ["tokenIdentifier"]),
    favorites: defineTable({
        fileId: v.id("files"),
        userId: v.id("users"),
        orgId: v.string()
    }).index("by_userId_orgId_fileId", ["userId", "orgId", "fileId"])
});

/*
{
  tokenIdentifier: 'https://verified-collie-80.clerk.accounts.dev|user_2ds5yRujXkloSKH5syhbClQfKUB',
  issuer: 'https://verified-collie-80.clerk.accounts.dev',
  subject: 'user_2ds5yRujXkloSKH5syhbClQfKUB',
  name: 'Rudransh Aggarwal',
  givenName: 'Rudransh',
  familyName: 'Aggarwal',
  pictureUrl: 'https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18yZHM1eVhVdE1XSDV2NTFZVjZaYnd6d0pOWngifQ',
  email: 'aggarwalrudransh@gmail.com',
  emailVerified: true,
  phoneNumberVerified: false,
  updatedAt: '2024-03-18T17:49:59+00:00'
}

*/