import { ConvexError, v } from "convex/values";
import { MutationCtx, QueryCtx, internalMutation, query } from "./_generated/server";
import { GenericMutationCtx } from "convex/server";
import { roles } from "./schema";

export const getUser = async (ctx: QueryCtx | MutationCtx, tokenIdentifier: string) => {

    const user = await ctx.db.query("users").withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", tokenIdentifier)).first()

    if (!user) throw new ConvexError("Expected user to be defined (User doesn't exist)")
    return user
}

export const createUser = internalMutation({
    args: { tokenIdentifier: v.string(), name: v.string(), image: v.string() },
    handler: async (ctx, args) => {
        // console.log("args.tokenIdentifier from users.ts : ", args.tokenIdentifier)

        await ctx.db.insert("users", {
            tokenIdentifier: args.tokenIdentifier,
            orgIds: [],
            name: args.name,
            image: args.image
        })
    }
})
export const updateUser = internalMutation({
    args: { tokenIdentifier: v.string(), name: v.string(), image: v.string() },
    handler: async (ctx, args) => {
        // console.log("args.tokenIdentifier from users.ts : ", args.tokenIdentifier)

        const user = await ctx.db.query("users").withIndex("by_tokenIdentifier", q =>
            q.eq("tokenIdentifier", args.tokenIdentifier)).first();

        if (!user) {
            // return null
            throw new ConvexError("No user found")
        }

        await ctx.db.patch(user?._id, {
            name: args.name,
            image: args.image
        })
    }
})


export const addOrgToUser = internalMutation({
    args: {
        tokenIdentifier: v.string(),
        orgId: v.string(),
        role: roles
    },
    handler: async (ctx, args) => {
        // first get the user info

        // console.log("token from users.ts : ", args.tokenIdentifier)
        // console.log("identity.tokenIdentifier : ", identity?.tokenIdentifier)
        // console.log("args.tokenIdentifier : ", args.tokenIdentifier)


        // q.eq("tokenIdentifier", args.tokenIdentifier)).first()
        const user = await getUser(ctx, args.tokenIdentifier);


        // console.log("user from users.ts : ", user)

        // await ctx.db.insert("users", {
        //     tokenIdentifier: args.tokenIdentifier as string,
        //     orgIds: [...user?.orgIds, args.orgId]
        // })

        await ctx.db.patch(user._id, {
            orgIds: [...user?.orgIds, { orgId: args.orgId, role: args.role }]
        })
    }
})

export const updateRoleInOrgForUser = internalMutation({
    args: {
        tokenIdentifier: v.string(),
        orgId: v.string(),
        role: roles
    },
    handler: async (ctx, args) => {
        console.log("Updated called");
        const user = await getUser(ctx, args.tokenIdentifier);

        const org = user.orgIds.find((org) => org.orgId === args.orgId)
        if (!org) {
            throw new ConvexError("Expected on org for user but not found")
        }

        org.role = args.role

        await ctx.db.patch(user._id, {
            orgIds: user?.orgIds
        })
    }
})


export const getUserProfile = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {

        const user = await ctx.db.get(args.userId)

        return {
            name: user?.name,
            image: user?.image,
        }
    }
})

export const getMe = query({
    args: {},
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        // If not logged in
        if (!identity) return null;

        const user = await getUser(ctx, identity.tokenIdentifier)

        if (!user) return null;

        return user;
    }
})