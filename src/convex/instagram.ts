"use node";

import { v } from "convex/values";
import { internalAction, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

export const fetchUserMedia = internalAction({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get Instagram integration
    const integration = await ctx.runQuery(internal.integrations.getByType, {
      type: "instagram",
    });
    
    if (!integration) {
      throw new Error("Instagram not connected");
    }
    
    try {
      // Fetch user's media from Instagram Graph API
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${integration.platformUserId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&access_token=${integration.accessToken}`
      );
      
      if (!response.ok) {
        throw new Error(`Instagram API error: ${await response.text()}`);
      }
      
      const data = await response.json();
      
      // Filter for reels only
      const reels = data.data.filter((media: any) => 
        media.media_type === "VIDEO" || media.media_type === "REELS"
      );
      
      // Store or update media in database
      for (const reel of reels) {
        await ctx.runMutation(internal.instagram.upsertMedia, {
          userId: args.userId,
          mediaId: reel.id,
          caption: reel.caption || "",
          mediaType: reel.media_type,
          mediaUrl: reel.media_url,
          thumbnailUrl: reel.thumbnail_url,
          permalink: reel.permalink,
          timestamp: reel.timestamp,
          likeCount: reel.like_count || 0,
          commentsCount: reel.comments_count || 0,
        });
      }
      
      return reels;
    } catch (error) {
      console.error("Error fetching Instagram media:", error);
      throw error;
    }
  },
});

export const upsertMedia = internalAction({
  args: {
    userId: v.id("users"),
    mediaId: v.string(),
    caption: v.string(),
    mediaType: v.string(),
    mediaUrl: v.string(),
    thumbnailUrl: v.optional(v.string()),
    permalink: v.string(),
    timestamp: v.string(),
    likeCount: v.number(),
    commentsCount: v.number(),
  },
  handler: async (ctx, args) => {
    // This would store media info - for now we'll just return it
    // In production, you'd want to cache this in a media table
    return args;
  },
});
