// "use client"
import { ConvexError, v } from "convex/values"
import { MutationCtx, QueryCtx, internalMutation, mutation, query } from "./_generated/server"
import { getUser } from "./users";
import { UserIdentity } from "convex/server";
import { fileTypes } from "./schema";
import { Doc, Id } from "./_generated/dataModel";
import { access } from "fs";


export const hasAccessToOrg = async (
    ctx: QueryCtx | MutationCtx,

    orgId?: string) => {

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        return null
    }
    // const user = await getUser(ctx, identity.tokenIdentifier);
    const user = await ctx.db.query("users").withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)).first()
    if (!user) {
        return null
    }

    // This hasAccess var shows if the user has the right to create a file in that org
    const hasAccess = user.orgIds.some((item) => item.orgId === orgId) || user.tokenIdentifier.includes(orgId!);

    if (!hasAccess) return null

    return { user }

}


export const generateUploadUrl = mutation(async (ctx) => {

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        throw new ConvexError("Not authorised");
    }
    return await ctx.storage.generateUploadUrl();
});

// To add files in the db
export const createFile = mutation({
    args: {
        name: v.string(),
        orgId: v.string(),
        fileId: v.id("_storage"),
        type: fileTypes,
        fileUrlRudransh: v.optional(v.union(v.string(), v.null())),
    },
    handler: async (ctx, args) => {

        const hasAccess = await hasAccessToOrg(ctx, args.orgId)
        if (!hasAccess) {
            throw new ConvexError("You do not have access to this org")
        }
        // Did to get the url so that the files can be opened in the browser
        let fileUrlRudransh = await ctx.storage.getUrl(args.fileId);
        // let fileUrlRudransh = (args.type === "image") ? await ctx.storage.getUrl(args.fileId) : null;
        // let fileUrlRudransh = (args.type === "image") ? await ctx.storage.getUrl(args.fileId) : null;
        // console.log("fileUrlRudransh : ", fileUrlRudransh)

        await ctx.db.insert("files", {
            orgId: args.orgId!,
            name: args.name,
            fileId: args.fileId,
            type: args.type,
            fileUrlRudransh,
            userId: hasAccess.user._id
        })
    }
})

//To fetch all the files present in the db in that table
// Yeh rerender kr rha h jyada baar , jiski vjh se isme pass data undefined ho rha h
export const getFile = query({
    args: {
        orgId: v.string(),
        query: v.optional(v.string()),
        favorites: v.optional(v.boolean()),
        deletedOnly: v.optional(v.boolean()),
        type: v.optional(fileTypes)
    },
    handler: async (ctx, args) => {

        const hasAccess = await hasAccessToOrg(ctx, args.orgId)
        if (!hasAccess) {
            return []
        }

        let allfiles = await ctx.db.query("files").withIndex("by_orgId", q => {
            return q.eq('orgId', args.orgId!)
        }).collect()

        const query = args.query
        if (query) {
            allfiles = allfiles.filter((file) => file.name.toLowerCase().includes(query.toLowerCase()))
        }
        if (args.favorites) {

            const favoriteFiles = await ctx.db.query("favorites").withIndex("by_userId_orgId_fileId",
                (q) => q.eq("userId", hasAccess.user._id!).eq("orgId", args.orgId)).collect()

            // What is done here?
            // "some" method in JS : some() method, which checks if at least one element in an array satisfies a provided condition. It returns true if at least one element passes the test, otherwise false.

            // "filter" method in JS : .filter() method is used to create a new array with all elements that pass a certain condition. It iterates through each element in the array and invokes a callback function for each element. The callback function should return true to include the element in the new array or false to exclude it.
            allfiles = allfiles.filter((file) =>
                favoriteFiles.some((favorite) => favorite.fileId === file._id))
        }
        if (args.deletedOnly) {
            allfiles = allfiles.filter((file) => file.shouldDelete)
        } else {
            allfiles = allfiles.filter((file) => !file.shouldDelete)
        }

        if (args.type) {
            //then filter files based on their type
            allfiles = allfiles.filter((file) => file.type == args.type)
        }

        return allfiles
    }
})

// For cronJob to delete all the files which are marked to be deletd
export const deleteAllFiles = internalMutation({
    args: {},
    handler: async (ctx, args) => {
        //check if user is logged in and has access to the org

        const files = await ctx.db.query("files").withIndex("by_shouldDelete", q => q.eq("shouldDelete", true)).collect()

        await Promise.all(files.map(async (file) => {
            await ctx.storage.delete(file.fileId)
            return await ctx.db.delete(file._id)
        }))
    }
})

function assertCanDeleteFile(user: Doc<"users">, file: Doc<"files">) {
    const canDelete = user.orgIds.find((org) => org.orgId === file.orgId)?.role === "admin" || file.userId === user._id

    if (!canDelete) {
        throw new ConvexError("Doen't have access to delete file.")
    }
}

export const deleteFile = mutation({
    args: { fileId: v.id("files") },
    handler: async (ctx, args) => {
        //check if user is logged in and has access to the org

        const access = await hasAccessToFile(ctx, args.fileId)
        if (!access) {
            throw new ConvexError("Doesn't have access to file.")
        }

        assertCanDeleteFile(access.user, access.file)




        // await ctx.db.delete(args.fileId)
        //instead of deleting we will set shouldDelete to true
        await ctx.db.patch(args.fileId,
            { shouldDelete: true }
        )
    }
})

export const restoreFile = mutation({
    args: { fileId: v.id("files") },
    handler: async (ctx, args) => {
        //check if user is logged in and has access to the org

        const access = await hasAccessToFile(ctx, args.fileId)
        if (!access) {
            throw new ConvexError("Doesn't have access to file.")
        }

        assertCanDeleteFile(access.user, access.file)

        // await ctx.db.delete(args.fileId)
        //instead of deleting we will set shouldDelete to true
        await ctx.db.patch(args.fileId,
            { shouldDelete: false }
        )
    }
})





export const toggleFavorite = mutation({
    args: { fileId: v.id("files") },
    handler: async (ctx, args) => {
        //check if user is logged in and has access to the org
        const access = await hasAccessToFile(ctx, args.fileId)
        if (!access) {
            throw new ConvexError("Doesn't have access to file.")
        }

        //checking to see if file is alredy in the favorite table 
        const favorite = await ctx.db.query("favorites").withIndex("by_userId_orgId_fileId",
            (q) => q.eq("userId", access.user._id).eq("orgId", access.file.orgId).eq("fileId", access.file._id)
        ).first();

        if (!favorite) {
            //if there is no favorite , create one
            await ctx.db.insert("favorites", {
                fileId: access.file._id,
                userId: access.user._id,
                orgId: access.file.orgId
            })
        } else {
            //if it already exists , we will unfav it by deleting it
            await ctx.db.delete(favorite._id)
        }
    }
})

export const getAllFavorites = query({
    args: { orgId: v.string() },
    handler: async (ctx, args) => {

        //check if user is logged in and has access to the org
        const hasAccess = await hasAccessToOrg(ctx, args.orgId)
        if (!hasAccess) {
            return []
        }

        //checking to see if file is alredy in the favorite table 
        const favorites = await ctx.db.query("favorites").withIndex("by_userId_orgId_fileId",
            (q) => q.eq("userId", hasAccess.user._id).eq("orgId", args.orgId)
        ).collect();

        return favorites
    }
})



//Utility function
async function hasAccessToFile(ctx: QueryCtx | MutationCtx, fileId: Id<"files">) {

    const file = await ctx.db.get(fileId)
    if (!file) {
        return null;
        // throw new ConvexError("This file doesn't exist.")
    }

    const hasAccess = await hasAccessToOrg(ctx, file.orgId)
    if (!hasAccess) {
        return null;
        // throw new ConvexError("You do not have access to delete this file.")
    }

    return { user: hasAccess.user, file }

}