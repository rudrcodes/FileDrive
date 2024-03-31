import { httpRouter } from "convex/server";

import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
    path: "/clerk",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        const payloadString = await request.text();
        const headerPayload = request.headers;

        try {
            const result = await ctx.runAction(internal.clerk.fulfill, {
                payload: payloadString,
                headers: {
                    "svix-id": headerPayload.get("svix-id")!,
                    "svix-timestamp": headerPayload.get("svix-timestamp")!,
                    "svix-signature": headerPayload.get("svix-signature")!,
                },
            });

            switch (result.type) {
                case "user.created":
                    console.log("User created webhook called")
                    await ctx.runMutation(internal.users.createUser, {
                        //result.data.id :  this is the user id
                        tokenIdentifier: `${process.env.CLERK_HOSTNAME}|${result.data.id}`,
                        name: `${result.data.first_name} ${result.data.last_name ?? ''}`,
                        image: result.data.image_url
                    });
                    break;
                case "user.updated":
                    await ctx.runMutation(internal.users.updateUser, {
                        //result.data.id :  this is the user id
                        tokenIdentifier: `${process.env.CLERK_HOSTNAME}|${result.data.id}`,
                        name: `${result.data.first_name} ${result.data.last_name ?? ''}`,
                        image: result.data.image_url
                    });
                    break;

                case "organizationMembership.created":
                    console.log("created : ", result.data.role)

                    await ctx.runMutation(internal.users.addOrgToUser, {
                        //result.data.id :  this is the user id
                        tokenIdentifier: `${process.env.CLERK_HOSTNAME}|${result.data.public_user_data.user_id}`,
                        orgId: result.data.organization.id,
                        role: result.data.role === "org:admin" ? "admin" : "member"
                    });
                    break;

                case "organizationMembership.updated":
                    console.log("updated : ", result.data.role)

                    await ctx.runMutation(internal.users.updateRoleInOrgForUser, {
                        //result.data.id :  this is the user id
                        tokenIdentifier: `${process.env.CLERK_HOSTNAME}|${result.data.public_user_data.user_id}`,
                        orgId: result.data.organization.id,
                        role: result.data.role === "org:admin" ? "admin" : "member"
                    });
                    break;

            }

            return new Response(null, {
                status: 200,
            });
        } catch (err) {
            return new Response("Webhook Error", {
                status: 400,
            });
        }
    }),
});

export default http;