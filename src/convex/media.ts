import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { internal } from "./_generated/api";
import { getCurrentUser } from "./users";

export const listReels = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    
    return await ctx.db
      .query("instagramMedia")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const syncInstagramMedia = action({
  args: {},
  handler: async (ctx) => {
    // Get current user ID from auth
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Get user from database
    const user = await ctx.runQuery(internal.users.getCurrentUserInternal);
    if (!user) throw new Error("User not found");
    
    await ctx.runAction(internal.instagram.fetchUserMedia, {
      userId: user._id,
    });
  },
});

export const getFlowsForPost = query({
  args: { postId: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    
    const flows = await ctx.db
      .query("flows")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    
    return flows.filter(flow => flow.trigger.postId === args.postId);
  },
});
